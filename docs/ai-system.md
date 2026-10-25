# Sahayyak AI — AI & Prompt Engineering Architecture

## 1. Google Gemini AI Integration
The AI service is abstracted under `backend/app/services/ai_service.py` using Google's `google-generativeai` SDK with `gemini-1.5-flash`.

### System Prompt Design (PRD Section 17)
The prompt instructs the AI to behave like a kind, infinitely patient digital teacher:
1. Speak in simple, everyday language without technical jargon.
2. Break explanations into sequential, bite-sized numbered steps.
3. Keep introductions warm and reassuring.
4. Conclude with a safety reminder when payments or credentials are involved.
5. Strictly adhere to the requested language (English, Hindi, Marathi).

## 2. Safety Interception Shield
Before sending any prompt to the AI or storing it, user messages pass through `backend/app/services/safety_service.py`:
* **Regex Patterns**: Scans for OTPs, 4/6-digit UPI PINs, ATM PINs, CVVs, 16-digit card numbers, passwords, and bank accounts.
* **Auto-Sanitization**: Redacts the credentials before dispatching.
* **Alert Trigger**: Injects a localized Safety Warning informing the user never to share financial secrets.

## 3. Offline-Resilient Fallback Engine (PRD Section 44 & 45)
Even without an internet connection or if no `GEMINI_API_KEY` is provided:
* The system matches keywords against local structured knowledge (WhatsApp photos, Wi-Fi setup, UPI rules, Bluetooth, font sizing, etc.).
* Returns step-by-step instructions in the user's active language (English, Hindi, or Marathi).
* Fetches matching guides from the database.
* Guarantees 100% uptime with zero crashes.
