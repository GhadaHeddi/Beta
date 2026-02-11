"""add_owners_table

Revision ID: add_owners_001
Revises: a1b2c3d4e5f6
Create Date: 2026-02-11 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_owners_001'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('owners',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('projects_count', sa.Integer(), server_default='1', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_owners_id'), 'owners', ['id'], unique=False)
    op.create_index(op.f('ix_owners_name'), 'owners', ['name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_owners_name'), table_name='owners')
    op.drop_index(op.f('ix_owners_id'), table_name='owners')
    op.drop_table('owners')
