"""Add auth and roles

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type for user roles
    user_role_enum = postgresql.ENUM('athlete', 'coach', name='userrole')
    user_role_enum.create(op.get_bind())
    
    # Add new columns to users table
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('role', user_role_enum, nullable=False, server_default="'athlete'"))
    
    # Create notification_prefs table
    op.create_table('notification_prefs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('webhook_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('webhook_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_notification_prefs_id'), 'notification_prefs', ['id'], unique=False)
    
    # Create coach_athlete table
    op.create_table('coach_athlete',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('coach_id', sa.Integer(), nullable=False),
        sa.Column('athlete_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['athlete_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['coach_id'], ['users.id'], ),
        sa.UniqueConstraint('coach_id', 'athlete_id', name='unique_coach_athlete')
    )
    op.create_index(op.f('ix_coach_athlete_id'), 'coach_athlete', ['id'], unique=False)
    
    # Update existing users with default password hash (they'll need to reset)
    op.execute("UPDATE users SET password_hash = '$2b$12$default.hash.for.existing.users' WHERE password_hash = ''")


def downgrade() -> None:
    # Drop tables
    op.drop_table('coach_athlete')
    op.drop_table('notification_prefs')
    
    # Drop columns from users table
    op.drop_column('users', 'role')
    op.drop_column('users', 'password_hash')
    
    # Drop enum type
    user_role_enum = postgresql.ENUM('athlete', 'coach', name='userrole')
    user_role_enum.drop(op.get_bind())
