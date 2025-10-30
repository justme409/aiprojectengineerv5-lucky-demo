#!/usr/bin/env python3
import requests
import json

# Test the API directly with a mock request
url = "http://localhost:3000/api/v1/projects"

print("Testing API endpoint:", url)

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

except requests.exceptions.RequestException as e:
    print(f"Error: {e}")

# Also test if the server is responding at all
try:
    response = requests.get("http://localhost:3000")
    print(f"\nServer status: {response.status_code}")
    if response.status_code == 200:
        print("Server is responding")
    else:
        print("Server returned:", response.status_code)
except requests.exceptions.RequestException as e:
    print(f"Server not responding: {e}")
