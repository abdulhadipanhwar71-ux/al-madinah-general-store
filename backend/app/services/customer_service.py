from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app import models, schemas

def process_customer_repayment(
    db: Session,
    customer_id: str,
    repayment_data: schemas.CustomerRepaymentCreate,
    recorded_by: str
) -> models.CustomerRepayment:
    """
    Records a customer Udhaar settlement or audited adjustment.
    - Atomically decrements customer.balance.
    - Creates an auditable CustomerRepayment record.
    - CRITICAL ACCOUNTING RULE: Repayments are settlements of debt, NOT new sales revenue!
      They are deliberately never inserted into the transactions/sales table to prevent double-counting.
    """
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%I:%M %p")

    try:
        # Decrement outstanding balance
        customer.balance = max(0.0, customer.balance - repayment_data.amount)

        # Create repayment record
        repayment = models.CustomerRepayment(
            customer_id=customer.id,
            customer_name=customer.name,
            date=date_str,
            time=time_str,
            amount=repayment_data.amount,
            payment_method=repayment_data.payment_method,
            note=repayment_data.note,
            type=repayment_data.type,
            recorded_by=recorded_by
        )
        db.add(repayment)
        db.commit()
        db.refresh(repayment)
        return repayment

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Repayment recording failed: {str(exc)}"
        )

def update_reminder_timestamp(db: Session, customer_id: str) -> models.Customer:
    """
    Updates last_reminder_sent timestamp on the customer profile.
    """
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )

    now_str = datetime.now().strftime("%b %d, %Y, %I:%M %p")
    customer.last_reminder_sent = now_str
    db.commit()
    db.refresh(customer)
    return customer
