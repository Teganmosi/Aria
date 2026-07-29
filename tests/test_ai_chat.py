import pytest

def test_ai_chat_session_lifecycle(client, auth_headers):
    # 1. Create a chat session
    response = client.post("/api/v1/ai-chat/sessions", headers=auth_headers, json={
        "title": "Test Spiritual Session"
    })
    assert response.status_code == 200
    session_data = response.json()
    assert session_data["title"] == "Test Spiritual Session"
    session_id = session_data["id"]

    # 2. Get list of sessions, should include the new session
    response = client.get("/api/v1/ai-chat/sessions", headers=auth_headers)
    assert response.status_code == 200
    sessions = response.json()
    assert any(s["id"] == session_id for s in sessions)

    # 3. Create a chat message
    # Let's post to /api/v1/ai/chat to get a mocked response and verify the message is saved
    response = client.post(f"/api/v1/ai/chat?session_id={session_id}", headers=auth_headers, json={
        "messages": [{"role": "user", "content": "I am looking for guidance"}],
        "mode": "general"
    })
    assert response.status_code == 200
    assert response.json()["content"] == "Mocked AI Response"

    # 4. Verify messages are saved for this session
    response = client.get(f"/api/v1/ai-chat/sessions/{session_id}/messages", headers=auth_headers)
    assert response.status_code == 200
    messages = response.json()
    # Should have at least the user message and the assistant message
    assert len(messages) >= 2
    assert any(m["content"] == "I am looking for guidance" for m in messages)

    # 5. Delete the chat session
    response = client.delete(f"/api/v1/ai-chat/sessions/{session_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"success": True}

    # 6. Verify session is deleted from list
    response = client.get("/api/v1/ai-chat/sessions", headers=auth_headers)
    assert response.status_code == 200
    sessions = response.json()
    assert not any(s["id"] == session_id for s in sessions)

    # 7. Verify messages are deleted due to cascade delete constraint
    # Getting messages for a deleted session should return 403 Forbidden since the session no longer belongs to user/exists
    response = client.get(f"/api/v1/ai-chat/sessions/{session_id}/messages", headers=auth_headers)
    assert response.status_code == 403
