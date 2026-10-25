import json
import logging
import asyncio
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Sahayyak AI (सहाय्यक AI), an extraordinarily kind, patient, respectful, and loving digital teacher and companion.
You were created specifically to guide senior citizens, elderly parents and grandparents, rural beginners, and first-time smartphone users who have zero or very little knowledge about technology and digitalization.

Empathy and Persona:
- Speak with deep warmth, respect, and encouragement. Use honorifics where appropriate (e.g. 'Dear friend', 'नमस्ते जी', 'नमस्कार जी').
- Understand digital anxiety: Beginners often fear pressing the wrong button, breaking their phone, or losing money. Continually reassure them that they are doing wonderfully, that there is no hurry, and that you are right beside them.
- Treat every question with utmost seriousness, no matter how basic it may seem.

Strict Rules for Beginners with Zero Digital Knowledge:
1. ABSOLUTELY NO TECHNICAL JARGON:
   - Never use technical words like 'UI', 'OS', 'cache', 'URL', 'dialogue box', 'browser tab', 'authentication', 'reboot', 'interface', 'syntax', 'backend', 'toggle', 'credentials'.
   - Describe screen elements by their physical visual appearance, shapes, colors, and locations on the screen:
     * Instead of 'app' -> 'the little picture or icon on your screen'
     * Instead of 'Settings' -> 'the Settings icon that looks like a small gear or wheel ⚙️'
     * Instead of 'Search' -> 'the magnifying glass symbol 🔍'
     * Instead of 'Microphone' -> 'the little microphone symbol 🎙️'
     * Instead of 'Link / URL' -> 'the blue highlighted text'
     * Instead of 'Tap / Click' -> 'gently touch with your finger'
     * Instead of 'Swipe' -> 'gently slide your finger across the glass'
2. SINGLE-ACTION NUMBERED STEPS:
   - Break tasks into sequential, numbered steps where each step describes only ONE single physical action.
   - Mention the exact screen location for each action (e.g. 'Look at the very top right corner', 'At the bottom of your screen').
3. DIGITAL SAFETY SHIELD (ALWAYS HIGHLIGHT FOR PAYMENTS / CODES):
   - Whenever money, payments, UPI (Google Pay, PhonePe, Paytm), bank accounts, OTP, passwords, or unknown callers/messages are mentioned, provide a clear, bold safety tip:
     * Golden Rule: 'Remember: Your secret UPI PIN is ONLY entered to SEND money. You NEVER need to enter your PIN or scan a QR code to RECEIVE money!'
     * 'Never share your bank SMS OTP or secret PIN with anyone, even if someone claims to call from your bank, police, or electricity board.'
4. MULTILINGUAL SUPPORT:
   - If the user asks in Hindi or the requested language is 'hi', reply in warm, respectful, pure everyday Hindi (using 'आप', 'जी', and simple words).
   - If the user asks in Marathi or the requested language is 'mr', reply in warm, respectful, pure everyday Marathi (using 'नमस्कार', 'काळजी करू नका', and simple words).
   - If the user asks in English or the requested language is 'en', reply in gentle, plain English.
   - Always respond in the requested language.

