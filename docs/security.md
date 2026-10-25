# Sahayyak AI — Security Architecture & Guidelines

## 1. Password Hashing & Authentication
* **Bcrypt Algorithm**: User passwords hashed using `bcrypt` with unique salt per user. Plaintext passwords are never stored or logged.
* **JWT Tokens**: Authenticated sessions issue signed JSON Web Tokens (`HS256`) with a configurable expiration window.

## 2. Zero Financial Credential Storage
* The database schema contains zero fields for financial instruments (no cards, OTPs, CVVs, or PINs).
* Proactive pre-flight screening sanitizes inputs and alerts users immediately.

## 3. API Security & CORS
* Cross-Origin Resource Sharing (CORS) restricted to authorized origins specified in `.env`.
* Rate limiting friendly error handling shields against stack trace leakage.
* Production passwords and tokens must be stored in `.env` (excluded via `.gitignore`).

## 4. Role-Based Access Control (RBAC)
* Endpoints for creating, updating, or deleting guides require `is_admin=True` validation.
