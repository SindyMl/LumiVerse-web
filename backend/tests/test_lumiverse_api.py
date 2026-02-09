"""
LumiVerse Bible App - Backend API Tests
Tests for: Bible endpoints (sections, books, chapters, verses), Auth, Paths, Notes, Highlights
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL').rstrip('/')

class TestBibleEndpoints:
    """Bible reading endpoints - sections, books, chapters, verses"""

    def test_get_sections_returns_8(self):
        """Should return exactly 8 sections"""
        response = requests.get(f"{BASE_URL}/api/sections")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 8
        # Verify structure
        assert all('id' in s and 'name' in s and 'book_count' in s for s in data)

    def test_get_all_books_returns_66(self):
        """Should return all 66 books of the Bible"""
        response = requests.get(f"{BASE_URL}/api/books")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 66
        # Verify structure
        assert all('abbrev' in b and 'name' in b and 'chapter_count' in b for b in data)

    def test_get_books_by_section_law_returns_5(self):
        """Law section should have exactly 5 books"""
        response = requests.get(f"{BASE_URL}/api/books?section_id=law")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        # All should be law section
        assert all(b['section_id'] == 'law' for b in data)

    def test_get_specific_book_genesis(self):
        """Should get Genesis book details"""
        response = requests.get(f"{BASE_URL}/api/books/gn")
        assert response.status_code == 200
        data = response.json()
        assert data['abbrev'] == 'gn'
        assert data['name'] == 'Genesis'
        assert data['chapter_count'] == 50

    def test_get_chapter_genesis_1_has_31_verses(self):
        """Genesis chapter 1 should have 31 verses"""
        response = requests.get(f"{BASE_URL}/api/chapters/gn/1")
        assert response.status_code == 200
        data = response.json()
        assert data['book_abbrev'] == 'gn'
        assert data['chapter_number'] == 1
        assert 'verses' in data
        assert len(data['verses']) == 31
        # Verify verse structure
        assert all('number' in v and 'text' in v for v in data['verses'])

    def test_get_daily_verse_returns_valid_verse(self):
        """Daily verse should return a random verse"""
        response = requests.get(f"{BASE_URL}/api/verse/daily")
        assert response.status_code == 200
        data = response.json()
        assert 'book_name' in data
        assert 'book_abbrev' in data
        assert 'chapter' in data
        assert 'verse_number' in data
        assert 'text' in data
        assert len(data['text']) > 0

    def test_get_chapter_nonexistent_returns_404(self):
        """Should return 404 for non-existent chapter"""
        response = requests.get(f"{BASE_URL}/api/chapters/gn/999")
        assert response.status_code == 404

    def test_search_bible(self):
        """Should search Bible text"""
        response = requests.get(f"{BASE_URL}/api/search?q=love")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert 'text' in data[0]
            assert 'book_name' in data[0]


class TestAuthEndpoints:
    """Authentication endpoints"""

    def test_create_anonymous_user(self):
        """Should create anonymous user and return user object"""
        response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_User"}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'id' in data
        assert data['display_name'] == 'TEST_User'
        assert 'created_at' in data


class TestPathsEndpoints:
    """Reading paths CRUD endpoints"""

    def test_create_path_and_verify_persistence(self):
        """Create a path and verify it persists"""
        # First create a user
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_PathUser"}
        )
        user_id = user_response.json()['id']

        # Create path
        path_payload = {
            "user_id": user_id,
            "name": "TEST_MyPath",
            "description": "Test reading path",
            "items": [
                {"book_abbrev": "gn", "chapter_number": 1, "book_name": "Genesis"}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/paths",
            json=path_payload
        )
        assert create_response.status_code == 200
        created_path = create_response.json()
        assert created_path['name'] == "TEST_MyPath"
        assert created_path['user_id'] == user_id
        path_id = created_path['id']

        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/paths?user_id={user_id}")
        assert get_response.status_code == 200
        paths = get_response.json()
        assert any(p['id'] == path_id for p in paths)

        # Cleanup
        requests.delete(f"{BASE_URL}/api/paths/{path_id}")

    def test_update_path(self):
        """Should update path details"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_UpdateUser"}
        )
        user_id = user_response.json()['id']

        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/paths",
            json={"user_id": user_id, "name": "TEST_Original", "items": []}
        )
        path_id = create_response.json()['id']

        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/paths/{path_id}",
            json={"name": "TEST_Updated"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated['name'] == "TEST_Updated"

        # Cleanup
        requests.delete(f"{BASE_URL}/api/paths/{path_id}")

    def test_delete_path(self):
        """Should delete path"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_DeleteUser"}
        )
        user_id = user_response.json()['id']

        create_response = requests.post(
            f"{BASE_URL}/api/paths",
            json={"user_id": user_id, "name": "TEST_ToDelete", "items": []}
        )
        path_id = create_response.json()['id']

        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/paths/{path_id}")
        assert delete_response.status_code == 200

        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/paths?user_id={user_id}")
        paths = get_response.json()
        assert not any(p['id'] == path_id for p in paths)


class TestNotesEndpoints:
    """Notes CRUD endpoints"""

    def test_create_note_and_verify_persistence(self):
        """Create note and verify it persists"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_NoteUser"}
        )
        user_id = user_response.json()['id']

        note_payload = {
            "user_id": user_id,
            "book_abbrev": "gn",
            "chapter_number": 1,
            "verse_number": 1,
            "text": "TEST_This is my note",
            "tags": ["creation"]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/notes",
            json=note_payload
        )
        assert create_response.status_code == 200
        created_note = create_response.json()
        assert created_note['text'] == "TEST_This is my note"
        assert created_note['book_abbrev'] == "gn"
        note_id = created_note['id']

        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/notes?user_id={user_id}")
        assert get_response.status_code == 200
        notes = get_response.json()
        assert any(n['id'] == note_id for n in notes)

        # Cleanup
        requests.delete(f"{BASE_URL}/api/notes/{note_id}")

    def test_update_note(self):
        """Should update note text"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_UpdateNoteUser"}
        )
        user_id = user_response.json()['id']

        create_response = requests.post(
            f"{BASE_URL}/api/notes",
            json={
                "user_id": user_id,
                "book_abbrev": "gn",
                "chapter_number": 1,
                "verse_number": 1,
                "text": "TEST_Original note"
            }
        )
        note_id = create_response.json()['id']

        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/notes/{note_id}",
            json={"text": "TEST_Updated note"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated['text'] == "TEST_Updated note"

        # Cleanup
        requests.delete(f"{BASE_URL}/api/notes/{note_id}")

    def test_delete_note(self):
        """Should delete note"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_DeleteNoteUser"}
        )
        user_id = user_response.json()['id']

        create_response = requests.post(
            f"{BASE_URL}/api/notes",
            json={
                "user_id": user_id,
                "book_abbrev": "gn",
                "chapter_number": 1,
                "verse_number": 1,
                "text": "TEST_To delete"
            }
        )
        note_id = create_response.json()['id']

        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/notes/{note_id}")
        assert delete_response.status_code == 200

        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/notes?user_id={user_id}")
        notes = get_response.json()
        assert not any(n['id'] == note_id for n in notes)


