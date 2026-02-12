"""add contact_name to owners

Revision ID: f8907e355d06
Revises: 5cd3ea5add5b
Create Date: 2026-02-12 09:54:23.162656

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f8907e355d06'
down_revision = '5cd3ea5add5b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('owners', sa.Column('contact_name', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('owners', 'contact_name')
