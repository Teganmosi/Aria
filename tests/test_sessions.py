import pytest

def test_create_emotional_support_session(client, auth_headers):
    response = client.post("/api/v1/emotional-support/sessions", headers=auth_headers, json={
        "mood": "Peaceful",
        "situation_description": "Having a great morning"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["mood"] == "Peaceful"
    assert "ai_response" in data
    assert "id" in data

def test_get_emotional_support_sessions(client, auth_headers):
    client.post("/api/v1/emotional-support/sessions", headers=auth_headers, json={
        "mood": "Grateful",
        "situation_description": "Thankful for life"
    })
    
    response = client.get("/api/v1/emotional-support/sessions", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_emotional_support_messages(client, auth_headers):
    # Create session
    resp = client.post("/api/v1/emotional-support/sessions", headers=auth_headers, json={
        "mood": "Anxious",
        "situation_description": "Big project coming up"
    })
    session_id = resp.json()["id"]
    
    # Add message
    response = client.post(f"/api/v1/emotional-support/sessions/{session_id}/messages", headers=auth_headers, json={
        "role": "user",
        "content": "Can you share a verse for peace?"
    })
    assert response.status_code == 200
    assert response.json()["content"] == "Can you share a verse for peace?"
    
    # Get messages
    response = client.get(f"/api/v1/emotional-support/sessions/{session_id}/messages", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
