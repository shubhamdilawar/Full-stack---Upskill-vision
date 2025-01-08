from app import app
import requests

def test_check_email():
    with app.test_client() as client:
        # Test check-email route
        response = client.post('/auth/check-email', json={'email': 'test@example.com'})
        print("Response:", response.get_json())
        assert response.status_code in [200, 404]

if __name__ == '__main__':
    test_check_email() 