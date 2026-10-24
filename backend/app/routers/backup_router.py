import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, HTTPException, status, Body
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.services.backup_service import (
    export_full_backup_json,
    export_backup_csv_zip,
    restore_backup_json
)

router = APIRouter(prefix="/api/admin/backup", tags=["Admin Backup & Restore"])

@router.get("/export/json")
def download_backup_json(
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    """
    Exports complete database tables as a structured JSON file.
    Protected: Owner only!
    """
    data = export_full_backup_json(db)
    filename = f"dukaanos_backup_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
    json_str = json.dumps(data, indent=2, default=str)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/csv")
def download_backup_csv(
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    """
    Exports complete database tables as a ZIP archive of CSV files.
    Protected: Owner only!
    """
    zip_bytes = export_backup_csv_zip(db)
    filename = f"dukaanos_csv_backup_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/restore", response_model=schemas.BackupRestoreResult)
def restore_backup(
    payload: dict = Body(...),
    current_user: models.User = Depends(auth.require_role(["owner"])),
    db: Session = Depends(get_db)
):
    """
    Restores or imports records from a JSON backup.
    Performs duplicate detection by SKU, invoice number, order number.
    Protected: Owner only!
    """
    result = restore_backup_json(db, payload)
    return result
