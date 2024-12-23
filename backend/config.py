class Config:
    # Database Configuration
    DATABASE_URI = "sqlite:///users.db"

    # Email Configuration
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USERNAME = "your-email@example.com"  # Replace with your email
    MAIL_PASSWORD = "your-email-password"    # Replace with your email password
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
