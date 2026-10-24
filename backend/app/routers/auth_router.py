from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.rate_limiter import check_login_rate_limit, reset_rate_limit, get_client_ip

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

from sqlalchemy import or_

@router.post("/login", response_model=schemas.TokenResponse)
def login(
    request: Request,
    credentials: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    # Enforce brute-force rate limit per IP
    check_login_rate_limit(request)

    identifier = credentials.email.strip()
    user = db.query(models.User).filter(
        or_(
            models.User.email == identifier.lower(),
            models.User.username == identifier
        )
    ).first()
    
    # Constant-time comparison or safe generic error message
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact the store owner."
        )

    # Reset rate limit on success
    client_ip = get_client_ip(request)
    reset_rate_limit(client_ip)

    # Issue JWT token with user id and role
    token = auth.create_access_token(data={"sub": user.id, "role": user.role, "email": user.email})

    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        username=user.username,
        role=user.role,
    )

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user

@router.post("/logout")
def logout(
    current_user: models.User = Depends(auth.get_current_user)
):
    return {"message": "Logged out successfully. Please clear your client token."}

@router.post("/change-password")
def change_password(
    payload: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows authenticated users to securely update their password.
    Requires current password verification and enforces minimum 8 chars for new password.
    """
    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password."
        )

    current_user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}

