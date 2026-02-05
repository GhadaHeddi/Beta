"""initial_schema

Revision ID: 8851c6663993
Revises:
Create Date: 2026-02-04 15:28:04.617764

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2

# revision identifiers, used by Alembic.
revision = '8851c6663993'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Table projects
    op.create_table('projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('property_type', sa.Enum('OFFICE', 'WAREHOUSE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'MIXED', name='propertytype'), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED', name='projectstatus'), nullable=True),
        sa.Column('current_step', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)

    # Table property_infos
    op.create_table('property_infos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('owner_name', sa.String(), nullable=True),
        sa.Column('owner_contact', sa.String(), nullable=True),
        sa.Column('occupant_name', sa.String(), nullable=True),
        sa.Column('occupant_contact', sa.String(), nullable=True),
        sa.Column('construction_year', sa.Integer(), nullable=True),
        sa.Column('materials', sa.String(), nullable=True),
        sa.Column('total_surface', sa.Float(), nullable=True),
        sa.Column('terrain_surface', sa.Float(), nullable=True),
        sa.Column('number_of_floors', sa.Integer(), nullable=True),
        sa.Column('parking_spaces', sa.Integer(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('postal_code', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('geographic_sector', sa.String(), nullable=True),
        sa.Column('plu_zone', sa.String(), nullable=True),
        sa.Column('plu_regulation', sa.Text(), nullable=True),
        sa.Column('oap', sa.Text(), nullable=True),
        sa.Column('servitudes', sa.Text(), nullable=True),
        sa.Column('flood_zones', sa.Text(), nullable=True),
        sa.Column('swot_strengths', sa.Text(), nullable=True),
        sa.Column('swot_weaknesses', sa.Text(), nullable=True),
        sa.Column('swot_opportunities', sa.Text(), nullable=True),
        sa.Column('swot_threats', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id')
    )
    op.create_index(op.f('ix_property_infos_id'), 'property_infos', ['id'], unique=False)

    # Table documents
    op.create_table('documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.Enum('PHOTO', 'PLAN', 'DIAGNOSTIC', 'CADASTRE', 'OTHER', name='documenttype'), nullable=False),
        sa.Column('mime_type', sa.String(), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)

    # Table comparables
    op.create_table('comparables',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('postal_code', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('surface', sa.Float(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('price_per_m2', sa.Float(), nullable=False),
        sa.Column('distance', sa.Float(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=True),
        sa.Column('adjustment', sa.Float(), nullable=True),
        sa.Column('adjusted_price_per_m2', sa.Float(), nullable=True),
        sa.Column('validated', sa.Boolean(), nullable=True),
        sa.Column('validation_notes', sa.String(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('source_reference', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comparables_id'), 'comparables', ['id'], unique=False)

    # Table valuations
    op.create_table('valuations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('method', sa.Enum('COMPARISON', 'INCOME_ESTIMATED', 'INCOME_ACTUAL', 'COST', 'RESIDUAL', name='valuationmethod'), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('parameters', sa.JSON(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_valuations_id'), 'valuations', ['id'], unique=False)

    # Table dvf_records
    op.create_table('dvf_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mutation_id', sa.String(), nullable=True),
        sa.Column('mutation_date', sa.Date(), nullable=False),
        sa.Column('nature_mutation', sa.String(), nullable=True),
        sa.Column('valeur_fonciere', sa.Float(), nullable=True),
        sa.Column('adresse', sa.String(), nullable=True),
        sa.Column('code_postal', sa.String(), nullable=True),
        sa.Column('commune', sa.String(), nullable=True),
        sa.Column('code_commune', sa.String(), nullable=True),
        sa.Column('departement', sa.String(), nullable=True),
        sa.Column('type_local', sa.String(), nullable=True),
        sa.Column('surface_reelle_bati', sa.Float(), nullable=True),
        sa.Column('surface_terrain', sa.Float(), nullable=True),
        sa.Column('nombre_pieces_principales', sa.Integer(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geography(geometry_type='POINT', srid=4326, from_text='ST_GeogFromText', name='geography'), nullable=True),
        sa.Column('code_type_local', sa.String(), nullable=True),
        sa.Column('numero_disposition', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dvf_records_id'), 'dvf_records', ['id'], unique=False)
    op.create_index(op.f('ix_dvf_records_mutation_id'), 'dvf_records', ['mutation_id'], unique=False)
    op.create_index(op.f('ix_dvf_records_mutation_date'), 'dvf_records', ['mutation_date'], unique=False)
    op.create_index(op.f('ix_dvf_records_commune'), 'dvf_records', ['commune'], unique=False)
    op.create_index(op.f('ix_dvf_records_code_commune'), 'dvf_records', ['code_commune'], unique=False)
    op.create_index(op.f('ix_dvf_records_code_postal'), 'dvf_records', ['code_postal'], unique=False)
    op.create_index(op.f('ix_dvf_records_departement'), 'dvf_records', ['departement'], unique=False)
    op.create_index(op.f('ix_dvf_records_type_local'), 'dvf_records', ['type_local'], unique=False)
    # Note: geoalchemy2 crée automatiquement un index spatial sur les colonnes Geography


def downgrade() -> None:
    # Drop tables in reverse order (respect foreign keys)
    op.drop_index(op.f('ix_dvf_records_type_local'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_departement'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_code_postal'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_code_commune'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_commune'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_mutation_date'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_mutation_id'), table_name='dvf_records')
    op.drop_index(op.f('ix_dvf_records_id'), table_name='dvf_records')
    op.drop_table('dvf_records')

    op.drop_index(op.f('ix_valuations_id'), table_name='valuations')
    op.drop_table('valuations')

    op.drop_index(op.f('ix_comparables_id'), table_name='comparables')
    op.drop_table('comparables')

    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')

    op.drop_index(op.f('ix_property_infos_id'), table_name='property_infos')
    op.drop_table('property_infos')

    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS valuationmethod')
    op.execute('DROP TYPE IF EXISTS documenttype')
    op.execute('DROP TYPE IF EXISTS projectstatus')
    op.execute('DROP TYPE IF EXISTS propertytype')
