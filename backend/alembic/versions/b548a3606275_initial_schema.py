"""initial_schema

Revision ID: b548a3606275
Revises: 
Create Date: 2026-10-24 12:11:56.666236

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b548a3606275'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - creates all initial DukaanOS tables."""
    from backend.app.database import Base
    from backend.app import models
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    """Downgrade schema - drops all initial DukaanOS tables."""
    from backend.app.database import Base
    from backend.app import models
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)

