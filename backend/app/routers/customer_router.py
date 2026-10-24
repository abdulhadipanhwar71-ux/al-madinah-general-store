from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.services.customer_service import (
    process_customer_repayment,
    update_reminder_timestamp
)

router = APIRouter(prefix="/api/admin", tags=["Admin Customers & Udhaar Ledger"])

@router.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(
    has_balance_only: bool = False,
    search: Optional[str] = None,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.Customer)
    if has_balance_only:
        query = query.filter(models.Customer.balance > 0)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (models.Customer.name.ilike(term)) | (models.Customer.phone.ilike(term)) | (models.Customer.address.ilike(term))
        )
    return query.order_by(models.Customer.balance.desc(), models.Customer.name.asc()).all()

@router.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(
    customer_id: str,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )
    return customer

@router.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: schemas.CustomerCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Customer).filter(models.Customer.phone == customer_in.phone.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A customer with phone '{customer_in.phone}' already exists."
        )

    tier = "VIP" if customer_in.balance > 10000 else "Regular"
    customer = models.Customer(
        name=customer_in.name.strip(),
        phone=customer_in.phone.strip(),
        email=customer_in.email,
        address=customer_in.address.strip(),
        balance=customer_in.balance,
        membership_tier=customer_in.membership_tier or tier
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(
    customer_id: str,
    customer_in: schemas.CustomerUpdate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )

    update_data = customer_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(customer, k, v)

    db.commit()
    db.refresh(customer)
    return customer

@router.post("/customers/{customer_id}/repay", response_model=schemas.CustomerRepaymentResponse)
def record_repayment(
    customer_id: str,
    repayment_in: schemas.CustomerRepaymentCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    """
    Records an Udhaar repayment.
    CRITICAL: Decrements customer.balance without creating sales revenue!
    """
    repayment = process_customer_repayment(
        db=db,
        customer_id=customer_id,
        repayment_data=repayment_in,
        recorded_by=current_user.name
    )
    return repayment

@router.post("/customers/{customer_id}/remind", response_model=schemas.CustomerResponse)
def record_reminder_sent(
    customer_id: str,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    """
    Updates the timestamp of the last WhatsApp reminder sent to this customer.
    """
    customer = update_reminder_timestamp(db, customer_id)
    return customer

@router.get("/repayments", response_model=List[schemas.CustomerRepaymentResponse])
def get_repayments_history(
    limit: int = 100,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    return db.query(models.CustomerRepayment).order_by(models.CustomerRepayment.created_at.desc()).limit(limit).all()
