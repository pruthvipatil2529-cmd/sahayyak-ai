# Sahayyak AI — Testing Strategy & Test Execution

## 1. Backend Testing Suite
The backend is tested using **Pytest** with FastAPI's `TestClient`.

### Covered Test Cases:
* `test_health_check`: Verifies the API health endpoint.
* `test_root`: Verifies base greeting and metadata.
* `test_get_categories`: Verifies database category queries and relations.
* `test_get_guides`: Verifies retrieval of seeded technology guides.
* `test_search_guides`: Verifies search queries across titles and tags.
* `test_user_registration_and_login`: Verifies user registration, bcrypt password hashing, JWT generation, and authenticated `/users/me`.
* `test_ai_chat_safety_interception`: Verifies sensitive keyword interception and safety warning generation.
* `test_ai_chat_general_query`: Verifies structured AI response with numbered steps.

### Running Backend Tests:
```bash
cd backend
venv\Scripts\pytest.exe tests\test_api.py -v
```

## 2. Frontend Build Testing
```bash
cd frontend
npm run build
```
Vite transforms modules and bundles production assets with zero errors.
