from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app import models, schemas

def process_pos_sale(
    db: Session, 
    sale_data: schemas.TransactionCreate, 
    cashier_name: str
) -> models.Transaction:
    """
    Executes an atomic POS sale.
    - Locks product rows during update to prevent race conditions & overselling.
    - Deducts inventory and logs auditable StockMovement.
    - Preserves historical cost_price (COGS) at the moment of sale.
    - If paid via Store Credit (Udhaar), atomically increases customer.balance.
    - Ensures all changes commit together or roll back completely on failure.
    """
    if not sale_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction must contain at least one product item."
        )

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%I:%M %p")

    # Generate sequential unique invoice number
    tx_count = db.query(models.Transaction).count()
    invoice_num = f"INV-2026-{1050 + tx_count + 1}"

    # Calculate subtotal and prepare items
    calculated_subtotal = 0.0
    transaction_items: List[models.TransactionItem] = []

    try:
        # Atomic lock and stock update for each item
        for item in sale_data.items:
            # Query product with row lock if supported
            query = db.query(models.Product).filter(models.Product.id == item.product_id)
            try:
                prod = query.with_for_update().first()
            except Exception:
                # SQLite fallback if dialect doesn't support SELECT FOR UPDATE
                prod = query.first()

            if not prod:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID '{item.product_id}' was not found in catalog."
                )

            # Prevent overselling stock
            if prod.stock < item.quantity and not prod.allow_backorder:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient inventory for '{prod.name}' (SKU: {prod.sku}). Available: {prod.stock}, requested: {item.quantity}."
                )

            item_total = item.unit_price * item.quantity
            calculated_subtotal += item_total

            previous_stock = prod.stock
            prod.stock = max(0, prod.stock - item.quantity)

            # Recalculate status
            if prod.stock == 0:
                prod.status = "out_of_stock"
            elif prod.stock <= prod.min_stock_level:
                prod.status = "low_stock"
            else:
                prod.status = "in_stock"

            # Create stock movement audit record
            stock_mv = models.StockMovement(
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                date=f"{date_str} {time_str}",
                type="sale",
                quantity_delta=-item.quantity,
                previous_stock=previous_stock,
                new_stock=prod.stock,
                reason=f"POS Sale Invoice {invoice_num}",
                recorded_by=cashier_name
            )
            db.add(stock_mv)

            # Record transaction item with historical cost price preserved
            tx_item = models.TransactionItem(
                product_id=prod.id,
                name=prod.name,
                sku=prod.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                cost_price=prod.cost_price,  # Preserved historical COGS!
                total=item_total,
                unit=prod.unit
            )
            transaction_items.append(tx_item)

        # Calculate final total
        grand_total = max(0.0, (calculated_subtotal - sale_data.discount) + sale_data.tax)

        # Create Transaction record
        new_tx = models.Transaction(
            invoice_number=invoice_num,
            date=date_str,
            time=time_str,
            customer_id=sale_data.customer_id,
            customer_name=sale_data.customer_name or "Walk-in Customer",
            customer_phone=sale_data.customer_phone,
            subtotal=calculated_subtotal,
            discount=sale_data.discount,
            tax=sale_data.tax,
            total=grand_total,
            payment_method=sale_data.payment_method,
            status="Completed",
            cashier=cashier_name
        )
        db.add(new_tx)
        db.flush()  # Assigns new_tx.id

        # Attach transaction items
        for ti in transaction_items:
            ti.transaction_id = new_tx.id
            db.add(ti)

        # Update Customer statistics and Udhaar ledger if applicable
        if sale_data.customer_id and sale_data.customer_id != "walk-in":
            customer = db.query(models.Customer).filter(models.Customer.id == sale_data.customer_id).first()
            if customer:
                customer.total_spent += grand_total
                customer.total_orders += 1
                customer.last_purchase_date = date_str
                
                # If paid with Store Credit (Udhaar), increment customer.balance
                if sale_data.payment_method == "Store Credit (Udhaar)":
                    customer.balance += grand_total

        db.commit()
        db.refresh(new_tx)
        return new_tx

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction processing failed: {str(exc)}"
        )
