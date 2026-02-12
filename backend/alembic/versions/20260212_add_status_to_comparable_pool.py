"""add_status_to_comparable_pool

Revision ID: add_status_cp_001
Revises: add_owners_001
Create Date: 2026-02-12 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_status_cp_001'
down_revision = 'add_long_address_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ajouter la colonne status avec valeur par defaut 'transaction' pour les donnees existantes
    op.add_column('comparable_pool',
        sa.Column('status', sa.String(), nullable=False, server_default='transaction')
    )


def downgrade() -> None:
    op.drop_column('comparable_pool', 'status')
