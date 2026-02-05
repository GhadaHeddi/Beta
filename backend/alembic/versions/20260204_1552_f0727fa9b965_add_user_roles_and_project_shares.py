"""add_user_roles_and_project_shares

Revision ID: f0727fa9b965
Revises: 8851c6663993
Create Date: 2026-02-04 15:52:58.986433

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f0727fa9b965'
down_revision = '8851c6663993'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Créer l'enum UserRole
    userrole_enum = sa.Enum('ADMIN', 'CONSULTANT', name='userrole')
    userrole_enum.create(op.get_bind(), checkfirst=True)

    # Ajouter les colonnes role et admin_id à la table users
    op.add_column('users', sa.Column('role', sa.Enum('ADMIN', 'CONSULTANT', name='userrole'), nullable=False, server_default='CONSULTANT'))
    op.add_column('users', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_users_admin_id', 'users', 'users', ['admin_id'], ['id'])

    # Créer la table project_shares
    op.create_table('project_shares',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('can_write', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='uq_project_user_share')
    )
    op.create_index(op.f('ix_project_shares_id'), 'project_shares', ['id'], unique=False)


def downgrade() -> None:
    # Supprimer la table project_shares
    op.drop_index(op.f('ix_project_shares_id'), table_name='project_shares')
    op.drop_table('project_shares')

    # Supprimer les colonnes de users
    op.drop_constraint('fk_users_admin_id', 'users', type_='foreignkey')
    op.drop_column('users', 'admin_id')
    op.drop_column('users', 'role')

    # Supprimer l'enum
    op.execute('DROP TYPE IF EXISTS userrole')
