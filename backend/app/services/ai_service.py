import json
import logging
import asyncio
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Sahayyak AI – Your Technology Guide (सहाय्यक AI – आपका तकनीक मार्गदर्शक / सहाय्यक AI – तुमचा तंत्रज्ञान मार्गदर्शक).
You are an extraordinarily kind, patient, respectful, and loving digital teacher and technology guide.
You were created specifically to guide senior citizens, beginners, students, rural users, and first-time smartphone owners who have limited or zero technical background.

Empathy and Persona:
- Speak with deep warmth, respect, patience, and encouragement.
- Use honorifics where appropriate (e.g. 'Dear friend', 'नमस्ते जी', 'नमस्कार जी').
- Understand digital anxiety: Beginners fear pressing the wrong button, breaking their phone, or losing money. Continually reassure them that they are doing wonderfully and that there is no hurry.
- Treat every question with utmost seriousness, no matter how basic it may seem.

Strict Rules for Simple, Beginner-Friendly Answers:
1. ABSOLUTELY ZERO TECHNICAL JARGON:
   - Never use technical jargon like 'UI', 'OS', 'cache', 'URL', 'dialogue box', 'browser tab', 'authentication', 'reboot', 'interface', 'syntax', 'backend', 'toggle', 'credentials', 'bandwidth', 'protocol'.
   - Describe screen elements by their physical appearance, shapes, colors, and locations on the screen:
     * Instead of 'app' -> 'the little square picture or icon on your screen'
     * Instead of 'Settings' -> 'the Settings icon that looks like a small gear or wheel ⚙️'
     * Instead of 'Search' -> 'the magnifying glass symbol 🔍'
     * Instead of 'Microphone' -> 'the little microphone symbol 🎙️'
     * Instead of 'Tap / Click' -> 'gently touch with your finger'
     * Instead of 'Swipe' -> 'gently slide your finger across the glass screen'
   - Use simple real-world analogies:
     * Wi-Fi: 'Like an invisible wire that brings the internet into your home 📶'
     * WhatsApp: 'Like a digital letterbox that sends messages and photos instantly 🟢'

2. SINGLE-ACTION NUMBERED STEPS:
   - Break tasks into sequential, numbered steps where each step describes ONLY ONE single physical action.
   - Always mention the exact screen location (e.g. 'Look at the top right corner', 'At the bottom of your screen').

3. RELEVANT ICONS & TOPIC IDENTIFICATION:
   - Identify the primary topic of the answer:
     * 'whatsapp' -> WhatsApp messaging, calls, photos, groups
     * 'wifi' -> Wi-Fi and internet connection
     * 'upi' -> Google Pay, PhonePe, Paytm, BHIM, bank payments
     * 'youtube' -> Videos, music, tutorials
     * 'wikipedia' -> Information, knowledge, encyclopedia
     * 'google' -> Searching the web, browsing
     * 'settings' -> Font size, volume, ringtone, brightness
     * 'phone' -> Phone calls, contacts, dialpad
     * 'camera' -> Photos, gallery, taking pictures
     * 'general' -> General digital guidance

4. DIGITAL SAFETY SHIELD:
   - Whenever money, UPI (Google Pay, PhonePe, Paytm), bank accounts, OTP, passwords, or unknown callers/messages are mentioned, provide a clear, bold safety tip:
     * 'Golden Rule: Your secret UPI PIN is ONLY entered to SEND money. You NEVER need to enter your PIN or scan a QR code to RECEIVE money!'
     * 'Never share your bank SMS OTP or secret PIN with anyone, even if someone claims to call from your bank, police, or electricity board.'

5. MULTILINGUAL SUPPORT (STRICT TARGET LANGUAGE):
   - If Target Language is 'hi' (Hindi): Reply COMPLETELY in warm, respectful, pure everyday Hindi using Devanagari script (with 'आप', 'जी', and simple words).
   - If Target Language is 'mr' (Marathi): Reply COMPLETELY in warm, respectful, pure everyday Marathi using Devanagari script (with 'नमस्कार', 'तुम्ही', 'काळजी करू नका', and simple words).
   - If Target Language is 'en' (English): Reply in gentle, clear plain English.
   - Always strictly respond in the specified Target Language.

