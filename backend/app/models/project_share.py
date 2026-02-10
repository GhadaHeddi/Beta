"""
Modèle ProjectShare - Partage de projets entre consultants
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class SharePermission(str, enum.Enum):
    """Niveaux de permission pour le partage de projets"""
    READ = "read"       # Lecture seule
    WRITE = "write"     # Lecture et écriture
    ADMIN = "admin"     # Lecture, écriture et suppression


class ProjectShare(Base):
    __tablename__ = "project_shares"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    permission = Column(String(10), default="write")  # "read", "write", "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Contrainte unique : un utilisateur ne peut avoir qu'un partage par projet
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='uq_project_user_share'),
    )

    # Relations
    project = relationship("Project", back_populates="shares")
    user = relationship("User", back_populates="shared_projects")

    def __repr__(self):
        return f"<ProjectShare(project_id={self.project_id}, user_id={self.user_id}, permission={self.permission})>"
