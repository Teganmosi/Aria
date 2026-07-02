import pytest

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome to Aria" in response.json()["message"]

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_register_user(client):
    import uuid
    email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "New User"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == email
    assert "access_token" in data

def test_login_user(client):
    import uuid
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    # Registration is handled in the fixture or here
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Login User"
    })
    
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data

def test_login_invalid_credentials(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    email = response.json()["email"]
    assert "test_" in email
    assert email.endswith("@example.com")
