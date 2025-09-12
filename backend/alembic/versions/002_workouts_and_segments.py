"""Add workouts and segments, add FKs to punches, migrate sessions to workouts

Revision ID: 002
Revises: 001
Create Date: 2025-09-12 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'workouts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('auto_detected', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'])
    )
    op.create_index(op.f('ix_workouts_id'), 'workouts', ['id'], unique=False)

    op.create_table(
        'workout_segments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('workout_id', sa.Integer(), nullable=False),
        sa.Column('kind', sa.String(20), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('target_seconds', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['workout_id'], ['workouts.id'])
    )
    op.create_index(op.f('ix_workout_segments_id'), 'workout_segments', ['id'], unique=False)

    # Add nullable columns to punches
    op.add_column('punches', sa.Column('workout_id', sa.Integer(), nullable=True))
    op.add_column('punches', sa.Column('segment_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_punches_workout', 'punches', 'workouts', ['workout_id'], ['id'])
    op.create_foreign_key('fk_punches_segment', 'punches', 'workout_segments', ['segment_id'], ['id'])

    # Migration: create a workout per existing session and attach punches
    conn = op.get_bind()
    # Create workouts from sessions
    conn.execute(text('''
        INSERT INTO workouts (id, user_id, name, started_at, ended_at, auto_detected)
        SELECT s.id, s.user_id, s.name, s.started_at, s.ended_at, false
        FROM sessions s
        ON CONFLICT DO NOTHING
    '''))
    # Link punches to workouts by session_id
    conn.execute(text('''
        UPDATE punches p SET workout_id = p.session_id
        WHERE p.workout_id IS NULL
    '''))


def downgrade() -> None:
    op.drop_constraint('fk_punches_segment', 'punches', type_='foreignkey')
    op.drop_constraint('fk_punches_workout', 'punches', type_='foreignkey')
    op.drop_column('punches', 'segment_id')
    op.drop_column('punches', 'workout_id')
    op.drop_index(op.f('ix_workout_segments_id'), table_name='workout_segments')
    op.drop_table('workout_segments')
    op.drop_index(op.f('ix_workouts_id'), table_name='workouts')
    op.drop_table('workouts')


