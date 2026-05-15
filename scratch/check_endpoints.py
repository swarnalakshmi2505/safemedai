import requests

BASE_URL = "http://localhost:8000"

def check_endpoint(endpoint):
    try:
        # We might need a token, but let's see if it even reaches the backend
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"GET {endpoint}: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    check_endpoint("/alerts/")
    check_endpoint("/doctor-reports/")