Required JSON Output Schema:
You MUST ALWAYS respond with a single valid JSON object with these exact keys:
{
  "intro": "Warm, respectful greeting, empathetic reassurance, and 1-2 friendly sentences explaining what we will do together.",
  "steps": [
    "Step 1: Simple physical action describing icon, shape, color, and location",
    "Step 2: Next simple physical action",
    "Step 3: ..."
  ],
  "safety_tip": "A crucial safety precaution if money, banking, links, or strangers are involved, or a helpful beginner tip. Return null if no safety tip is needed.",
  "closing": "An encouraging concluding sentence reassuring them that they did a great job and can ask anything anytime."
}
"""

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-3.5-flash-lite"
        self._gemini_client = None
        self._init_gemini()

    def _init_gemini(self):
        """Initializes the Gemini generative AI model with JSON schema and elder-friendly system prompt."""
        if self.api_key and self.api_key.strip():
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key.strip())
                self._gemini_client = genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={"response_mime_type": "application/json"}
                )
                logger.info(f"Google Gemini AI client configured successfully with model {self.model_name}.")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini client: {e}.")
                self._gemini_client = None
        else:
            logger.warning("No GEMINI_API_KEY configured. Please set GEMINI_API_KEY in .env.")
            self._gemini_client = None

    async def generate_response(
        self,
        message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        db_guides: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically generates an empathetic, elder-friendly response using the Gemini API.
        All answers are dynamically generated using the API key — no preset or hardcoded replies.
        """
        lang = language if language in ["en", "hi", "mr"] else "en"
        related = self._find_related_guides(message, db_guides)

        # 1. Check if Gemini client is initialized
        if not self._gemini_client:
            missing_key_messages = {
                "en": "Dear friend, the assistant's AI key is not configured. Please add your Gemini API key in the configuration (.env) so I can help you with anything you need!",
                "hi": "नमस्ते जी! आपके प्रश्नों के सीधे और नए जवाब देने के लिए कृपया .env फाइल में GEMINI_API_KEY सेट करें। मैं आपकी मदद के लिए पूरी तरह तैयार हूँ!",
                "mr": "नमस्कार! थेट आणि नवीन उत्तरे मिळवण्यासाठी कृपया .env फाईलमध्ये GEMINI_API_KEY जोडा. मी तुमच्या मदतीसाठी सदैव तयार आहे!"
            }
            return {
                "answer": missing_key_messages.get(lang, missing_key_messages["en"]),
                "language": lang,
                "steps": [],
                "safety_warning": None,
                "related_guides": related
            }

        # 2. Build dynamic prompt with conversation context
        lang_names = {"en": "English", "hi": "Hindi (हिंदी)", "mr": "Marathi (मराठी)"}
        prompt_parts = [
            f"Target Language: {lang_names.get(lang, 'English')}",
            f"User Question: {message}"
        ]

        if conversation_history:
            recent_context = []
            for item in conversation_history[-4:]:
                role = item.get("role", "user")
                content = item.get("content", "").strip()
                if content:
                    recent_context.append(f"{role.capitalize()}: {content}")
            if recent_context:
                prompt_parts.insert(0, "Recent Conversation Context:\n" + "\n".join(recent_context) + "\n")

        prompt_text = "\n".join(prompt_parts)

        # 3. Call Gemini dynamically
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(self._gemini_client.generate_content, prompt_text),
                timeout=12.0
            )

            raw_text = response.text
            parsed = self._parse_gemini_json(raw_text)

            intro = (parsed.get("intro") or "").strip()
            raw_steps = parsed.get("steps") or []
            safety_tip = parsed.get("safety_tip")
            closing = (parsed.get("closing") or "").strip()

            # Format structured steps for interactive step cards
            clean_steps = []
            for i, s in enumerate(raw_steps):
                clean_text = re.sub(
                    r"^(?:(?:Step|कदम|चरण|पायरी|टप्पा)\s*\d+[\s:.-]*|\d+[\s:.-]+)",
                    "",
                    str(s),
                    flags=re.IGNORECASE
                ).strip()
                clean_steps.append({"step": i + 1, "text": clean_text or str(s)})

            # Assemble conversational text for intro and closing (steps are rendered as dedicated interactive cards)
            body_parts = []
            if intro:
                body_parts.append(intro)
            if not clean_steps and raw_steps:
                # Fallback if steps could not be structured cleanly
                step_lines = [f"{i+1}. {s}" for i, s in enumerate(raw_steps)]
                body_parts.append("\n".join(step_lines))
            if closing:
                body_parts.append(closing)

            answer = "\n\n".join(body_parts) if body_parts else intro or raw_text

            return {
                "answer": answer,
                "intro": intro,
                "closing": closing,
                "language": lang,
                "steps": clean_steps,
                "safety_warning": safety_tip if safety_tip else None,
                "related_guides": related
            }

        except (asyncio.TimeoutError, Exception) as e:
            logger.error(f"Dynamic Gemini API generation error: {e}", exc_info=True)
            error_messages = {
                "en": "Dear friend, I am having a little difficulty connecting to the internet server right now. Please check your internet connection and try asking me again in a moment. I am right here waiting to help you!",
                "hi": "नमस्ते जी! इस समय इंटरनेट से जुड़ने में थोड़ी रुकावट आ रही है। कृपया अपना इंटरनेट कनेक्शन जांचें और कुछ पलों बाद पुनः पूछें। मैं आपकी सहायता के लिए यहीं हूँ!",
                "mr": "नमस्कार! या क्षणी इंटरनेट सर्व्हरशी संपर्क साधण्यात थोडी अडचण येत आहे. कृपया आपले इंटरनेट तपासून काही क्षणांनंतर पुन्हा विचारा. मी मदतीसाठी इथेच आहे!"
            }
            return {
                "answer": error_messages.get(lang, error_messages["en"]),
                "language": lang,
                "steps": [],
                "safety_warning": None,
                "related_guides": related
            }

    def _parse_gemini_json(self, raw_text: str) -> Dict[str, Any]:
        """Safely parses JSON from Gemini's response, extracting from markdown codeblocks if necessary."""
        text = raw_text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
            text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
            text = text.strip()

        try:
            return json.loads(text)
        except Exception:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass

        # Fallback if raw text wasn't strict JSON
        return {
            "intro": text,
            "steps": [],
            "safety_tip": None,
            "closing": None
        }

    def _find_related_guides(self, query: str, db_guides: Optional[List[Any]]) -> List[Dict[str, Any]]:
        """Dynamically finds related step-by-step guides from the database based on query relevance."""
        if not db_guides:
            return []
        q_words = [w.lower() for w in query.split() if len(w) > 3]
        results = []
        for g in db_guides:
            title_lower = getattr(g, "title", "").lower()
            tags_lower = (getattr(g, "tags", "") or "").lower()
            if any(w in title_lower or w in tags_lower for w in q_words):
                results.append({
                    "id": g.id,
                    "title": g.title,
                    "difficulty": getattr(g, "difficulty", "Easy")
                })
            if len(results) >= 3:
                break
        return results

ai_service = AIService()
