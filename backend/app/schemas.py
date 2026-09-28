from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, ConfigDict


# ---- Auth ----
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: EmailStr


# ---- Lists ----

class ListCreate(BaseModel):
    name: str
    due_date: Optional[date] = None
    reminder: Optional[datetime] = None


class ListUpdate(BaseModel):
    name: Optional[str] = None
    due_date: Optional[date] = None
    reminder: Optional[datetime] = None


class ListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    is_default: bool
    due_date: Optional[date]
    reminder: Optional[datetime]


# ---- Steps ----
class StepCreate(BaseModel):
    text: str = ""


class StepUpdate(BaseModel):
    text: Optional[str] = None
    done: Optional[bool] = None


class StepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    text: str
    done: bool
    order: int


# ---- Tasks ----
class TaskCreate(BaseModel):
    title: str
    list_id: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None
    important: Optional[bool] = None
    my_day: Optional[bool] = None  # true -> set to today, false -> clear
    due_date: Optional[date] = None
    reminder: Optional[datetime] = None
    repeat: Optional[Literal["daily", "weekly", "monthly", ""]] = None
    list_id: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    notes: str
    completed: bool
    important: bool
    my_day_date: Optional[date]
    due_date: Optional[date]
    reminder: Optional[datetime]
    repeat: Optional[str]
    list_id: str
    created_at: datetime
    steps: list[StepOut] = []


TokenResponse.model_rebuild()
