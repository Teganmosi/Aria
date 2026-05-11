import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sqlite3

# Set environment variables for testing BEFORE importing app
os.environ["DATABASE_PATH"] = "test_aria.db"
os.environ["REDIS_ENABLED"] = "false"
os.environ["SECRET_KEY"] = "test_secret_key"

import init_sqlite

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create a fresh test database for the session using the project's init script"""
    db_path = "test_aria.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except PermissionError:
            pass # Hope for the best
    
    # Patch DB_NAME in init_sqlite and run it
    with patch("init_sqlite.DB_NAME", db_path):
        init_sqlite.init_db()
    
    # Trigger any migrations/extra tables from Database class
    from database import Database
    db = Database()
    # Database.__init__ calls _ensure_tables which adds columns like is_locked

    yield
    
    # Clean up after all tests
    # Note: On Windows, this often fails if connections are still open.
    # We'll try, but it's not critical for the tests to pass.
    # if os.path.exists(db_path):
    #     try:
    #         os.remove(db_path)
    #     except PermissionError:
    #         pass

@pytest.fixture
def client():
    """FastAPI TestClient"""
    from main import app
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def mock_ai():
    """Mock AI Service to avoid API calls"""
    with patch("main.ai_service") as mock:
        mock.generate_response.return_value = "Mocked AI Response"
        mock.explain_bible_verse.return_value = "Mocked Bible Explanation"
        mock.provide_emotional_support.return_value = "Mocked Emotional Support"
        yield mock

@pytest.fixture
def auth_headers(client):
    """Fixture to provide a logged-in user's headers"""
    email = "test@example.com"
    password = "password123"
    # Try to register, if it fails (user exists), it's fine for tests
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
