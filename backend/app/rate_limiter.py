import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from backend.app.config import settings

# In-memory timestamp tracker: {ip_address: [timestamp, timestamp, ...]}
_login_attempts = defaultdict(list)

def get_client_ip(request: Request) -> str:
    """Safely extracts real client IP even behind reverse proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"

def check_login_rate_limit(request: Request):
    """
    Enforces a sliding window rate limit on login attempts per IP.
    """
    client_ip = get_client_ip(request)
    now = time.time()
    window = 60.0  # 1 minute

    # Filter out timestamps older than the window
    _login_attempts[client_ip] = [t for t in _login_attempts[client_ip] if now - t < window]

    if len(_login_attempts[client_ip]) >= settings.LOGIN_RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts from this address. Rate limit exceeded ({settings.LOGIN_RATE_LIMIT_PER_MINUTE}/min). Please wait a minute before retrying."
        )

    _login_attempts[client_ip].append(now)

def reset_rate_limit(client_ip: str):
    """Resets attempts on successful authentication"""
    if client_ip in _login_attempts:
        _login_attempts.pop(client_ip, None)
