import subprocess
import sys
import os
import signal
import time

# Get the absolute path of the microservices directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

services = [
    {
        'name': 'API Gateway',
        'path': os.path.join(BASE_DIR, 'api_gateway', 'app.py'),
        'port': 5000
    },
    {
        'name': 'Auth Service',
        'path': os.path.join(BASE_DIR, 'auth_service', 'app.py'),
        'port': 5001
    },
    {
        'name': 'Course Service',
        'path': os.path.join(BASE_DIR, 'course_service', 'app.py'),
        'port': 5002
    }
]

processes = []

def start_services():
    for service in services:
        print(f"Starting {service['name']} on port {service['port']}...")
        env = os.environ.copy()
        env['PYTHONPATH'] = BASE_DIR
        process = subprocess.Popen(
            [sys.executable, service['path']], 
            env=env
        )
        processes.append(process)
        time.sleep(2)  # Wait for service to start

def stop_services():
    for process in processes:
        process.terminate()
    
    for process in processes:
        process.wait()

if __name__ == '__main__':
    try:
        start_services()
        print("All services are running. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all services...")
        stop_services()
        print("All services stopped.") 