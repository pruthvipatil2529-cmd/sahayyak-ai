# Sahayyak AI (सहाय्यक AI)

> **An AI-Powered Digital Assistant for Elderly & Technology-Inexperienced Users**

![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)
![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-cyan.svg)

---

## 🌟 Project Overview
**Sahayyak AI** is an empathetic, accessible web platform built specifically for senior citizens and technology beginners. By simplifying complex smartphone and internet operations into clear, bite-sized, numbered steps, offering multi-language support (English, Hindi, and Marathi), and featuring one-touch voice interaction and proactive scam protection, Sahayyak AI bridges the digital divide with warmth, respect, and peace of mind.

---

## ✨ Key Features
1. **Accessibility-First Design**:
   - Dynamic 3-tier text scaling (**Normal**, **Large**, **Extra Large**) without breaking page layouts.
   - High Contrast, Dark, and Light viewing modes.
   - Tactile buttons with generous minimum 48px touch targets.
   - Fully keyboard navigable and screen-reader accessible.
2. **Native Multilingual Engine**:
   - Complete localization across UI and AI answers in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
   - Preserves proper Unicode rendering and regional phrasing.
3. **Voice Interaction (Speech-to-Text & Text-to-Speech)**:
   - One-touch microphone input using Web Speech API with real-time audio visualization.
   - Text-to-Speech audio reader button on every AI response and every step in guide cards.
   - Calibrated, gentle speaking pace designed for elder comprehension.
4. **Patient AI Assistant (Gemini & Smart Fallback)**:
   - Built on Google Gemini with custom prompt engineering to act as an infinitely patient digital tutor.
   - Offline-resilient fallback knowledge engine providing instant step-by-step guidance even without API keys or an active internet connection.
5. **Safety Shield & Fraud Prevention**:
   - Real-time pre-flight inspection shield that flags and redacts sensitive credentials (OTP, UPI PIN, CVV, passwords).
   - Dedicated **Elder Safety & Fraud Protection Hub** covering common scams (electricity disconnection scam, fake customer care numbers, remote screen sharing apps like AnyDesk).
   - Direct integration of India's **National Cyber Crime Helpline (1930)**.
6. **Curated Technology Guide Library**:
   - 15+ pre-seeded guides covering Wi-Fi, WhatsApp photos/video calls, UPI payments, Gmail, Bluetooth, screenshot capture, and app management.
   - Interactive step completion checklist mode with progress tracking.
   - 1-click guide bookmarking ("My Saved Guides").
7. **Secure Authentication & Personal Dashboard**:
   - JWT authentication with secure Bcrypt password hashing.
   - Guest exploration mode (usable with zero mandatory signup).
   - Personalized dashboard with saved guides and recent questions.
   - Admin control panel for managing guides and categories.

---

## 🛠️ Technology Stack
* **Frontend**:
  * React 18
  * Vite
  * Tailwind CSS
  * Lucide React Icons
  * Web Speech API (SpeechRecognition & SpeechSynthesis)
* **Backend**:
  * Python 3.11
  * FastAPI
  * SQLAlchemy ORM
  * Pydantic V2
  * Bcrypt & Python-Jose (JWT)
  * Google Gemini API (`google-generativeai`)
  * Uvicorn ASGI
* **Database**:
  * SQLite (default for effortless zero-config local development)
  * PostgreSQL (production ready via `DATABASE_URL`)
* **DevOps**:
  * Docker & Docker Compose

---

## 📁 Project Structure
```text
sahayyak-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, users, guides, categories, ai, saved_guides)
│   │   ├── core/         # Config, database engine, security (JWT & Bcrypt)
│   │   ├── models/       # SQLAlchemy models (User, Guide, Category, Conversation, Message)
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # AI service with Gemini & offline fallback, Safety Shield
│   │   ├── main.py       # FastAPI application
│   │   └── seed_data.py  # Comprehensive database seeding script
│   ├── tests/            # Pytest test suite
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # AccessibilityBar, Navbar, Footer, GuideCard, VoiceButton, TextToSpeech, SafetyBanner
│   │   ├── context/      # AccessibilityContext, AuthContext
│   │   ├── locales/      # en.json, hi.json, mr.json
│   │   ├── pages/        # Home, Chat, GuideLibrary, GuideDetail, SafetyHub, Dashboard, Profile, Login, Register, Admin
│   │   ├── api.js        # Axios API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docs/                 # Complete architecture, API, database, and user docs
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18+ (tested on v20+)
* **Python**: 3.10+ (tested on 3.11)

### ⚡ Quick Start (1-Click Launch on Windows)
Simply double-click or run:
```cmd
start.bat
```
*(or `run.bat`)*

This script automatically:
1. Verifies/creates the Python virtual environment and installs backend packages
2. Verifies frontend packages (`npm install`)
3. Starts the FastAPI Backend on `http://localhost:8000`
4. Starts the React/Vite Frontend on `http://localhost:5173`
5. Launches your default web browser to the homepage

To stop all services later, simply double-click:
```cmd
stop.bat
```

---

### Manual Setup Steps
1. Open a terminal in the root directory:
```bash
cd backend
```
2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
* The backend will automatically initialize tables and seed all categories, guides, and demo users on first startup!
* API will be live at: `http://localhost:8000`
* Swagger interactive docs: `http://localhost:8000/docs`

### 3. Frontend Setup
1. In another terminal, navigate to the frontend folder:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the Vite development server:
```bash
npm run dev
```
* Open `http://localhost:5173` in your browser.

---

## 🔑 Demo & Testing Accounts
For testing authenticated features and admin capabilities, the following accounts are pre-seeded:

| Role | Email | Password |
|---|---|---|
| **Senior User Demo** | `demo@sahayyak.ai` | `demo123` |
| **Administrator** | `admin@sahayyak.ai` | `admin123` |

*(You can also use the 1-Click login buttons on the Login page!)*

---

## 🧪 Running Tests

### Backend Tests (Pytest)
```bash
cd backend
venv\Scripts\pytest.exe tests\test_api.py -v
```
All 8 test suites pass:
* Healthcheck & metadata
* Category & guide retrieval
* Guide search & filtering
* User registration, password hashing & JWT auth
* AI safety interception shield
* AI response generation with structured steps

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment
To launch the complete full-stack environment in Docker:
```bash
docker-compose up --build
```
* Web application: `http://localhost:5173`
* Backend API: `http://localhost:8000`

---

## 🛡️ Security Best Practices
* **No Plaintext Passwords**: Uses `bcrypt` hashing with individual salts.
* **Sensitive Information Redaction**: Any OTP, PIN, password, or CVV input is intercepted and sanitized.
* **No Cloud Secrets in Git**: Handled cleanly via `.env` and `.gitignore`.

---

## 📜 License
Released under the MIT License. Built with ❤️ for senior citizens and digital beginners.