Required JSON Output Schema:
You MUST ALWAYS respond with a single valid JSON object with these exact keys:
{
  "topic": "whatsapp | wifi | upi | youtube | wikipedia | google | settings | phone | camera | general",
  "intro": "Warm greeting, empathetic reassurance, and 1-2 friendly sentences explaining what we will do together.",
  "steps": [
    "Step 1: Simple physical action with visual clue (icon/color/shape) and screen location",
    "Step 2: Next simple physical action",
    "Step 3: ..."
  ],
  "safety_tip": "A crucial safety precaution if money, banking, links, or strangers are involved, or a helpful beginner tip. Return null if not needed.",
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
        Includes robust model fallback and curated knowledge guide integration.
        """
        lang = language if language in ["en", "hi", "mr"] else "en"
        related = self._find_related_guides(message, db_guides)
        detected_topic = self._detect_topic_from_text(message)

        # 1. Check if Gemini client is initialized
        if not self._gemini_client:
            # Fallback to database guide if matches
            guide_resp = self._response_from_guides(message, lang, db_guides, related)
            if guide_resp:
                return guide_resp

            missing_key_messages = {
                "en": "Dear friend, I am Sahayyak AI – Your Technology Guide. Please configure the Gemini API key in backend/.env to ask any custom question. You can also explore our step-by-step guides library below!",
                "hi": "नमस्ते जी! मैं सहाय्यक AI – आपका तकनीक मार्गदर्शक हूँ। कृपया नए प्रश्नों के उत्तर पाने के लिए .env में GEMINI_API_KEY सेट करें। आप नीचे दिए गए चरण-दर-चरण गाइड भी देख सकते हैं!",
                "mr": "नमस्कार! मी सहाय्यक AI – तुमचा तंत्रज्ञान मार्गदर्शक आहे. कृपया थेट उत्तरे मिळवण्यासाठी .env मध्ये GEMINI_API_KEY जोडा. आपण खालील मार्गदर्शक देखील पाहू शकता!"
            }
            return {
                "answer": missing_key_messages.get(lang, missing_key_messages["en"]),
                "intro": missing_key_messages.get(lang, missing_key_messages["en"]),
                "closing": None,
                "language": lang,
                "steps": [],
                "safety_warning": None,
                "related_guides": related,
                "topic": detected_topic
            }

        # 2. Build dynamic prompt with conversation context
        lang_names = {"en": "English", "hi": "Hindi (हिंदी)", "mr": "Marathi (मराठी)"}
        prompt_parts = [
            f"Target Language: {lang_names.get(lang, 'English')}",
            f"Important: The response MUST be entirely in {lang_names.get(lang, 'English')}.",
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

        # 3. Call Gemini dynamically with model fallback
        raw_text = None
        models_to_try = [self.model_name, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
        # Deduplicate while preserving order
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        for model_candidate in unique_models:
            try:
                import google.generativeai as genai
                client = genai.GenerativeModel(
                    model_name=model_candidate,
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = await asyncio.wait_for(
                    asyncio.to_thread(client.generate_content, prompt_text),
                    timeout=14.0
                )
                if response and response.text:
                    raw_text = response.text
                    break
            except Exception as e:
                logger.warning(f"Gemini call with model {model_candidate} failed: {e}. Trying next fallback...")
                continue

        if raw_text:
            try:
                parsed = self._parse_gemini_json(raw_text)
                topic = parsed.get("topic") or detected_topic
                intro = (parsed.get("intro") or "").strip()
                raw_steps = parsed.get("steps") or []
                safety_tip = parsed.get("safety_tip")
                closing = (parsed.get("closing") or "").strip()

                clean_steps = []
                for i, s in enumerate(raw_steps):
                    clean_text = re.sub(
                        r"^(?:(?:Step|कदम|चरण|पायरी|टप्पा)\s*\d+[\s:.-]*|\d+[\s:.-]+)",
                        "",
                        str(s),
                        flags=re.IGNORECASE
                    ).strip()
                    clean_steps.append({"step": i + 1, "text": clean_text or str(s)})

                body_parts = []
                if intro:
                    body_parts.append(intro)
                if not clean_steps and raw_steps:
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
                    "related_guides": related,
                    "topic": topic
                }
            except Exception as e:
                logger.error(f"Error parsing Gemini response: {e}")

        # 4. Fallback to knowledge database guide if API fails or times out
        guide_resp = self._response_from_guides(message, lang, db_guides, related)
        if guide_resp:
            return guide_resp

        # 5. Default encouraging error response
        error_messages = {
            "en": "Dear friend, I am Sahayyak AI – Your Technology Guide. I am having a slight connection delay right now, but please do not worry! Please try asking again in a moment, or select any guide below.",
            "hi": "नमस्ते जी! मैं सहाय्यक AI – आपका तकनीक मार्गदर्शक हूँ। इस समय इंटरनेट से जुड़ने में थोड़ी रुकावट आ रही है। कृपया कुछ पलों बाद पुनः पूछें या नीचे दी गई गाइड देखें।",
            "mr": "नमस्कार! मी सहाय्यक AI – तुमचा तंत्रज्ञान मार्गदर्शक आहे. इंटरनेट सर्व्हरशी संपर्क साधण्यात थोडी अडचण येत आहे. कृपया काही क्षणांनंतर पुन्हा विचारा किंवा खालील मार्गदर्शक पहा."
        }
        return {
            "answer": error_messages.get(lang, error_messages["en"]),
            "intro": error_messages.get(lang, error_messages["en"]),
            "closing": None,
            "language": lang,
            "steps": [],
            "safety_warning": None,
            "related_guides": related,
            "topic": detected_topic
        }

    def _detect_topic_from_text(self, text: str) -> str:
        """Identifies relevant digital application topic from user text."""
        lower = text.lower()
        if any(w in lower for w in ["whatsapp", "व्हाट्सएप", "व्हॉट्सॲप", "status", "dp"]):
            return "whatsapp"
        if any(w in lower for w in ["wifi", "wi-fi", "वाय-फाय", "वायफाय", "internet", "इंटरनेट", "data"]):
            return "wifi"
        if any(w in lower for w in ["upi", "gpay", "google pay", "phonepe", "paytm", "पेटीएम", "पैसे", "money", "payment", "pin"]):
            return "upi"
        if any(w in lower for w in ["youtube", "यूट्यूब", "video", "गाना", "गाणी", "व्हिडिओ"]):
            return "youtube"
        if any(w in lower for w in ["wikipedia", "विकिपीडिया", "encyclopedia", "who is", "what is"]):
            return "wikipedia"
        if any(w in lower for w in ["google", "गूगल", "गुगल", "search", "खोज", "शोधा", "chrome"]):
            return "google"
        if any(w in lower for w in ["setting", "gear", "चक्र", "font", "size", "अक्षर", "volume", "sound", "आवाज़", "आवाज"]):
            return "settings"
        if any(w in lower for w in ["call", "phone", "कॉल", "फोन", "नंबर", "contact"]):
            return "phone"
        if any(w in lower for w in ["camera", "photo", "फोटो", "कॅमेरा", "gallery", "गैलरी"]):
            return "camera"
        return "general"

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
            "closing": None,
            "topic": "general"
        }

    def _find_related_guides(self, query: str, db_guides: Optional[List[Any]]) -> List[Dict[str, Any]]:
        """Dynamically finds related step-by-step guides from the database based on query relevance."""
        if not db_guides:
            return []
        q_words = [w.lower() for w in re.split(r"[\s,?!.]+", query) if len(w) > 2]
        results = []
        for g in db_guides:
            title_lower = getattr(g, "title", "").lower()
            tags_lower = (getattr(g, "tags", "") or "").lower()
            desc_lower = (getattr(g, "description", "") or "").lower()
            if any(w in title_lower or w in tags_lower or w in desc_lower for w in q_words):
                results.append({
                    "id": g.id,
                    "title": g.title,
                    "title_hi": getattr(g, "title_hi", g.title),
                    "title_mr": getattr(g, "title_mr", g.title),
                    "difficulty": getattr(g, "difficulty", "Easy")
                })
            if len(results) >= 3:
                break
        return results

    def _response_from_guides(
        self,
        message: str,
        lang: str,
        db_guides: Optional[List[Any]],
        related: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Constructs an empathetic structured assistant response from database guides if available."""
        if not db_guides:
            return None

        # Look for the best matching guide
        q_words = [w.lower() for w in re.split(r"[\s,?!.]+", message) if len(w) > 2]
        best_guide = None
        best_score = 0
        for g in db_guides:
            title_lower = getattr(g, "title", "").lower()
            tags_lower = (getattr(g, "tags", "") or "").lower()
            score = sum(1 for w in q_words if w in title_lower or w in tags_lower)
            if score > best_score:
                best_score = score
                best_guide = g

        if not best_guide or best_score == 0:
            return None

        # Extract localized details
        if lang == "hi":
            title = getattr(best_guide, "title_hi", best_guide.title)
            desc = getattr(best_guide, "description_hi", best_guide.description)
            intro = f"नमस्ते जी! '{title}' के बारे में आपने बहुत अच्छा सवाल पूछा है। आइए हम सब मिलकर इसे सरल तरीके से सीखते हैं:"
            closing = "बहुत बढ़िया! आपने सफलतापूर्वक यह कदम सीख लिया। किसी भी समय अन्य सहायता के लिए मुझे बताइए।"
        elif lang == "mr":
            title = getattr(best_guide, "title_mr", best_guide.title)
            desc = getattr(best_guide, "description_mr", best_guide.description)
            intro = f"नमस्कार! '{title}' बद्दल तुम्ही विचारलेला प्रश्न खूप छान आहे. चला, आपण एकत्र येऊन सोप्या पद्धतीने शिकूया:"
            closing = "खूप छान! तुम्ही सर्व पायऱ्या व्यवस्थित पूर्ण केल्या आहेत. आणखी काही मदत हवी असल्यास नक्की विचारा."
        else:
            title = best_guide.title
            desc = best_guide.description
            intro = f"Hello my dear friend! '{title}' is a wonderful question. Let us do this together, one gentle step at a time:"
            closing = "You did a fantastic job! You can ask me anytime whenever you need any help with your phone or computer."

        raw_steps = []
        try:
            steps_data = getattr(best_guide, "steps_json", "[]")
            raw_steps = json.loads(steps_data) if isinstance(steps_data, str) else (steps_data or [])
        except Exception:
            raw_steps = []

        formatted_steps = []
        for i, s in enumerate(raw_steps):
            if isinstance(s, dict):
                text = (
                    s.get(f"instruction_{lang}") or
                    s.get("instruction") or
                    s.get("title") or
                    str(s)
                )
            else:
                text = str(s)
            formatted_steps.append({"step": i + 1, "text": text})

        safety_tip = None
        try:
            tips_data = getattr(best_guide, "safety_tips_json", "[]")
            tips_list = json.loads(tips_data) if isinstance(tips_data, str) else (tips_data or [])
            if tips_list and len(tips_list) > 0:
                first_tip = tips_list[0]
                if isinstance(first_tip, dict):
                    safety_tip = first_tip.get(f"tip_{lang}") or first_tip.get("tip") or str(first_tip)
                else:
                    safety_tip = str(first_tip)
        except Exception:
            safety_tip = None

        detected_topic = self._detect_topic_from_text(best_guide.title)

        body_parts = [intro]
        if formatted_steps:
            body_parts.append("\n".join(f"{s['step']}. {s['text']}" for s in formatted_steps))
        body_parts.append(closing)

        return {
            "answer": "\n\n".join(body_parts),
            "intro": intro,
            "closing": closing,
            "language": lang,
            "steps": formatted_steps,
            "safety_warning": safety_tip,
            "related_guides": related,
            "topic": detected_topic
        }

ai_service = AIService()
