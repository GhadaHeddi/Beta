"""Add construction_year to comparables

Revision ID: add_construction_year
Revises: add_comparable_pool
Create Date: 2026-02-10 11:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'add_construction_year'
down_revision = 'add_comparable_pool_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('comparables', sa.Column('construction_year', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('comparables', 'construction_year')
