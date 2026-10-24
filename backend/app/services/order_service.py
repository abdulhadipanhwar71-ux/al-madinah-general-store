from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app import models, schemas

def create_store_order(
    db: Session,
    order_data: schemas.StoreOrderCreate,
    recorded_by: str = "Web Cart / Customer"
) -> models.StoreOrder:
    """
    Creates a new store order with IDEMPOTENCY check.
    If idempotency_key is provided and already exists, returns existing order
    to prevent duplicate submissions from network retries.
    """
    if order_data.idempotency_key:
        existing = db.query(models.StoreOrder).filter(
            models.StoreOrder.idempotency_key == order_data.idempotency_key
        ).first()
        if existing:
            return existing

    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item."
        )

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d %I:%M %p")

    # Generate sequential order number
    order_count = db.query(models.StoreOrder).count()
    order_num = f"ORD-{9020 + order_count + 1}"

    try:
        new_order = models.StoreOrder(
            order_number=order_num,
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            delivery_address=order_data.delivery_address,
            order_notes=order_data.order_notes,
            subtotal=order_data.subtotal,
            delivery_charges=order_data.delivery_charges,
            total=order_data.total,
            payment_method=order_data.payment_method,
            payment_status="Pending",
            status="New",
            channel=order_data.channel,
            idempotency_key=order_data.idempotency_key
        )
        db.add(new_order)
        db.flush()

        # Add order items
        for item in order_data.items:
            valid_prod_id = None
            if item.product_id:
                exists = db.query(models.Product.id).filter(models.Product.id == item.product_id).first()
                if exists:
                    valid_prod_id = item.product_id

            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=valid_prod_id,
                name=item.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=item.total,
                unit=item.unit
            )
            db.add(order_item)

        # Initial status history record
        history_entry = models.OrderStatusHistory(
            order_id=new_order.id,
            status="New",
            timestamp=date_str,
            updated_by=recorded_by,
            note="Order submitted via web cart or channel"
        )
        db.add(history_entry)

        db.commit()
        db.refresh(new_order)
        return new_order

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order creation failed: {str(exc)}"
        )

def update_order_status(
    db: Session,
    order_id: str,
    new_status: str,
    note: str = None,
    updated_by: str = "Store Staff"
) -> models.StoreOrder:
    """
    Updates the status of an order and appends an auditable OrderStatusHistory log.
    """
    order = db.query(models.StoreOrder).filter(models.StoreOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )

    now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")

    try:
        order.status = new_status
        if new_status == "Completed":
            order.payment_status = "Paid"

        history_entry = models.OrderStatusHistory(
            order_id=order.id,
            status=new_status,
            timestamp=now_str,
            updated_by=updated_by,
            note=note or f"Status updated to {new_status}"
        )
        db.add(history_entry)

        db.commit()
        db.refresh(order)
        return order

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(exc)}"
        )
