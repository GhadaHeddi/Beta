"""merge

Revision ID: 535d42926912
Revises: f8907e355d06, add_agencies_001
Create Date: 2026-02-12 12:38:39.242828

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '535d42926912'
down_revision = ('f8907e355d06', 'add_agencies_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
