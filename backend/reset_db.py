from database import db_engine, Base
from models.user import User  # Import your User model

# Drop all tables (this will erase existing data)
print("Recreating the database...")
Base.metadata.drop_all(db_engine)

# Create all tables as defined in the models
Base.metadata.create_all(db_engine)
print("Database recreated successfully.")
