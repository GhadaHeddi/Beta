"""
Modeles Agency et UserAgency - Gestion des agences
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True, index=True)
    postal_code = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user_associations = relationship("UserAgency", back_populates="agency", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="agency")

    def __repr__(self):
        return f"<Agency(id={self.id}, name='{self.name}')>"


class UserAgency(Base):
    __tablename__ = "user_agencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "agency_id", name="uq_user_agencies_user_agency"),
    )

    # Relations
    user = relationship("User", back_populates="agency_associations")
    agency = relationship("Agency", back_populates="user_associations")

    def __repr__(self):
        return f"<UserAgency(user_id={self.user_id}, agency_id={self.agency_id}, is_primary={self.is_primary})>"
