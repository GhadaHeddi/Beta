"""add agencies tables and projects.agency_id

Revision ID: add_agencies_001
Revises: add_long_address_001
Create Date: 2026-02-12 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agencies_001'
down_revision = 'add_long_address_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table agencies
    op.create_table(
        'agencies',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('postal_code', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_agencies_name', 'agencies', ['name'])
    op.create_index('ix_agencies_city', 'agencies', ['city'])

    # Table user_agencies (jointure many-to-many)
    op.create_table(
        'user_agencies',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('agency_id', sa.Integer(), sa.ForeignKey('agencies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_user_agencies_user_id', 'user_agencies', ['user_id'])
    op.create_index('ix_user_agencies_agency_id', 'user_agencies', ['agency_id'])
    op.create_unique_constraint('uq_user_agencies_user_agency', 'user_agencies', ['user_id', 'agency_id'])

    # Colonne agency_id sur projects
    op.add_column('projects', sa.Column('agency_id', sa.Integer(), sa.ForeignKey('agencies.id'), nullable=True))
    op.create_index('ix_projects_agency_id', 'projects', ['agency_id'])


def downgrade() -> None:
    op.drop_index('ix_projects_agency_id', table_name='projects')
    op.drop_column('projects', 'agency_id')
    op.drop_table('user_agencies')
    op.drop_table('agencies')
