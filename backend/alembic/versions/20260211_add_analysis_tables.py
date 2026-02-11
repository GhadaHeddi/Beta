"""add analysis tables (property_breakdowns, market_estimations)

Revision ID: a1b2c3d4e5f6
Revises: 20260210_add_project_detail_tables
Create Date: 2026-02-11 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'add_detail_tables_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'property_breakdowns',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('local_type', sa.String(), nullable=False),
        sa.Column('surface', sa.Float(), nullable=False),
        sa.Column('price_per_m2', sa.Float(), nullable=True),
        sa.Column('rental_value_per_m2', sa.Float(), nullable=True),
        sa.Column('venal_value_hd', sa.Float(), nullable=True),
        sa.Column('rental_value_annual', sa.Float(), nullable=True),
        sa.Column('rental_value_monthly', sa.Float(), nullable=True),
        sa.Column('is_venal_override', sa.Boolean(), default=False),
        sa.Column('is_rental_annual_override', sa.Boolean(), default=False),
        sa.Column('is_rental_monthly_override', sa.Boolean(), default=False),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_property_breakdowns_project_id', 'property_breakdowns', ['project_id'])

    op.create_table(
        'market_estimations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False, unique=True),
        sa.Column('sale_price_low', sa.Float(), nullable=True),
        sa.Column('sale_price_high', sa.Float(), nullable=True),
        sa.Column('sale_price_custom', sa.Float(), nullable=True),
        sa.Column('sale_capitalization_rate', sa.Float(), default=8.0),
        sa.Column('rent_low', sa.Float(), nullable=True),
        sa.Column('rent_high', sa.Float(), nullable=True),
        sa.Column('rent_custom', sa.Float(), nullable=True),
        sa.Column('rent_capitalization_rate', sa.Float(), default=8.0),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('market_estimations')
    op.drop_index('ix_property_breakdowns_project_id', table_name='property_breakdowns')
    op.drop_table('property_breakdowns')
