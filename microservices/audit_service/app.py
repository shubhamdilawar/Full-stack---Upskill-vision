import os
import sys

# Get the absolute path of the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Add the current directory to Python path
sys.path.append(os.path.dirname(current_dir))
print("Python Path:", sys.path)

from flask import Flask, request
from flask_cors import CORS
from audit_service.routes.audit_routes import audit
from audit_service.db import db
from audit_service.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, 
        resources={
            r"/api/*": {
                "origins": "http://localhost:3000",  # String instead of list
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        }
    )

    # Register blueprint with /api prefix
    app.register_blueprint(audit, url_prefix='/api/audit')

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting Audit Service...")
    app.run(debug=True, host='127.0.0.1', port=5004)