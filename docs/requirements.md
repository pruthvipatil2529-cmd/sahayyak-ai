# Sahayyak AI — Requirements Specification (PRD)

## 1. Overview & Vision
**Sahayyak AI** is an accessible, AI-powered digital companion designed specifically for senior citizens and technology beginners. Modern interfaces are often cluttered, overly technical, and daunting. Sahayyak AI bridges the digital divide with simple, reassuring, step-by-step guidance, voice-first interactions, multi-language support (English, Hindi, Marathi), and proactive scam prevention.

## 2. Target Audience
* **Primary**:
  * Senior citizens (60+ years old) navigating smartphones and digital tools.
  * First-time smartphone and internet users in multilingual regions.
  * Non-technical users seeking simplified, non-jargon instructions.
* **Secondary**:
  * Caregivers, children, and grandchildren setting up guides or assisting elderly family members.
  * Digital literacy non-profits and community trainers.

## 3. Core Functional Requirements
1. **Multilingual Interface & AI Guidance**:
   * Complete localization in English, Hindi (हिंदी), and Marathi (मराठी).
   * Dynamic language toggle affecting UI and AI answers.
2. **AI Digital Teacher (Gemini Powered)**:
   * Patient, polite, and reassuring tone.
   * Step-by-step instructions (one action per step).
   * Automatic scam/sensitive data alerts.
   * Graceful fallback when AI services are offline.
3. **Voice Interaction (Speech-to-Text & Text-to-Speech)**:
   * One-touch voice microphone query.
   * Read aloud button on any step or AI response with replay and pause.
   * Graceful degradation if browser lacks speech APIs.
4. **Curated Technology Guide Library**:
   * 15+ curated guides across categories: Smartphone Basics, WhatsApp, Online Payments & UPI, Email, Internet Safety, Government Services.
   * Step-by-step interactive view with completion checkboxes and audio narration.
   * Bookmark / "My Saved Guides" system.
5. **Safety & Fraud Prevention Shield**:
   * Pre-prompt filter warning users against entering passwords, OTPs, UPI PINs, CVVs, or card numbers.
   * Dedicated Emergency Safety Hub explaining scam patterns (fake customer care, screen sharing scams, payment links).
6. **Accessibility Engine**:
   * 3-tier font size selector (Normal, Large, Extra Large).
   * High contrast mode & light/dark theme.
   * Big touch targets (minimum 48px) and high-contrast color scheme.
   * ARIA labels and keyboard accessibility.
7. **Authentication & Profile**:
   * Secure JWT-based registration and login.
   * Persisted user preferences: preferred language, font size, voice preferences.
   * Guest mode enabling immediate access without mandatory sign-up.
8. **Admin Panel**:
   * Manage categories and guides (Create, Edit, Delete).

## 4. Non-Functional Requirements
* **Simplicity & Empathy**: Zero developer jargon, uncluttered typography, comforting visual palette.
* **Performance**: Sub-100ms guide searches with client-side debouncing and cached guide responses.
* **Security**: Passwords hashed with bcrypt, JWT token expiry, CORS restrictions, zero storage of financial secrets.
* **Reliability**: Fully usable offline/fallback guide library even if external AI APIs are unreachable.
