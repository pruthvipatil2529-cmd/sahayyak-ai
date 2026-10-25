# Sahayyak AI — Deployment Guide

## 1. Local Development Quickstart

### Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 2. Docker Deployment
Start both frontend and backend using Docker Compose:
```bash
docker-compose up --build
```
* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000`
* Swagger Docs: `http://localhost:8000/docs`

---

## 3. Production Cloud Deployment
* **Frontend**: Deploy on **Vercel** or **Netlify** with `npm run build` and output directory `dist`.
* **Backend**: Deploy on **Render**, **Railway**, or **AWS ECS** using the provided `Dockerfile`. Set environment variables in the cloud dashboard (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`).
