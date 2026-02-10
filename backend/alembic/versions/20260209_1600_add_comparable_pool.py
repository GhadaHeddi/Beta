"""add_comparable_pool

Revision ID: add_comparable_pool_001
Revises: add_share_perm_001
Create Date: 2026-02-09 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_comparable_pool_001'
down_revision = 'add_share_perm_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Activer l'extension PostGIS si pas deja activee
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')

    # Creer les types enum via SQL brut (IF NOT EXISTS pour idempotence)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comparablesource') THEN
                CREATE TYPE comparablesource AS ENUM ('arthur_loyd', 'concurrence');
            END IF;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transactiontype') THEN
                CREATE TYPE transactiontype AS ENUM ('sale', 'rent');
            END IF;
        END $$
    """)

    # Creer la table avec des colonnes String (evite la creation automatique d'enums par SQLAlchemy)
    op.create_table('comparable_pool',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('postal_code', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('property_type', sa.String(), nullable=False),
        sa.Column('surface', sa.Float(), nullable=False),
        sa.Column('construction_year', sa.Integer(), nullable=True),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('price_per_m2', sa.Float(), nullable=False),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('source_reference', sa.String(), nullable=True),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Convertir les colonnes String en types enum PostgreSQL
    op.execute("ALTER TABLE comparable_pool ALTER COLUMN transaction_type TYPE transactiontype USING transaction_type::transactiontype")
    op.execute("ALTER TABLE comparable_pool ALTER COLUMN source TYPE comparablesource USING source::comparablesource")

    # Ajouter la colonne geom PostGIS
    op.execute("ALTER TABLE comparable_pool ADD COLUMN geom geometry(Point, 4326)")

    # Creer les index
    op.create_index(op.f('ix_comparable_pool_id'), 'comparable_pool', ['id'], unique=False)
    op.create_index(op.f('ix_comparable_pool_postal_code'), 'comparable_pool', ['postal_code'], unique=False)
    op.create_index(op.f('ix_comparable_pool_city'), 'comparable_pool', ['city'], unique=False)
    op.create_index(op.f('ix_comparable_pool_property_type'), 'comparable_pool', ['property_type'], unique=False)
    op.create_index(op.f('ix_comparable_pool_transaction_date'), 'comparable_pool', ['transaction_date'], unique=False)
    op.create_index(op.f('ix_comparable_pool_source'), 'comparable_pool', ['source'], unique=False)

    # Index GIST pour les requetes spatiales PostGIS
    op.execute('CREATE INDEX idx_comparable_pool_geom ON comparable_pool USING GIST (geom)')


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS idx_comparable_pool_geom')
    op.drop_index(op.f('ix_comparable_pool_source'), table_name='comparable_pool')
    op.drop_index(op.f('ix_comparable_pool_transaction_date'), table_name='comparable_pool')
    op.drop_index(op.f('ix_comparable_pool_property_type'), table_name='comparable_pool')
    op.drop_index(op.f('ix_comparable_pool_city'), table_name='comparable_pool')
    op.drop_index(op.f('ix_comparable_pool_postal_code'), table_name='comparable_pool')
    op.drop_index(op.f('ix_comparable_pool_id'), table_name='comparable_pool')
    op.drop_table('comparable_pool')
    op.execute('DROP TYPE IF EXISTS comparablesource')
    op.execute('DROP TYPE IF EXISTS transactiontype')
