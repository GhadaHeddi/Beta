"""
Modèle ProjectShare - Partage de projets entre consultants
"""
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ProjectShare(Base):
    __tablename__ = "project_shares"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    can_write = Column(Boolean, default=True)  # Droit d'écriture
    created_at = Column(DateTime, default=datetime.utcnow)

    # Contrainte unique : un utilisateur ne peut avoir qu'un partage par projet
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='uq_project_user_share'),
    )

    # Relations
    project = relationship("Project", back_populates="shares")
    user = relationship("User", back_populates="shared_projects")

    def __repr__(self):
        return f"<ProjectShare(project_id={self.project_id}, user_id={self.user_id}, can_write={self.can_write})>"
