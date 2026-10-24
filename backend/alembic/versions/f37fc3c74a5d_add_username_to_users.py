"""add_username_to_users

Revision ID: f37fc3c74a5d
Revises: b548a3606275
Create Date: 2026-10-24 14:29:45.175887

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f37fc3c74a5d'
down_revision: Union[str, Sequence[str], None] = 'b548a3606275'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    columns = [c['name'] for c in insp.get_columns('users')]
    if 'username' not in columns:
        op.add_column('users', sa.Column('username', sa.String(length=50), nullable=True))
        op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    columns = [c['name'] for c in insp.get_columns('users')]
    if 'username' in columns:
        try:
            op.drop_index(op.f('ix_users_username'), table_name='users')
        except Exception:
            pass
        op.drop_column('users', 'username')
