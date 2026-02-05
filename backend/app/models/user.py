"""
Modèle User - Utilisateur de l'application
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class UserRole(str, Enum):
    """Rôles utilisateur"""
    ADMIN = "admin"
    CONSULTANT = "consultant"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Rôle et hiérarchie
    role = Column(SQLEnum(UserRole), default=UserRole.CONSULTANT, nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Pour les consultants

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    admin = relationship("User", remote_side=[id], backref="consultants", foreign_keys=[admin_id])
    shared_projects = relationship("ProjectShare", back_populates="user", cascade="all, delete-orphan")

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
