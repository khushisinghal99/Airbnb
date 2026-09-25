from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.api import ReviewCreate, ReviewResponse
from app.services.review_service import create_review

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(data: ReviewCreate, guest: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_review(db, guest, data)
