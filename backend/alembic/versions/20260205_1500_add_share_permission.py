"""add_share_permission

Revision ID: add_share_perm_001
Revises: add_soft_delete_001
Create Date: 2026-02-05 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_share_perm_001'
down_revision = 'add_soft_delete_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Créer le type enum pour les permissions
    permission_enum = sa.Enum('read', 'write', 'admin', name='sharepermission')
    permission_enum.create(op.get_bind(), checkfirst=True)

    # Ajouter la colonne permission
    op.add_column('project_shares', sa.Column(
        'permission',
        sa.Enum('read', 'write', 'admin', name='sharepermission'),
        nullable=True,
        server_default='write'
    ))

    # Mettre à jour les valeurs existantes basées sur can_write
    op.execute("UPDATE project_shares SET permission = 'write' WHERE can_write = true")
    op.execute("UPDATE project_shares SET permission = 'read' WHERE can_write = false")

    # Rendre la colonne non nullable après la migration des données
    op.alter_column('project_shares', 'permission', nullable=False)


def downgrade() -> None:
    # Supprimer la colonne permission
    op.drop_column('project_shares', 'permission')

    # Supprimer le type enum
    op.execute("DROP TYPE IF EXISTS sharepermission")
