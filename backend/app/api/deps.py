from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User


def get_current_user(
    x_user_id: int = Header(default=6, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """Mock identity for the assignment; seeded guest 6 is the default user."""
    user = db.get(User, x_user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user. Set a valid X-User-Id header.")
    return user


def get_current_host(user: User = Depends(get_current_user)) -> User:
    if user.role != "host":
        raise HTTPException(status_code=403, detail="Host account required")
    return user
