import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.config import settings
from backend.app.database import engine, Base, get_db
from backend.app import models, auth
from backend.app.routers import (
    auth_router,
    public_router,
    product_router,
    sales_router,
    customer_router,
    order_router,
    expense_router,
    report_router,
    backup_router
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dukaanos.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup & shutdown events:
    Ensures tables exist and creates default owner account if absent.
    """
    Base.metadata.create_all(bind=engine)

    # Check and seed initial data
    db = next(get_db())
    try:
        # In development mode only, check and seed default demo accounts if not present
        if settings.ENVIRONMENT != "production":
            owner = db.query(models.User).filter(
                (models.User.email == "abdulhadipanhwar71@gmail.com") | (models.User.username == "127294")
            ).first()
            if not owner:
                logger.info("Creating default owner user account (abdulhadipanhwar71@gmail.com)...")
                hashed = auth.get_password_hash("admin123")
                default_owner = models.User(
                    name="AbdulHadi",
                    email="abdulhadipanhwar71@gmail.com",
                    username="127294",
                    hashed_password=hashed,
                    role="owner",
                    is_active=True
                )
                db.add(default_owner)

            cashier = db.query(models.User).filter(models.User.email == "cashier@dukaanos.pk").first()
            if not cashier:
                logger.info("Creating default cashier user account (cashier@dukaanos.pk)...")
                hashed_cashier = auth.get_password_hash("cashier123")
                default_cashier = models.User(
                    name="Ahmed Ali (Cashier)",
                    email="cashier@dukaanos.pk",
                    username="cashier",
                    hashed_password=hashed_cashier,
                    role="cashier",
                    is_active=True
                )
                db.add(default_cashier)
        else:
            logger.info("Production mode: Demo accounts are not auto-seeded. Provision accounts using 'python backend/manage_users.py create-owner'.")

        # Check default store profile
        profile = db.query(models.StoreProfile).first()
        if not profile:
            logger.info("Creating default store profile...")
            default_prof = models.StoreProfile(
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
                ntn_number="7492810-4",
                currency="PKR",
                default_low_stock_threshold=10,
                delivery_available=True,
                delivery_charges=100.0,
                free_delivery_threshold=2000.0,
                delivery_areas="Ripri and adjoining areas (Khairpur Mirs)",
                return_policy="Defective or damaged packaged products can be exchanged within 24 hours with original receipt. Fresh produce must be verified upon delivery.",
                tax_rate=0.0,
                receipt_header="Bismillah-ir-Rahman-ir-Rahim\nAl-Madinah General Store - Ripri, Khairpur Mirs",
                receipt_footer="JazakAllah Khair for shopping with us! Please verify items before leaving."
            )
            db.add(default_prof)

        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error(f"Error during startup initialization: {exc}")
    finally:
        db.close()

    yield
    logger.info("DukaanOS backend shutting down cleanly.")

app = FastAPI(
    title="DukaanOS API",
    description="Production-grade AI-Powered General Store Management Platform API",
    version="3.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Health-Check Endpoint
@app.get("/api/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    Liveness & readiness probe verifying database connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "DukaanOS Backend",
        "version": "3.0.0",
        "database": db_status,
        "environment": settings.ENVIRONMENT
    }

# Register Routers
app.include_router(auth_router.router)
app.include_router(public_router.router)
app.include_router(product_router.router)
app.include_router(sales_router.router)
app.include_router(customer_router.router)
app.include_router(order_router.router)
app.include_router(expense_router.router)
app.include_router(report_router.router)
app.include_router(backup_router.router)
