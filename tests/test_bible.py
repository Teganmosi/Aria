import pytest
from unittest.mock import patch, MagicMock

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@patch("database.db.fetch_bible_chapter_from_api")
def test_get_bible_chapter(mock_fetch, client):
    # Mock data
    mock_fetch.return_value = [
        {"book": "Genesis", "chapter": 1, "verse": 1, "text": "In the beginning...", "version": "KJV"}
    ]
    
    response = client.get("/api/v1/bible/chapter/Genesis/1?version=KJV")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["book"] == "Genesis"
    assert len(data["verses"]) == 1
    assert data["verses"][0]["text"] == "In the beginning..."

def test_create_bible_study_session(client, auth_headers):
    response = client.post("/api/v1/bible-study/sessions", headers=auth_headers, json={
        "book": "John",
        "chapter": 3,
        "verses": [16],
        "selected_text": "For God so loved the world"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["book"] == "John"
    assert data["chapter"] == 3
    assert data["verses"] == [16]
    assert "id" in data

def test_get_bible_study_sessions(client, auth_headers):
    client.post("/api/v1/bible-study/sessions", headers=auth_headers, json={
        "book": "Psalms",
        "chapter": 23,
        "verses": [1],
        "selected_text": "The Lord is my shepherd"
    })
    
    response = client.get("/api/v1/bible-study/sessions", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
