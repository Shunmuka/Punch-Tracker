from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user, csrf_protected_user
from schemas import DeviceIngestRequest, ApiKeyCreate, ApiKeyCreateResponse, ApiKeyResponse
from services.device import DeviceService
from typing import List, Optional

router = APIRouter()
device_service = DeviceService()

@router.post("/device/keys", response_model=ApiKeyCreateResponse)
async def create_api_key(
    key_data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(csrf_protected_user)
):
    """Create a new API key for device ingestion"""
    result = device_service.create_api_key(db, current_user.id, key_data.name)
    return ApiKeyCreateResponse(**result)

@router.get("/device/keys", response_model=List[ApiKeyResponse])
async def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all API keys for the current user"""
    keys = device_service.get_user_api_keys(db, current_user.id)
    return [ApiKeyResponse(**key) for key in keys]

@router.delete("/device/keys/{key_id}")
async def delete_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(csrf_protected_user)
):
    """Delete an API key"""
    success = device_service.delete_api_key(db, current_user.id, key_id)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key deleted successfully"}

@router.post("/device/ingest")
async def ingest_device_data(
    request: Request,
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
    db: Session = Depends(get_db)
):
    """Ingest device data via HMAC-signed webhook"""
    # Get raw body for signature verification
    body = await request.body()
    
    if not x_signature:
        raise HTTPException(status_code=401, detail="Missing signature header")
    
    # Parse request data
    try:
        import json
        data = json.loads(body.decode('utf-8'))
        ingest_request = DeviceIngestRequest(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request format: {str(e)}")
    
    # Verify API key
    api_key_record = device_service.verify_api_key(db, ingest_request.user_api_key)
    if not api_key_record:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Check rate limit
    if not device_service.check_rate_limit(api_key_record.id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Verify HMAC signature
    if not device_service.verify_hmac_signature(body, x_signature, ingest_request.user_api_key):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Process events
    try:
        result = device_service.process_device_events(db, api_key_record.user_id, ingest_request.events)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process events: {str(e)}")
