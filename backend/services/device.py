import os
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models import User, ApiKey, Punch, Workout
from schemas import DeviceEvent, DeviceIngestRequest
from database import get_redis
import redis

class DeviceService:
    def __init__(self):
        self.redis_client = get_redis()
        self.rate_limit_per_min = int(os.getenv("RATE_LIMIT_PER_MIN", "60"))
        self.webhook_hmac_header = os.getenv("WEBHOOK_HMAC_HEADER", "X-Signature")
        self.webhook_drift_sec = int(os.getenv("WEBHOOK_DRIFT_SEC", "120"))

    def create_api_key(self, db: Session, user_id: int, name: str) -> Dict[str, Any]:
        """Create a new API key for a user"""
        # Generate secret
        secret = secrets.token_urlsafe(32)
        secret_hash = self._hash_secret(secret)
        
        # Create API key record
        api_key = ApiKey(
            user_id=user_id,
            name=name,
            secret_hash=secret_hash
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        
        return {
            "id": api_key.id,
            "name": api_key.name,
            "secret": secret,  # Only returned on creation
            "created_at": api_key.created_at
        }

    def get_user_api_keys(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Get all API keys for a user"""
        keys = db.query(ApiKey).filter(ApiKey.user_id == user_id).all()
        
        return [
            {
                "id": key.id,
                "name": key.name,
                "created_at": key.created_at,
                "last_used_at": key.last_used_at
            }
            for key in keys
        ]

    def delete_api_key(self, db: Session, user_id: int, key_id: int) -> bool:
        """Delete an API key"""
        key = db.query(ApiKey).filter(
            ApiKey.id == key_id,
            ApiKey.user_id == user_id
        ).first()
        
        if not key:
            return False
        
        db.delete(key)
        db.commit()
        return True

    def verify_api_key(self, db: Session, api_key: str) -> Optional[ApiKey]:
        """Verify API key and return the key record"""
        # Find key by checking all hashes
        keys = db.query(ApiKey).all()
        
        for key in keys:
            if self._verify_secret(api_key, key.secret_hash):
                # Update last used timestamp
                key.last_used_at = datetime.utcnow()
                db.commit()
                return key
        
        return None

    def check_rate_limit(self, api_key_id: int) -> bool:
        """Check if API key is within rate limits"""
        try:
            key = f"rate_limit:{api_key_id}"
            current = self.redis_client.get(key)
            
            if current is None:
                # First request in this minute
                self.redis_client.setex(key, 60, 1)
                return True
            
            current_count = int(current)
            if current_count >= self.rate_limit_per_min:
                return False
            
            # Increment counter
            self.redis_client.incr(key)
            return True
        except Exception:
            # If Redis fails, allow the request
            return True

    def verify_hmac_signature(self, payload: bytes, signature: str, secret: str) -> bool:
        """Verify HMAC signature for webhook payload"""
        try:
            # Parse signature format: sha256=hash
            if not signature.startswith("sha256="):
                return False
            
            expected_hash = signature[7:]  # Remove "sha256=" prefix
            
            # Calculate HMAC
            calculated_hash = hmac.new(
                secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            # Compare hashes
            return hmac.compare_digest(expected_hash, calculated_hash)
        except Exception:
            return False

    def process_device_events(self, db: Session, user_id: int, events: List[DeviceEvent]) -> Dict[str, Any]:
        """Process device events and create punches"""
        # Get or create active workout
        active_workout = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.ended_at == None
        ).first()
        
        if not active_workout:
            # Auto-start workout
            active_workout = Workout(
                user_id=user_id,
                auto_detected=True,
                started_at=datetime.utcnow()
            )
            db.add(active_workout)
            db.commit()
            db.refresh(active_workout)
        
        # Process events
        punches_created = 0
        for event in events:
            punch = Punch(
                workout_id=active_workout.id,
                punch_type=event.punch_type,
                speed=event.speed,
                count=event.count,
                timestamp=event.ts
            )
            db.add(punch)
            punches_created += 1
        
        db.commit()
        
        return {
            "workout_id": active_workout.id,
            "punches_created": punches_created,
            "message": "Events processed successfully"
        }

    def _hash_secret(self, secret: str) -> str:
        """Hash a secret for storage"""
        return hashlib.sha256(secret.encode('utf-8')).hexdigest()

    def _verify_secret(self, secret: str, stored_hash: str) -> bool:
        """Verify a secret against its stored hash"""
        calculated_hash = self._hash_secret(secret)
        return hmac.compare_digest(calculated_hash, stored_hash)
