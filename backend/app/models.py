import uuid
from datetime import datetime, date

from sqlalchemy import (
    Column, String, Boolean, ForeignKey, DateTime, Date, Integer, Text
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lists = relationship("TaskList", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")


class TaskList(Base):
    __tablename__ = "task_lists"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)

    due_date = Column(Date, nullable=True)
    reminder = Column(DateTime(timezone=True), nullable=True)

    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="lists")
    tasks = relationship(
        "Task",
        back_populates="task_list",
        cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    notes = Column(Text, default="")
    completed = Column(Boolean, default=False)
    important = Column(Boolean, default=False)
    my_day_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    reminder = Column(DateTime, nullable=True)
    repeat = Column(String, nullable=True)  # "daily" | "weekly" | "monthly" | None
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    list_id = Column(String, ForeignKey("task_lists.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    task_list = relationship("TaskList", back_populates="tasks")
    owner = relationship("User", back_populates="tasks")
    steps = relationship("Step", back_populates="task", cascade="all, delete-orphan", order_by="Step.order")


class Step(Base):
    __tablename__ = "steps"

    id = Column(String, primary_key=True, default=gen_id)
    text = Column(String, nullable=False)
    done = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)

    task = relationship("Task", back_populates="steps")
