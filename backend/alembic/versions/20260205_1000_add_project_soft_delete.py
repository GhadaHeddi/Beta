"""add_project_soft_delete

Revision ID: add_soft_delete_001
Revises: f0727fa9b965
Create Date: 2026-02-05 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_soft_delete_001'
down_revision = 'f0727fa9b965'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ajouter la colonne deleted_at pour le soft delete (corbeille)
    op.add_column('projects', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Créer un index sur deleted_at pour optimiser les requêtes de filtrage
    op.create_index('ix_projects_deleted_at', 'projects', ['deleted_at'], unique=False)


def downgrade() -> None:
    # Supprimer l'index
    op.drop_index('ix_projects_deleted_at', table_name='projects')

    # Supprimer la colonne deleted_at
    op.drop_column('projects', 'deleted_at')
