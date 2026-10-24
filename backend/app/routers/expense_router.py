from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/api/admin/expenses", tags=["Admin Expenses"])

@router.get("", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    return db.query(models.Expense).order_by(models.Expense.created_at.desc()).all()

@router.post("", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def record_expense(
    expense_in: schemas.ExpenseCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    exp = models.Expense(
        date=expense_in.date,
        category=expense_in.category,
        description=expense_in.description.strip(),
        amount=expense_in.amount,
        payment_method=expense_in.payment_method,
        recorded_by=current_user.name
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: str,
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID '{expense_id}' was not found."
        )

    db.delete(exp)
    db.commit()
    return {"message": "Expense record deleted successfully."}
