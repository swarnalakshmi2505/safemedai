import httpx
import sys

def test_endpoints():
    base_url = "http://localhost:8000"
    # I don't have a token, but I can check if they respond with 401 (meaning they exist)
    # vs 404 or 500.
    endpoints = [
        "/doctor-reports/my-reports",
        "/alerts/",
        "/data/summary",
        "/analytics/leaderboard"
    ]
    
    for ep in endpoints:
        try:
            r = httpx.get(f"{base_url}{ep}")
            print(f"{ep}: {r.status_code}")
        except Exception as e:
            print(f"{ep}: ERROR {str(e)}")

if __name__ == "__main__":
    test_endpoints()
