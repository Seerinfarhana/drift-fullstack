from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db, get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _get_owned_task(db: Session, user: models.User, task_id: str) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def get_tasks(
    view: Optional[str] = None,
    list_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.Task).filter(models.Task.owner_id == user.id)
    if view == "myday":
        q = q.filter(models.Task.my_day_date == date.today())
    elif view == "important":
        q = q.filter(models.Task.important.is_(True))
    elif view == "planned":
        q = q.filter(models.Task.due_date.isnot(None))
    elif list_id:
        q = q.filter(models.Task.list_id == list_id)
    return q.order_by(models.Task.created_at.desc()).all()


@router.post("", response_model=schemas.TaskOut)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    owned_list = (
        db.query(models.TaskList)
        .filter(models.TaskList.id == payload.list_id, models.TaskList.owner_id == user.id)
        .first()
    )
    if not owned_list:
        raise HTTPException(status_code=404, detail="List not found")

    task = models.Task(title=payload.title, list_id=payload.list_id, owner_id=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: str,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, user, task_id)
    data = payload.model_dump(exclude_unset=True)

    if "my_day" in data:
        my_day = data.pop("my_day")
        task.my_day_date = date.today() if my_day else None
    if data.get("repeat") == "":
        data["repeat"] = None
    if "list_id" in data and data["list_id"]:
        owned_list = (
            db.query(models.TaskList)
            .filter(models.TaskList.id == data["list_id"], models.TaskList.owner_id == user.id)
            .first()
        )
        if not owned_list:
            raise HTTPException(status_code=404, detail="List not found")

    for field, value in data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, user, task_id)
    db.delete(task)
    db.commit()


# ---- Steps (nested under a task) ----
@router.post("/{task_id}/steps", response_model=schemas.StepOut)
def add_step(
    task_id: str,
    payload: schemas.StepCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, user, task_id)
    order = len(task.steps)
    step = models.Step(text=payload.text, task_id=task.id, order=order)
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


@router.patch("/{task_id}/steps/{step_id}", response_model=schemas.StepOut)
def update_step(
    task_id: str,
    step_id: str,
    payload: schemas.StepUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    _get_owned_task(db, user, task_id)
    step = db.query(models.Step).filter(models.Step.id == step_id, models.Step.task_id == task_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(step, field, value)
    db.commit()
    db.refresh(step)
    return step


@router.delete("/{task_id}/steps/{step_id}", status_code=204)
def delete_step(
    task_id: str,
    step_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    _get_owned_task(db, user, task_id)
    step = db.query(models.Step).filter(models.Step.id == step_id, models.Step.task_id == task_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    db.delete(step)
    db.commit()
