from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# database.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

DATABASE_URI = "sqlite:///app.db"  # SQLite database URI (should match app.py and alembic.ini)

# No need for create_engine or Session here if using Flask-SQLAlchemy with app context



db_engine = create_engine(DATABASE_URI)

# Base for model inheritance
Base = declarative_base()

# Create a session factory
Session = sessionmaker(bind=db_engine)

def get_session():
    return Session()
