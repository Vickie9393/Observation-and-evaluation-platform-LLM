import requests
import os
import subprocess

API_URL = "http://localhost:8000"

print("1. Registering demo user...")
try:
    res = requests.post(f"{API_URL}/auth/register", json={"email": "demo@example.com", "password": "password"})
except Exception as e:
    print(f"Failed to connect to API: {e}")
    exit(1)
    
if res.status_code == 400:
    print("User already exists, logging in...")

res = requests.post(f"{API_URL}/auth/login", data={"username": "demo@example.com", "password": "password"})
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("2. Creating demo project...")
res = requests.post(f"{API_URL}/projects/", json={"name": "Live Demonstration Project"}, headers=headers)
api_key = res.json()["api_key"]
print(f"Got API Key: {api_key}")

print("3. Running SDK Demo app...")
env = os.environ.copy()
env["MINIOBSERVE_API_KEY"] = api_key
env["PYTHONPATH"] = os.path.abspath("sdk")

subprocess.run(["python", "demo-app/main.py"], env=env)
