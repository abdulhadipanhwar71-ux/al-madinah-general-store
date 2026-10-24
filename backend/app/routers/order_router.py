from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.services.order_service import create_store_order, update_order_status

router = APIRouter(prefix="/api/admin/orders", tags=["Admin Orders Management"])

@router.get("", response_model=List[schemas.StoreOrderResponse])
def get_orders(
    status_filter: Optional[str] = None,
    channel: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.StoreOrder)

    if status_filter and status_filter != "All":
        query = query.filter(models.StoreOrder.status == status_filter)

    if channel and channel != "All":
        query = query.filter(models.StoreOrder.channel == channel)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (models.StoreOrder.order_number.ilike(term)) |
            (models.StoreOrder.customer_name.ilike(term)) |
            (models.StoreOrder.customer_phone.ilike(term)) |
            (models.StoreOrder.delivery_address.ilike(term))
        )

    return query.order_by(models.StoreOrder.created_at.desc()).limit(limit).all()

@router.get("/{order_id}", response_model=schemas.StoreOrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    order = db.query(models.StoreOrder).filter(models.StoreOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found."
        )
    return order

@router.post("", response_model=schemas.StoreOrderResponse, status_code=status.HTTP_201_CREATED)
def create_manual_order(
    order_in: schemas.StoreOrderCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    """
    Creates an order manually (counter/phone) with idempotency check.
    """
    order = create_store_order(db, order_in, recorded_by=f"Staff ({current_user.name})")
    return order

@router.patch("/{order_id}/status", response_model=schemas.StoreOrderResponse)
def change_order_status(
    order_id: str,
    status_in: schemas.StoreOrderUpdateStatus,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    """
    Transitions order status and records an audit log entry.
    """
    order = update_order_status(
        db=db,
        order_id=order_id,
        new_status=status_in.status,
        note=status_in.note,
        updated_by=current_user.name
    )
    return order

@router.delete("/{order_id}")
def delete_order(
    order_id: str,
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    order = db.query(models.StoreOrder).filter(models.StoreOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found."
        )

    db.delete(order)
    db.commit()
    return {"message": f"Order #{order.order_number} deleted successfully."}
