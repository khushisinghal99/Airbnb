from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.api import FavoriteCreate, FavoriteResponse
from app.services import favorite_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteResponse])
def my_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return favorite_service.list_favorites(db, user)


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(data: FavoriteCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return favorite_service.add_favorite(db, user, data)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(listing_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favorite_service.remove_favorite(db, user, listing_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
