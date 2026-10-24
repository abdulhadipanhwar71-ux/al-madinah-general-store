from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/api/admin", tags=["Admin Products & Inventory"])

@router.get("/products", response_model=List[schemas.ProductAdminResponse])
def get_all_products_admin(
    category: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)

    if category and category != "All":
        query = query.filter(models.Product.category == category)

    if status_filter and status_filter != "All":
        query = query.filter(models.Product.status == status_filter)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(term),
                models.Product.urdu_name.ilike(term),
                models.Product.sku.ilike(term),
                models.Product.barcode.ilike(term),
                models.Product.category.ilike(term)
            )
        )

    return query.order_by(models.Product.name.asc()).all()

@router.post("/products", response_model=schemas.ProductAdminResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: schemas.ProductCreate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    # Check duplicate SKU
    existing = db.query(models.Product).filter(models.Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with SKU '{product_in.sku}' already exists in catalog."
        )

    status_val = (
        "out_of_stock" if product_in.stock == 0
        else "low_stock" if product_in.stock <= product_in.min_stock_level
        else "in_stock"
    )

    new_prod = models.Product(
        name=product_in.name,
        urdu_name=product_in.urdu_name,
        category=product_in.category,
        sku=product_in.sku,
        price=product_in.price,
        cost_price=product_in.cost_price,
        stock=product_in.stock,
        min_stock_level=product_in.min_stock_level,
        unit=product_in.unit,
        image=product_in.image or "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        barcode=product_in.barcode,
        status=status_val,
        is_public=product_in.is_public,
        featured=product_in.featured,
        allow_backorder=product_in.allow_backorder,
        description=product_in.description,
        expiry_date=product_in.expiry_date,
    )
    db.add(new_prod)
    db.flush()

    if new_prod.stock > 0:
        now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")
        mv = models.StockMovement(
            product_id=new_prod.id,
            product_name=new_prod.name,
            sku=new_prod.sku,
            date=now_str,
            type="restock",
            quantity_delta=new_prod.stock,
            previous_stock=0,
            new_stock=new_prod.stock,
            reason="Initial catalog addition count",
            recorded_by=current_user.name
        )
        db.add(mv)

    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/products/{product_id}", response_model=schemas.ProductAdminResponse)
def update_product(
    product_id: str,
    product_in: schemas.ProductUpdate,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )

    if product_in.sku and product_in.sku != prod.sku:
        existing = db.query(models.Product).filter(models.Product.sku == product_in.sku).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{product_in.sku}' is already taken by another product."
            )

    update_data = product_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(prod, k, v)

    # Re-evaluate status based on new stock and min_stock_level
    if prod.stock == 0:
        prod.status = "out_of_stock"
    elif prod.stock <= prod.min_stock_level:
        prod.status = "low_stock"
    else:
        prod.status = "in_stock"

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )

    db.delete(prod)
    db.commit()
    return {"message": f"Product '{prod.name}' deleted successfully."}

@router.post("/products/{product_id}/adjust-stock", response_model=schemas.ProductAdminResponse)
def adjust_product_stock(
    product_id: str,
    adjust_in: schemas.StockAdjustRequest,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )

    previous_stock = prod.stock
    new_stock = max(0, prod.stock + adjust_in.quantity_change)
    prod.stock = new_stock

    if prod.stock == 0:
        prod.status = "out_of_stock"
    elif prod.stock <= prod.min_stock_level:
        prod.status = "low_stock"
    else:
        prod.status = "in_stock"

    now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")
    mv = models.StockMovement(
        product_id=prod.id,
        product_name=prod.name,
        sku=prod.sku,
        date=now_str,
        type=adjust_in.type,
        quantity_delta=adjust_in.quantity_change,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reason=adjust_in.reason or ("Manual inventory adjustment" if adjust_in.quantity_change >= 0 else "Inventory reduction"),
        recorded_by=current_user.name
    )
    db.add(mv)
    db.commit()
    db.refresh(prod)
    return prod

@router.get("/stock-movements", response_model=List[schemas.StockMovementResponse])
@router.get("/products/stock-movements", response_model=List[schemas.StockMovementResponse])
def get_stock_movements(
    product_id: Optional[str] = None,
    limit: int = 50,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.StockMovement)
    if product_id:
        query = query.filter(models.StockMovement.product_id == product_id)
    return query.order_by(models.StockMovement.created_at.desc()).limit(limit).all()

@router.get("/products/{product_id}", response_model=schemas.ProductAdminResponse)
def get_product_by_id(
    product_id: str,
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )
    return prod

# Store Profile Admin Endpoints
@router.get("/store-profile", response_model=schemas.StoreProfileResponse)
def get_store_profile_admin(
    current_user: models.User = Depends(auth.require_role(["owner", "cashier"])),
    db: Session = Depends(get_db)
):
    prof = db.query(models.StoreProfile).first()
    if not prof:
        prof = models.StoreProfile(
            name="Al-Madinah General Store",
            tagline="Quality Grocery & Household Essentials at Wholesome Prices",
            owner_name="AbdulHadi",
            whatsapp_number="03282885660",
            phone="03282885660",
            email="abdulhadipanhwar71@gmail.com",
            address="Ripri, Khairpur Mirs, Sindh, Pakistan",
            city="Khairpur Mirs, Sindh"
        )
        db.add(prof)
        db.commit()
        db.refresh(prof)
    return prof

@router.put("/store-profile", response_model=schemas.StoreProfileResponse)
def update_store_profile_admin(
    profile_in: schemas.StoreProfileUpdate,
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    prof = db.query(models.StoreProfile).first()
    if not prof:
        prof = models.StoreProfile(
            name="Al-Madinah General Store",
            tagline="Quality Grocery & Household Essentials at Wholesome Prices",
            owner_name="AbdulHadi",
            whatsapp_number="03282885660",
            phone="03282885660",
            email="abdulhadipanhwar71@gmail.com",
            address="Ripri, Khairpur Mirs, Sindh, Pakistan",
            city="Khairpur Mirs, Sindh"
        )
        db.add(prof)

    update_data = profile_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(prof, k, v)

    db.commit()
    db.refresh(prof)
    return prof