class TestHighlightsEndpoints:
    """Highlights CRUD endpoints"""

    def test_create_highlight_and_verify_persistence(self):
        """Create highlight and verify it persists"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_HighlightUser"}
        )
        user_id = user_response.json()['id']

        highlight_payload = {
            "user_id": user_id,
            "book_abbrev": "gn",
            "chapter_number": 1,
            "verse_number": 1,
            "color": "#FFD700"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/highlights",
            json=highlight_payload
        )
        assert create_response.status_code == 200
        created_highlight = create_response.json()
        assert created_highlight['color'] == "#FFD700"
        assert created_highlight['book_abbrev'] == "gn"
        highlight_id = created_highlight['id']

        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/highlights?user_id={user_id}")
        assert get_response.status_code == 200
        highlights = get_response.json()
        assert any(h['id'] == highlight_id for h in highlights)

        # Cleanup
        requests.delete(f"{BASE_URL}/api/highlights/{highlight_id}")

    def test_delete_highlight(self):
        """Should delete highlight"""
        user_response = requests.post(
            f"{BASE_URL}/api/auth/anonymous",
            json={"display_name": "TEST_DeleteHighlightUser"}
        )
        user_id = user_response.json()['id']

        create_response = requests.post(
            f"{BASE_URL}/api/highlights",
            json={
                "user_id": user_id,
                "book_abbrev": "gn",
                "chapter_number": 1,
                "verse_number": 1,
                "color": "#FFD700"
            }
        )
        highlight_id = create_response.json()['id']

        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/highlights/{highlight_id}")
        assert delete_response.status_code == 200

        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/highlights?user_id={user_id}")
        highlights = get_response.json()
        assert not any(h['id'] == highlight_id for h in highlights)
