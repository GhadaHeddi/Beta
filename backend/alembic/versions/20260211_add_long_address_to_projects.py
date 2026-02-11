"""add long_address to projects

Revision ID: add_long_address_001
Revises: add_owners_001
Create Date: 2026-02-11 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_long_address_001'
down_revision = 'add_owners_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('long_address', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('projects', 'long_address')
