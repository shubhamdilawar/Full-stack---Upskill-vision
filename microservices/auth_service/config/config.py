import os
from dotenv import load_dotenv

load_dotenv()

class Config:
 SECRET_KEY = 'your-secret-key'
 MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
 DATABASE_NAME = os.getenv('DATABASE_NAME', 'upskill_vision')
 DEBUG = True
 SMTP_SERVER = 'smtp.gmail.com'
 SMTP_PORT = 587
 EMAIL_ADDRESS = 'Shubhamdilawar821@gmail.com'  
 EMAIL_PASSWORD = 'uqiv cjxf oigf pqct'

 @classmethod
 def validate_email_config(cls):
    required = ['SMTP_SERVER', 'SMTP_PORT', 'EMAIL_ADDRESS', 'EMAIL_PASSWORD']
    for field in required:
        if not getattr(cls, field, None):
            raise ValueError(f'Missing required email configuration: {field}')
    return True