from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Financial Reports"])

@router.get("/summary", response_model=schemas.FinancialSummaryResponse)
def get_financial_summary(
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    """
    Computes audited business financial metrics:
    - Sales revenue, COGS, gross profit, expenses, net profit.
    - Separation of cash collected vs credit sales vs repayments.
    - Repayments are NOT added to sales revenue.
    """
    transactions = db.query(models.Transaction).filter(models.Transaction.status == "Completed").all()
    expenses = db.query(models.Expense).all()
    repayments = db.query(models.CustomerRepayment).all()
    customers = db.query(models.Customer).all()

    total_sales = sum(tx.total for tx in transactions)
    
    # Calculate COGS using historical cost price recorded at moment of sale
    total_cogs = 0.0
    for tx in transactions:
        for item in tx.items:
            total_cogs += item.cost_price * item.quantity

    gross_profit = max(0.0, total_sales - total_cogs)
    total_expenses = sum(e.amount for e in expenses)
    net_profit = gross_profit - total_expenses

    total_receivable = sum(c.balance for c in customers)
    total_repayments = sum(r.amount for r in repayments)

    cash_sales = sum(tx.total for tx in transactions if tx.payment_method != "Store Credit (Udhaar)")
    credit_sales = sum(tx.total for tx in transactions if tx.payment_method == "Store Credit (Udhaar)")

    return schemas.FinancialSummaryResponse(
        total_sales=total_sales,
        total_cogs=total_cogs,
        gross_profit=gross_profit,
        total_expenses=total_expenses,
        net_profit=net_profit,
        total_orders=len(transactions),
        total_receivable_udhaar=total_receivable,
        total_repayments_collected=total_repayments,
        cash_sales_collected=cash_sales,
        credit_sales_issued=credit_sales,
    )
