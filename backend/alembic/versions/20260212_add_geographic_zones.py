"""add geographic_zones table

Revision ID: add_geographic_zones_001
Revises: 535d42926912
Create Date: 2026-02-12 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_geographic_zones_001'
down_revision = 'add_status_cp_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'geographic_zones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('agency_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agency_id'], ['agencies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_geographic_zones_id'), 'geographic_zones', ['id'], unique=False)
    op.create_index(op.f('ix_geographic_zones_name'), 'geographic_zones', ['name'], unique=False)
    op.create_index(op.f('ix_geographic_zones_agency_id'), 'geographic_zones', ['agency_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_geographic_zones_agency_id'), table_name='geographic_zones')
    op.drop_index(op.f('ix_geographic_zones_name'), table_name='geographic_zones')
    op.drop_index(op.f('ix_geographic_zones_id'), table_name='geographic_zones')
    op.drop_table('geographic_zones')
