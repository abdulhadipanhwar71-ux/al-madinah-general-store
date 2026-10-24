from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.services.order_service import create_store_order

router = APIRouter(prefix="/api/public", tags=["Public Storefront"])

@router.get("/store-profile", response_model=schemas.StoreProfilePublicResponse)
def get_public_store_profile(db: Session = Depends(get_db)):
    """
    Returns public store information (operating hours, WhatsApp number, address, return policy).
    """
    profile = db.query(models.StoreProfile).first()
    if not profile:
        # Return fallback default if unseeded
        return schemas.StoreProfilePublicResponse(
            name="Al-Madinah General Store",
            tagline="Quality Grocery & Household Essentials at Wholesome Prices",
            owner_name="AbdulHadi",
            country_code="+92",
            phone="03282885660",
            whatsapp_number="03282885660",
            email="abdulhadipanhwar71@gmail.com",
            address="Ripri, Khairpur Mirs, Sindh, Pakistan",
            city="Khairpur Mirs, Sindh",
            store_hours="8:00 AM - 11:00 PM (Daily)",
            currency="PKR",
            delivery_available=True,
            delivery_charges=100.0,
            free_delivery_threshold=2000.0,
            delivery_areas="Ripri and adjoining areas (Khairpur Mirs)",
            return_policy="Defective or damaged packaged products can be exchanged within 24 hours with original receipt."
        )
    return profile

@router.get("/products", response_model=List[schemas.ProductPublicResponse])
def get_public_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    in_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Returns public catalog products.
    SECURITY & PRIVACY: Strictly excludes cost_price and internal store margins!
    """
    query = db.query(models.Product).filter(models.Product.is_public == True)

    if category and category != "All":
        query = query.filter(models.Product.category == category)

    if in_stock_only:
        query = query.filter(models.Product.stock > 0)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(term),
                models.Product.urdu_name.ilike(term),
                models.Product.category.ilike(term)
            )
        )

    return query.order_by(models.Product.featured.desc(), models.Product.name.asc()).all()

@router.post("/orders", response_model=schemas.StoreOrderResponse)
def place_web_order(
    order_data: schemas.StoreOrderCreate,
    db: Session = Depends(get_db)
):
    """
    Places an order from the public web cart.
    Idempotent: Uses order_data.idempotency_key to prevent duplicate submissions.
    """
    order = create_store_order(db, order_data, recorded_by="Customer (Web)")
    return order
