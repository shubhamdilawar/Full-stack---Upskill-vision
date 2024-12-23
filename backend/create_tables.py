from database import db_engine, Base

# This will create the users table if it doesn't exist yet
Base.metadata.create_all(db_engine)
print("Tables created successfully!")
