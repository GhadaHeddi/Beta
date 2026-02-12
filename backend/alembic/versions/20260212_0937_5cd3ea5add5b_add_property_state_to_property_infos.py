"""add property_state to property_infos

Revision ID: 5cd3ea5add5b
Revises: add_long_address_001
Create Date: 2026-02-12 09:37:44.784448

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5cd3ea5add5b'
down_revision = 'add_long_address_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('property_infos', sa.Column('property_state', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('property_infos', 'property_state')
