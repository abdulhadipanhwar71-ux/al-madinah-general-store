from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.services.sales_service import process_pos_sale

router = APIRouter(prefix="/api/admin/transactions", tags=["Admin Sales & POS"])

@router.get("", response_model=List[schemas.TransactionResponse])
def get_transactions(
    date: Optional[str] = None,
    customer_id: Optional[str] = None,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    if date:
        query = query.filter(models.Transaction.date == date)
    if customer_id:
        query = query.filter(models.Transaction.customer_id == customer_id)
    return query.order_by(models.Transaction.created_at.desc()).limit(limit).all()

@router.get("/{tx_id}", response_model=schemas.TransactionResponse)
def get_transaction_by_id(
    tx_id: str,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID '{tx_id}' was not found."
        )
    return tx

@router.post("", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_data: schemas.TransactionCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    """
    Processes an atomic POS sale:
    - Locks inventory rows to prevent race conditions.
    - Atomically deducts stock & logs movements.
    - Preserves historical cost_price at checkout time.
    - Updates customer stats and Udhaar balance if on credit.
    """
    tx = process_pos_sale(db, sale_data, cashier_name=current_user.name)
    return tx
