import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'upskill_vision') 