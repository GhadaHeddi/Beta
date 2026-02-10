"""add_project_detail_tables

Revision ID: add_detail_tables_001
Revises: add_construction_year
Create Date: 2026-02-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_detail_tables_001'
down_revision = 'add_construction_year'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table project_surfaces
    op.create_table(
        'project_surfaces',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('level', sa.String(), nullable=False),
        sa.Column('surface_type', sa.Enum('atelier', 'bureaux', 'stockage', 'commerce', 'archives', 'exterieur', 'autre', name='surfacetype'), nullable=False),
        sa.Column('area_sqm', sa.Float(), nullable=False),
        sa.Column('rental_value_per_sqm', sa.Float(), nullable=True),
        sa.Column('weighting', sa.Float(), server_default='1.0'),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_project_surfaces_id', 'project_surfaces', ['id'])

    # Table analysis_results (one-to-one via unique constraint on project_id)
    op.create_table(
        'analysis_results',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False, unique=True),
        sa.Column('price_per_sqm_low', sa.Float(), nullable=True),
        sa.Column('price_per_sqm_high', sa.Float(), nullable=True),
        sa.Column('estimated_annual_rent', sa.Float(), nullable=True),
        sa.Column('actual_annual_rent', sa.Float(), nullable=True),
        sa.Column('value_low', sa.Float(), nullable=True),
        sa.Column('value_high', sa.Float(), nullable=True),
        sa.Column('weighted_average_value', sa.Float(), nullable=True),
        sa.Column('retained_value', sa.Float(), nullable=True),
        sa.Column('retained_yield_rate', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_analysis_results_id', 'analysis_results', ['id'])

    # Table simulations
    op.create_table(
        'simulations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('simulation_type', sa.Enum('reserve_fonciere', 'capacite_emprunt', 'extension', 'renovation', 'autre', name='simulationtype'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=False),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_simulations_id', 'simulations', ['id'])

    # Table document_generations
    op.create_table(
        'document_generations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('doc_format', sa.Enum('pdf', 'pptx', 'docx', name='docformat'), nullable=False),
        sa.Column('template_name', sa.String(), nullable=True),
        sa.Column('retained_value', sa.Float(), nullable=True),
        sa.Column('retained_yield_rate', sa.Float(), nullable=True),
        sa.Column('included_sections', sa.JSON(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.Column('generated_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_document_generations_id', 'document_generations', ['id'])


def downgrade() -> None:
    op.drop_table('document_generations')
    op.drop_table('simulations')
    op.drop_table('analysis_results')
    op.drop_table('project_surfaces')

    op.execute("DROP TYPE IF EXISTS docformat")
    op.execute("DROP TYPE IF EXISTS simulationtype")
    op.execute("DROP TYPE IF EXISTS surfacetype")
