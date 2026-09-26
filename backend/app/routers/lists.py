from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db, get_current_user

router = APIRouter(prefix="/api/lists", tags=["lists"])


@router.get("", response_model=list[schemas.ListOut])
def get_lists(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return (
        db.query(models.TaskList)
        .filter(models.TaskList.owner_id == user.id)
        .order_by(models.TaskList.created_at)
        .all()
    )


@router.post("", response_model=schemas.ListOut)
def create_list(
    payload: schemas.ListCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    new_list = models.TaskList(name=payload.name, owner_id=user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


@router.delete("/{list_id}", status_code=204)
def delete_list(
    list_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    target = (
        db.query(models.TaskList)
        .filter(models.TaskList.id == list_id, models.TaskList.owner_id == user.id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="List not found")
    if target.is_default:
        raise HTTPException(status_code=400, detail="The default list can't be deleted")
    db.delete(target)
    db.commit()
