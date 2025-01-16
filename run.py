import os
import sys

# Get the absolute path of the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Add the current directory to Python path
sys.path.append(current_dir)

<<<<<<< HEAD
from backend.app import app

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5000) 
=======
from backend.app

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5000) 
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
