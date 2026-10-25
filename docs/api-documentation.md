# Sahayyak AI — REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive Documentation:
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### Register User
* **Method**: `POST`
* **Endpoint**: `/auth/register`
* **Request Body**:
```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "Password123",
  "preferred_language": "hi",
  "text_size": "large"
}
```
* **Response** `(201 Created)`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "preferred_language": "hi",
    "text_size": "large",
    "voice_preference": "female_friendly",
    "is_admin": false,
    "created_at": "2026-10-12T17:00:00Z"
  }
}
```

### User Login
* **Method**: `POST`
* **Endpoint**: `/auth/login`
* **Request Body**:
```json
{
  "email": "ramesh@example.com",
  "password": "Password123"
}
```
* **Response** `(200 OK)`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": { ... }
}
```

---

## 2. User Profile Endpoints

### Get Current User Profile
* **Method**: `GET`
* **Endpoint**: `/users/me`
* **Headers**: `Authorization: Bearer <token>`
* **Response** `(200 OK)`: User object.

### Update Profile & Preferences
* **Method**: `PUT`
* **Endpoint**: `/users/me`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "name": "Ramesh Kumar",
  "preferred_language": "mr",
  "text_size": "extralarge",
  "voice_preference": "female_friendly"
}
```

---

## 3. Technology Guides & Categories

### List Categories
* **Method**: `GET`
* **Endpoint**: `/categories`
* **Response** `(200 OK)`: Array of categories with localized names and guide counts.

### List Guides (with Search & Filters)
* **Method**: `GET`
* **Endpoint**: `/guides`
* **Query Parameters**:
  * `category_id` (optional int)
  * `search` (optional string)
  * `difficulty` (optional string)
* **Response** `(200 OK)`: Array of guides with `is_saved` boolean status.

### Get Guide Details by ID
* **Method**: `GET`
* **Endpoint**: `/guides/{id}`
* **Response** `(200 OK)`: Full guide with JSON steps and safety tips.

### Create Guide (Admin)
* **Method**: `POST`
* **Endpoint**: `/guides`
* **Headers**: `Authorization: Bearer <admin_token>`

### Update Guide (Admin)
* **Method**: `PUT`
* **Endpoint**: `/guides/{id}`
* **Headers**: `Authorization: Bearer <admin_token>`

### Delete Guide (Admin)
* **Method**: `DELETE`
* **Endpoint**: `/guides/{id}`
* **Headers**: `Authorization: Bearer <admin_token>`

---

## 4. Bookmarks & Saved Guides

### List Saved Guides
* **Method**: `GET`
* **Endpoint**: `/saved-guides`
* **Headers**: `Authorization: Bearer <token>`

### Save a Guide
* **Method**: `POST`
* **Endpoint**: `/saved-guides/{guide_id}`
* **Headers**: `Authorization: Bearer <token>`

### Remove Saved Guide
* **Method**: `DELETE`
* **Endpoint**: `/saved-guides/{guide_id}`
* **Headers**: `Authorization: Bearer <token>`

---

## 5. AI Assistant & Conversations

### Chat with AI (with Safety Shield)
* **Method**: `POST`
* **Endpoint**: `/ai/chat`
* **Request Body**:
```json
{
  "message": "How do I send a photo on WhatsApp?",
  "language": "hi",
  "conversation_id": null,
  "conversation_history": []
}
```
* **Response** `(200 OK)`:
```json
{
  "conversation_id": 1,
  "answer": "व्हाट्सएप पर फोटो भेजना बहुत आसान है!...",
  "language": "hi",
  "steps": [
    { "step": 1, "text": "अपने फ़ोन पर हरे रंग के व्हाट्सएप ऐप आइकन पर टैप करें।" },
    { "step": 2, "text": "उस व्यक्ति के नाम पर टैप करें जिसे आप फोटो भेजना चाहते हैं।" }
  ],
  "safety_warning": null,
  "related_guides": [
    { "id": 2, "title": "How to Send a Photo on WhatsApp", "difficulty": "Easy" }
  ]
}
```

### List Conversations
* **Method**: `GET`
* **Endpoint**: `/conversations`
* **Headers**: `Authorization: Bearer <token>`

### Delete Conversation
* **Method**: `DELETE`
* **Endpoint**: `/conversations/{id}`
* **Headers**: `Authorization: Bearer <token>`
