"""add selected column to simulations

Revision ID: add_sim_selected_001
Revises: add_agencies_001
Create Date: 2026-02-12 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_sim_selected_001'
down_revision = 'add_agencies_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('simulations', sa.Column('selected', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('simulations', 'selected')
