# Sahayyak AI — System Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │               Client Browser                  │
                    │   React 18 + Vite + Tailwind CSS + Lucide     │
                    │   Web Speech API (STT & TTS) + i18n Engine    │
                    └───────────────────────┬───────────────────────┘
                                            │ HTTP / JSON
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │            FastAPI Backend Gateway            │
                    │         (Uvicorn ASGI, Python 3.11)           │
                    ├───────────────────────────────────────────────┤
                    │ • CORS Middleware                             │
                    │ • JWT Authentication & Password Hashing       │
                    │ • Safety Inspection Shield (PII & Pin filter) │
                    └───────┬───────────────────────────────┬───────┘
                            │                               │
             Direct SQL     │                               │ External API
             Queries via    ▼                               ▼ with Fallback
    ┌───────────────────────────────┐       ┌───────────────────────────────┐
    │     SQLAlchemy ORM Layer      │       │     Gemini AI Service Layer   │
    │  (SQLite default / Postgres)  │       │   (google-generativeai / REST)│
    ├───────────────────────────────┤       ├───────────────────────────────┤
    │ Tables:                       │       │ • System prompt formatting    │
    │ • users                       │       │ • Structured step generator   │
    │ • categories                  │       │ • Sensitive keyword screener  │
    │ • guides                      │       │ • Offline knowledge fallback  │
    │ • saved_guides                │       └───────────────────────────────┘
    │ • conversations & messages    │
    └───────────────────────────────┘
```

## 1. Directory Structure

```text
sahayyak-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── guides.py
│   │   │   ├── categories.py
│   │   │   ├── conversations.py
│   │   │   └── ai.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── guide.py
│   │   │   └── conversation.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── guide.py
│   │   │   └── ai.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   └── safety_service.py
│   │   ├── main.py
│   │   └── seed_data.py
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GuideCard.jsx
│   │   │   ├── VoiceButton.jsx
│   │   │   ├── TextToSpeech.jsx
│   │   │   ├── SafetyBanner.jsx
│   │   │   └── AccessibilityBar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── AccessibilityContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── GuideLibrary.jsx
│   │   │   ├── GuideDetail.jsx
│   │   │   ├── SafetyHub.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Admin.jsx
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   └── mr.json
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database.md
│   ├── ai-system.md
│   ├── security.md
│   ├── testing.md
│   ├── deployment.md
│   └── user-guide.md
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 2. Key Architectural Decisions
* **Accessibility-First**: Clean typography, high contrast, text scaling with CSS variables and Tailwind classes.
* **Resilient AI**: Dedicated AI layer that wraps Google Gemini 1.5/2.0 API with a keyword-indexed local fallback database so users never experience a dead end even without API keys or an internet outage.
* **Zero Financial Storage**: The safety engine actively intercepts queries containing keywords like OTP, UPI PIN, CVV, passwords and warns users instantly before any payload is dispatched.
