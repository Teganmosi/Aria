import pytest

def test_create_note(client, auth_headers):
    response = client.post("/api/v1/notes", headers=auth_headers, json={
        "title": "Test Note",
        "content": "This is a test note",
        "source_type": "general"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Note"
    assert data["content"] == "This is a test note"
    assert "id" in data

def test_get_notes(client, auth_headers):
    # Create a note first
    client.post("/api/v1/notes", headers=auth_headers, json={
        "title": "Note 1",
        "content": "Content 1"
    })
    
    response = client.get("/api/v1/notes", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_locked_note(client, auth_headers):
    # Create a locked note
    response = client.post("/api/v1/notes", headers=auth_headers, json={
        "title": "Secret Note",
        "content": "Secret Content",
        "password": "secretpassword"
    })
    note_id = response.json()["id"]
    
    # List notes - content should be masked
    response = client.get("/api/v1/notes", headers=auth_headers)
    note = next(n for n in response.json() if n["id"] == note_id)
    assert note["content"] == "This note is locked."
    assert note["is_locked"] is True

    # Get specific note - content should be masked
    response = client.get(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert response.json()["content"] == "This note is locked."

    # Unlock note
    response = client.post(f"/api/v1/notes/{note_id}/unlock", headers=auth_headers, json={
        "password": "secretpassword"
    })
    assert response.status_code == 200
    assert response.json()["content"] == "Secret Content"

def test_update_note(client, auth_headers):
    response = client.post("/api/v1/notes", headers=auth_headers, json={
        "title": "Original Title",
        "content": "Original Content"
    })
    note_id = response.json()["id"]
    
    response = client.put(f"/api/v1/notes/{note_id}", headers=auth_headers, json={
        "title": "Updated Title"
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"

def test_delete_note(client, auth_headers):
    response = client.post("/api/v1/notes", headers=auth_headers, json={
        "title": "To Delete",
        "content": "Content"
    })
    note_id = response.json()["id"]
    
    response = client.delete(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert response.status_code == 204
    
    response = client.get(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert response.status_code == 404
