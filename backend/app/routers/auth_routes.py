from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class RegisterSchema(BaseModel):
    store_name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user_data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        store_name=user_data.store_name.strip(),
        email=user_data.email.strip().lower(),
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"sub": new_user.email})
    return {"token": token, "store_name": new_user.store_name}

@router.post("/login")
def login(creds: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email.strip().lower()).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {"token": token, "store_name": user.store_name}