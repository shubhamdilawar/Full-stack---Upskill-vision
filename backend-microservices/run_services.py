import subprocess
import sys
import time
import requests
import psutil
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import os
from shared.config import MONGODB_URI, DATABASE_NAME
import traceback

def check_mongodb():
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        client.admin.command('ismaster')
        print("MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {str(e)}")
        return False

def kill_process_on_port(port):
    try:
        for proc in psutil.process_iter():
            for conn in proc.net_connections():
                if hasattr(conn, 'laddr') and conn.laddr.port == port:
                    proc.kill()
                    time.sleep(1)
                    return True
    except Exception as e:
        print(f"Error checking port {port}: {e}")
    return False

def check_service(port, retries=3):
    for i in range(retries):
        try:
            response = requests.get(f'http://localhost:{port}/health')
            if response.status_code == 200:
                return True
        except:
            time.sleep(2)
    return False

def main():
    if not check_mongodb():
        print("MongoDB must be running to start services")
        sys.exit(1)

    # Define services and their ports
    services = [
        ('API Gateway', 5000),
        ('Auth Service', 5001),
        ('Course Service', 5002),
        ('Quiz Service', 5003),
        ('User Service', 5004),
        ('Assignment Service', 5005)
    ]

    # Kill any existing processes on the ports
    for _, port in services:
        kill_process_on_port(port)

    processes = []
    try:
        # Start each service
        for service_name, port in services:
            service_dir = service_name.lower().replace(' ', '-')
            service_path = os.path.join('services', service_dir, 'app.py')
            
            if not os.path.exists(service_path):
                print(f"Warning: {service_path} not found")
                continue

            process = subprocess.Popen([sys.executable, service_path])
            processes.append((service_name, process))
            print(f"Started {service_name} on port {port}")

        # Wait for services to be ready
        print("\nWaiting for services to start...")
        time.sleep(5)

        # Check if services are running
        all_services_running = True
        for service_name, port in services:
            if check_service(port):
                print(f"{service_name} is running on port {port}")
            else:
                print(f"Warning: {service_name} failed to start on port {port}")
                all_services_running = False

        if all_services_running:
            print("\nAll services are running!")
            print("Press Ctrl+C to stop all services")
            
            while True:
                time.sleep(5)

    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        print("Stopping all services...")
        for name, process in processes:
            print(f"Stopping {name}...")
            process.terminate()
        print("All services stopped")

if __name__ == "__main__":
    main() 