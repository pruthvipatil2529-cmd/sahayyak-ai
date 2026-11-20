import json
import logging
import asyncio
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.text_normalizer import normalize_user_query

logger = logging.getLogger(__name__)

COMMON_STOP_WORDS = {
    "want", "need", "like", "how", "what", "where", "when", "why", "who", "which",
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "am", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "can",
    "could", "should", "would", "shall", "will", "may", "might", "must",
    "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "yours", "he", "him",
    "his", "she", "her", "hers", "it", "its", "they", "them", "their", "please", "plz",
    "tell", "show", "help", "guide", "know", "learn", "teach", "phone", "mobile",
    "device", "screen", "karo", "kaise", "karen", "kasa", "karaycha"
}

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

4. VISUAL APP IDENTIFICATION FIRST (MANDATORY):
   - Whenever a user asks about a specific feature, setting, or action inside ANY mobile or desktop application, **Step 1 MUST ALWAYS describe the app's visual icon** before giving navigation instructions.
   - In Step 1, state the app's primary background color, main symbol/shape, and exact app name so the user can immediately spot it on their device.
   - Example: "Step 1: Look for the **WhatsApp** icon on your home screen — it is a bright green square with a white speech bubble and a white telephone receiver inside."
   - After identifying the app visually in Step 1, continue with clear step-by-step navigation instructions.

5. PAYMENT APP DISAMBIGUATION (MANDATORY):
   - If the user asks a general question about making a payment, transferring money, checking a balance, or paying a bill WITHOUT naming a specific payment app, do NOT guess a default app.
   - Instead, politely ask the user which payment app they are using BEFORE providing steps.
   - Present these common options: **Google Pay (GPay)**, **PhonePe**, **Paytm**, **BHIM**, or **their Banking App**.
   - In this case, set "steps" to an empty array [] and put the disambiguation question in the "intro" field.
   - Example intro: "Before I walk you through the steps, which payment app are you using? Please choose one: Google Pay (GPay), PhonePe, Paytm, or another UPI / Banking App."
   - EXCEPTION: If the user already named the payment app in their question (e.g., "How do I send money on PhonePe?"), skip this rule and immediately apply Rule 4 (describe the PhonePe icon as Step 1, then give transfer steps).

6. DIGITAL SAFETY SHIELD:
   - Whenever money, UPI (Google Pay, PhonePe, Paytm), bank accounts, OTP, passwords, or unknown callers/messages are mentioned, provide a clear, bold safety tip:
     * 'Golden Rule: Your secret UPI PIN is ONLY entered to SEND money. You NEVER need to enter your PIN or scan a QR code to RECEIVE money!'
     * 'Never share your bank SMS OTP or secret PIN with anyone, even if someone claims to call from your bank, police, or electricity board.'

7. MULTILINGUAL SUPPORT (STRICT TARGET LANGUAGE):
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
        raw_model = settings.GEMINI_MODEL or "gemini-1.5-flash"
        if "3.5" in raw_model or raw_model == "gemini-pro":
            raw_model = "gemini-1.5-flash"
        self.model_name = raw_model
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
        Includes spelling correction, robust model fallback, and curated knowledge guide integration.
        """
        lang = language if language in ["en", "hi", "mr"] else "en"

        # Intelligent Spelling Correction (Pre-processing)
        clean_msg, was_corrected = normalize_user_query(message)
        interpreted_query = clean_msg if was_corrected else None

        related = self._find_related_guides(clean_msg, db_guides)
        detected_topic = self._detect_topic_from_text(clean_msg)

        # Intent Routing: Payment action vs. Payment safety vs. App identification
        is_action = self._is_payment_action_query(clean_msg)
        is_safety = self._is_safety_query(clean_msg)
        app_name = self._user_specified_payment_app(clean_msg)
        clean_lower = clean_msg.strip().lower()
        is_app_only = clean_lower in [
            "google pay", "gpay", "phonepe", "paytm", "bhim", "bank app", "other upi / bank app",
            "गूगल पे", "फोनपे", "पेटीएम"
        ]

        if (is_action or is_app_only) and not is_safety:
            if not app_name:
                # Requirement 2: Payment App Selection Flow (clickable options, no guessing, no safety rules)
                resp = self._build_payment_disambiguation_response(clean_msg, lang, related)
                resp["interpreted_query"] = interpreted_query
                resp["api_error"] = None
                return resp
            else:
                # Requirement 3: Visual App Icon as Step 1 + Transfer steps
                resp = self._build_payment_steps_response(app_name, clean_msg, lang, related)
                resp["interpreted_query"] = interpreted_query
                resp["api_error"] = None
                return resp

        # 1. Check if Gemini client is initialized
        if not self._gemini_client:
            # Fallback to database guide if matches
            guide_resp = self._response_from_guides(clean_msg, lang, db_guides, related)
            if guide_resp:
                guide_resp["interpreted_query"] = interpreted_query
                guide_resp["api_error"] = "Gemini API client not initialized. Served from verified offline guides."
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
                "topic": detected_topic,
                "interpreted_query": interpreted_query,
                "api_error": "No GEMINI_API_KEY configured."
            }

        # 2. Build dynamic prompt with conversation context and spelling tolerance
        lang_names = {"en": "English", "hi": "Hindi (हिंदी)", "mr": "Marathi (मराठी)"}
        prompt_parts = [
            f"Target Language: {lang_names.get(lang, 'English')}",
            f"Important: The response MUST be entirely in {lang_names.get(lang, 'English')}.",
            f"User Question: {clean_msg}"
        ]

        if was_corrected:
            prompt_parts.append(f"Original User Input (typo-tolerant): {message}")
            prompt_parts.append("Note: The user asked using typos, abbreviations, or broken phrasing. Answer directly and kindly without commenting on their spelling.")

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
        last_api_error = None
        models_to_try = [self.model_name, "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models and "3.5" not in m:
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
                    timeout=5.0
                )
                if response and response.text:
                    raw_text = response.text
                    break
            except Exception as e:
                last_api_error = f"{type(e).__name__}: {str(e)}"
                logger.warning(f"Gemini call with model {model_candidate} failed: {last_api_error}. Trying next fallback...")
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
                    "topic": topic,
                    "interpreted_query": interpreted_query,
                    "api_error": None
                }
            except Exception as e:
                logger.error(f"Error parsing Gemini response: {e}")

        # 4. Fallback to knowledge database guide if API fails or times out
        guide_resp = self._response_from_guides(clean_msg, lang, db_guides, related)
        if guide_resp:
            guide_resp["interpreted_query"] = interpreted_query
            guide_resp["api_error"] = last_api_error
            return guide_resp

        # 5. Default encouraging error response with exposed diagnostic error
        error_messages = {
            "en": "Dear friend, I am Sahayyak AI – Your Technology Guide. I am having a slight connection delay right now, but please do not worry! Please try asking again in a moment, or select any guide below.",
            "hi": "नमस्ते जी! मैं सहाय्यक AI – आपका तकनीक मार्गदर्शक हूँ। इस समय इंटरनेट से जुड़ने में थोड़ी रुकावट आ रही है। कृपया कुछ पलों बाद पुनः पूछें या नीचे दी गई गाइड देखें।",
            "mr": "नमस्कार! मी सहाय्यक AI – तुमचा तंत्रज्ञान मार्गदर्शक आहे. इंटरनेट सर्व्हरशी संपर्क साधण्यात थोडी अडचण येत आहे. कृपया काही क्षणांनंतर पुन्हा विचारा किंवा खालील मार्गदर्शक पहा."
        }
        err_msg = error_messages.get(lang, error_messages["en"])
        return {
            "answer": err_msg,
            "intro": err_msg,
            "closing": None,
            "language": lang,
            "steps": [],
            "safety_warning": None,
            "related_guides": related,
            "topic": detected_topic,
            "interpreted_query": interpreted_query,
            "api_error": last_api_error
        }

    def _detect_topic_from_text(self, text: str) -> str:
        """Identifies relevant digital application topic from user text."""
        lower = text.lower()
        if any(w in lower for w in ["whatsapp", "व्हाट्सएप", "व्हॉट्सॲप", "status", "dp"]):
            return "whatsapp"
        if any(w in lower for w in ["wifi", "wi-fi", "वाय-फाय", "वायफाय", "internet", "इंटरनेट", "data"]):
            return "wifi"
        if any(w in lower for w in ["upi", "gpay", "google pay", "phonepe", "paytm", "पेटीएम", "पैसे", "money", "payment", "pay", "send money", "transfer", "भेजें", "पाठवा"]):
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

    def _is_safety_query(self, text: str) -> bool:
        """Determines if the user query is specifically asking about safety/scam/fraud
        (as opposed to a transactional how-to like 'how to pay' or 'send money')."""
        lower = text.lower()
        safety_keywords = [
            "safe", "safely", "safety", "scam", "fraud", "fake", "cheat",
            "golden rule", "secure", "security", "hack", "phishing",
            "otp", "stolen", "suspicious", "block", "report",
            "सुरक्षित", "धोखा", "धोखाधड़ी", "ठगी", "फ्रॉड",
            "सुरक्षा", "फसवणूक", "चोरी", "सुरक्षित वापर"
        ]
        return any(kw in lower for kw in safety_keywords)

    def _is_payment_action_query(self, text: str) -> bool:
        """Determines if the user is asking HOW to perform a payment action
        (send, pay, transfer, check balance) rather than asking about safety."""
        lower = text.lower()
        action_patterns = [
            "how to pay", "how to send", "how to transfer", "send money",
            "pay my", "pay to", "pay someone", "transfer money", "send ₹", "send rs",
            "भुगतान कैसे", "पैसे कैसे भेजें", "पैसे भेजना", "पैसे ट्रांसफर",
            "पैसे कसे पाठवावे", "पैसे पाठवा", "पेमेंट कसे",
            "pay bill", "recharge", "check balance", "बैलेंस", "रिचार्ज",
            "how do i pay", "how can i pay", "how can i send",
            "how do i send money", "how to make payment"
        ]
        return any(p in lower for p in action_patterns)

    def _user_specified_payment_app(self, text: str) -> Optional[str]:
        """Check if user already named a specific payment app. Returns the app name or None."""
        lower = text.lower()
        if any(w in lower for w in ["google pay", "gpay", "g-pay"]):
            return "Google Pay"
        if any(w in lower for w in ["phonepe", "phone pe"]):
            return "PhonePe"
        if any(w in lower for w in ["paytm", "pay tm"]):
            return "Paytm"
        if any(w in lower for w in ["bhim"]):
            return "BHIM"
        if any(w in lower for w in ["bank app", "yono", "sbi", "hdfc", "icici"]):
            return "Bank App"
        return None

    def _extract_payment_details(self, text: str) -> Dict[str, Optional[str]]:
        """Extracts amount and recipient name or relation from payment query if present."""
        amount = None
        amt_match = re.search(r'(?:₹|rs\.?|inr|rupees)?\s*(\d+(?:,\d+)?)\s*(?:rs\.?|inr|rupees)?', text, re.IGNORECASE)
        if amt_match:
            digits = amt_match.group(1).replace(',', '')
            if digits and int(digits) > 0:
                amount = f"₹{amt_match.group(1)}"

        recipient = None
        for hint in ["son", "daughter", "father", "mother", "brother", "sister", "friend", "wife", "husband",
                     "shopkeeper", "grocery", "milkman", "doctor", "landlord", "relative",
                     "मुलगा", "मुलगी", "आई", "वडील", "भाऊ", "बहीण", "मित्र", "दुकानदार",
                     "बेटा", "बेटी", "पिताजी", "माताजी", "भाई", "बहन", "दोस्त"]:
            if hint in text.lower():
                recipient = hint
                break

        return {"amount": amount, "recipient": recipient}

    def _build_payment_disambiguation_response(
        self,
        message: str,
        lang: str,
        related: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Requirement 2: Disambiguates payment apps by providing clickable options."""
        details = self._extract_payment_details(message)
        amt_str = f" {details['amount']}" if details["amount"] else ""
        rec_str = f" to {details['recipient']}" if details["recipient"] else ""
        context_suffix = f"{amt_str}{rec_str}".strip()
        if not context_suffix:
            context_suffix = "money"

        intros = {
            "en": "I am here to guide you step-by-step! Because each payment app looks a little different on your screen, which payment app are you using on your phone? Please choose one:",
            "hi": "नमस्ते जी! मैं बहुत ही सरल तरीके से आपको पैसे भेजने के कदम बताऊंगा। क्योंकि हर ऐप स्क्रीन पर थोड़ा अलग दिखता है, आप अपने फोन पर कौन सा पेमेंट ऐप इस्तेमाल करते हैं? कृपया नीचे दिए गए विकल्पों में से एक चुनें:",
            "mr": "नमस्कार! मी तुम्हाला अगदी सोप्या पद्धतीने पैसे पाठवण्याच्या पायऱ्या समजावून सांगेन. प्रत्येक ॲप स्क्रीनवर थोडे वेगळे दिसत असल्यामुळे, तुम्ही तुमच्या मोबाईलमध्ये कोणते पेमेंट ॲप वापरत आहात? कृपया खालीलपैकी एका पर्यायावर स्पर्श करा:"
        }

        safety_tips = {
            "en": "Golden Safety Rule: Your secret UPI PIN is ONLY entered to SEND money. You NEVER need to enter your PIN or scan a QR code to RECEIVE money!",
            "hi": "स्वर्ण सुरक्षा नियम: आपका गुप्त UPI PIN केवल पैसे भेजने के लिए दर्ज किया जाता है। पैसे प्राप्त करने के लिए कभी भी PIN दर्ज करने या QR कोड स्कैन करने की आवश्यकता नहीं होती!",
            "mr": "सुवर्ण सुरक्षा नियम: तुमचा गुप्त UPI PIN फक्त पैसे पाठवण्यासाठीच वापरला जातो. पैसे मिळवण्यासाठी कधीही PIN टाकण्याची किंवा QR कोड स्कॅन करण्याची आवश्यकता नसते!"
        }

        closings = {
            "en": "Simply tap any of the options above, and I will show you each step with its exact icon.",
            "hi": "ऊपर दिए गए किसी भी ऐप पर टैप करें, और मैं आपको उसके आइकन सहित सभी कदम दिखाऊंगा।",
            "mr": "वरीलपैकी कोणत्याही ॲपवर टॅप करा, मी तुम्हाला त्याच्या आयकॉनसह सर्व पायऱ्या दाखवीन."
        }

        options = [
            {
                "label": "Google Pay (GPay)",
                "value": f"How to pay {context_suffix} using Google Pay",
                "app": "gpay",
                "description": "White icon with blue, red, yellow & green 'G' ribbon"
            },
            {
                "label": "PhonePe",
                "value": f"How to pay {context_suffix} using PhonePe",
                "app": "phonepe",
                "description": "Purple icon with white 'पे'"
            },
            {
                "label": "Paytm",
                "value": f"How to pay {context_suffix} using Paytm",
                "app": "paytm",
                "description": "White icon with blue & cyan Paytm text"
            },
            {
                "label": "Other UPI / Bank App",
                "value": f"How to pay {context_suffix} using other Bank UPI app",
                "app": "bank",
                "description": "BHIM, SBI YONO, HDFC, ICICI, etc."
            }
        ]

        intro = intros.get(lang, intros["en"])
        closing = closings.get(lang, closings["en"])
        safety = safety_tips.get(lang, safety_tips["en"])

        answer_text = f"{intro}\n\n1. Google Pay (GPay)\n2. PhonePe\n3. Paytm\n4. Other UPI / Bank App\n\n{closing}"

        return {
            "answer": answer_text,
            "intro": intro,
            "closing": closing,
            "language": lang,
            "steps": [],
            "safety_warning": safety,
            "related_guides": related,
            "topic": "upi",
            "options": options
        }

    def _build_payment_steps_response(
        self,
        app_name: str,
        message: str,
        lang: str,
        related: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Requirement 1 & 3: Once app is selected, provides steps starting with Step 1 Visual App Identification."""
        details = self._extract_payment_details(message)
        amt_display = details["amount"] or ("₹5,000" if "5000" in message else "the payment amount")
        rec_display = details["recipient"] or ("your son" if "son" in message.lower() else "the recipient")

        # Determine app key
        app_key = "gpay"
        if "phonepe" in app_name.lower():
            app_key = "phonepe"
        elif "paytm" in app_name.lower():
            app_key = "paytm"
        elif "bhim" in app_name.lower() or "bank" in app_name.lower():
            app_key = "bank"

        # Step 1: Visual App Identification First (MANDATORY)
        step_1_icons = {
            "gpay": {
                "en": "**Locate Google Pay on your screen:** Look for the white square icon with four colorful curved ribbons in blue, red, yellow, and green that form the letter 'G', with the name **GPay** or **Google Pay** underneath. Gently touch it with your finger to open.",
                "hi": "**अपने फोन पर Google Pay खोजें:** अपनी स्क्रीन पर सफेद रंग का चौकोर आइकन देखें जिसमें नीले, लाल, पीले और हरे रंग के चार घुमावदार फीते मिलकर 'G' जैसा आकार बनाते हैं और नीचे **GPay** या **Google Pay** लिखा होता है। इसे खोलने के लिए अपनी उंगली से धीरे से छुएं।",
                "mr": "**तुमच्या स्क्रीनवर Google Pay शोधा:** तुमच्या स्क्रीनवर पांढऱ्या रंगाचा चौकोनी आयकॉन पहा ज्यामध्ये निळा, लाल, पिवळा आणि हिरवा रंग एकत्र येऊन 'G' चा आकार बनवतात आणि खाली **GPay** किंवा **Google Pay** नाव लिहिलेले असते. ते उघडण्यासाठी बोटाने हलकेच स्पर्श करा."
            },
            "phonepe": {
                "en": "**Locate PhonePe on your screen:** Look for the vibrant purple square icon with the white Devanagari letter **'पे' (Pe)** inside, with the name **PhonePe** written underneath. Gently touch it with your finger to open.",
                "hi": "**अपने फोन पर PhonePe खोजें:** अपनी स्क्रीन पर गहरे बैंगनी (Purple) रंग का चौकोर आइकन देखें जिसके अंदर सफेद रंग में **'पे'** लिखा होता है और नीचे **PhonePe** नाम होता है। इसे खोलने के लिए अपनी उंगली से धीरे से छुएं।",
                "mr": "**तुमच्या स्क्रीनवर PhonePe शोधा:** तुमच्या स्क्रीनवर जांभळ्या (Purple) रंगाचा चौकोनी आयकॉन पहा ज्याच्या आत पांढऱ्या अक्षरात **'पे'** लिहिलेले असते आणि खाली **PhonePe** नाव असते. ते उघडण्यासाठी बोटाने हलकेच स्पर्श करा."
            },
            "paytm": {
                "en": "**Locate Paytm on your screen:** Look for the white square icon with bold dark blue and light cyan letters spelling **Paytm**, with **Pay** in dark blue and **tm** in light cyan. Gently touch it with your finger to open.",
                "hi": "**अपने फोन पर Paytm खोजें:** अपनी स्क्रीन पर सफेद रंग का आइकन देखें जिस पर गहरे नीले और हल्के नीले अक्षरों में **Paytm** लिखा होता है। इसे खोलने के लिए अपनी उंगली से धीरे से छुएं।",
                "mr": "**तुमच्या स्क्रीनवर Paytm शोधा:** तुमच्या स्क्रीनवर पांढऱ्या रंगाचा आयकॉन पहा ज्यावर ठळक निळ्या अक्षरात **Paytm** लिहिलेले असते. ते उघडण्यासाठी बोटाने हलकेच स्पर्श करा."
            },
            "bank": {
                "en": "**Locate your Bank or UPI app on your screen:** Look for your bank's official app icon (such as SBI YONO, HDFC, ICICI, or BHIM with a green and orange triangle) on your home screen. Gently touch it with your finger to open.",
                "hi": "**अपने फोन पर बैंक या UPI ऐप खोजें:** अपनी स्क्रीन पर अपने बैंक का ऐप (जैसे SBI YONO, HDFC, ICICI, या BHIM) खोजें और उसे खोलने के लिए धीरे से छुएं।",
                "mr": "**तुमच्या स्क्रीनवर बँक किंवा UPI ॲप शोधा:** तुमच्या स्क्रीनवर तुमच्या बँकेचे ॲप (उदा. SBI YONO, HDFC, ICICI, किंवा BHIM) शोधा आणि उघडण्यासाठी हलकेच स्पर्श करा."
            }
        }

        # Step 2: Payment method
        step_2_texts = {
            "en": "Choose payment option: On the app home screen, gently touch **'To Mobile Number'** (or **'Pay contacts'**) to send by phone number, OR touch **'Scan QR'** at the top if paying via a QR code.",
            "hi": "भुगतान का विकल्प चुनें: मुख्य स्क्रीन पर फोन नंबर से भेजने के लिए **'To Mobile Number'** पर टैप करें, या अगर आपके पास QR कोड है तो ऊपर **'Scan QR'** पर टैप करें।",
            "mr": "पैसे पाठवण्याचा पर्याय निवडा: मुख्य स्क्रीनवर फोन नंबरद्वारे पैसे पाठवण्यासाठी **'To Mobile Number'** वर टॅप करा, किंवा QR कोड असेल तर वर **'Scan QR'** वर टॅप करा."
        }

        # Step 3: Recipient details
        step_3_texts = {
            "en": f"Select recipient and verify name: Type {rec_display}'s 10-digit mobile number or select their name from your contacts. Always look at the verified bank name displayed on the screen before continuing.",
            "hi": f"प्राप्तकर्ता चुनें और नाम जांचें: {rec_display} का 10 अंकों का मोबाइल नंबर दर्ज करें या संपर्क सूची से चुनें। स्क्रीन पर दिखाई देने वाला उनका असली बैंक नाम हमेशा ध्यान से पढ़ें।",
            "mr": f"प्राप्तकर्ता निवडा आणि नाव तपासा: {rec_display} यांचा १० अंकी मोबाईल नंबर टाका किंवा संपर्कांमधून निवडा. स्क्रीनवर दिसणारे त्यांचे अधिकृत बँक नाव काळजीपूर्वक तपासा."
        }

        # Step 4: Amount
        step_4_texts = {
            "en": f"Enter amount: Touch the amount box and type **{amt_display}**. Double-check the digits so there are no extra zeros.",
            "hi": f"राशि दर्ज करें: राशि वाले बॉक्स पर टैप करें और **{amt_display}** लिखें। शून्य (0) को दोबारा जांच लें ताकि गलत राशि न जाए।",
            "mr": f"रक्कम टाका: रकमेच्या चौकटीवर टॅप करून **{amt_display}** टाका. शून्यांची संख्या पुन्हा तपासा जेणेकरून चुकीची रक्कम जाणार नाही."
        }

        # Step 5: UPI PIN
        step_5_texts = {
            "en": "Enter your secret UPI PIN: Touch the blue or purple **'Pay'** button at the bottom. A secure numeric keypad will appear. Enter your 4 or 6-digit secret UPI PIN. (Never tell this PIN out loud to anyone!).",
            "hi": "अपना गुप्त UPI PIN दर्ज करें: नीचे **'Pay'** बटन दबाएं। एक सुरक्षित कीपैड खुलेगा। अपना 4 या 6 अंकों का गुप्त UPI PIN दर्ज करें। (यह PIN कभी किसी को बोलकर न बताएं!)।",
            "mr": "तुमचा गुप्त UPI PIN टाका: खालील **'Pay'** बटणावर स्पर्श करा. सुरक्षित कीपॅड उघडेल. तुमचा ४ किंवा ६ अंकी गुप्त UPI PIN टाका. (हा PIN कधीही कोणाला मोठ्याने सांगू नका!)."
        }

        # Step 6: Confirmation
        step_6_texts = {
            "en": "Payment Success Confirmation: Keep your phone steady for a moment. A big green checkmark (✔) will appear on the screen along with a pleasant audio chime confirming the money was successfully sent.",
            "hi": "भुगतान सफलता की पुष्टि: फोन को एक पल के लिए थामे रखें। स्क्रीन पर एक बड़ा हरा सही का निशान (✔) और एक सुखद आवाज़ आएगी, जो पुष्टि करती है कि आपके पैसे सफलतापूर्वक पहुँच गए हैं।",
            "mr": "पेमेंट यशस्वी झाल्याची खात्री: फोन एका क्षणासाठी स्थिर धरा. स्क्रीनवर एक मोठी हिरवी टिक (✔) आणि छान आवाज येईल, ज्यावरून तुमचे पैसे यशस्वीरीत्या पाठवले गेले आहेत हे स्पष्ट होईल."
        }

        intros = {
            "en": f"Dear friend, here is how you can safely send {amt_display} using **{app_name}**, one simple step at a time:",
            "hi": f"नमस्ते जी! **{app_name}** से {amt_display} भेजने के सरल और सुरक्षित कदम यहाँ दिए गए हैं। आइए मिलकर करते हैं:",
            "mr": f"नमस्कार! **{app_name}** द्वारे {amt_display} सुरक्षितपणे पाठवण्याच्या सोप्या पायऱ्या खाली दिल्या आहेत. चला एकत्र करूया:"
        }

        closings = {
            "en": "You did wonderfully! The payment is complete and an official SMS from your bank will arrive on your phone.",
            "hi": "बहुत बढ़िया! भुगतान पूरा हो गया है और आपके बैंक से एक आधिकारिक SMS आपके फोन पर आ जाएगा।",
            "mr": "खूप छान! पेमेंट पूर्ण झाले असून तुमच्या बँकेकडून अधिकृत SMS तुमच्या मोबाईलवर येईल."
        }

        safety_tips = {
            "en": "Golden Safety Rule: Always confirm payment status through your bank's official SMS, never through screenshots sent by strangers. And remember: your UPI PIN is NEVER needed to receive money!",
            "hi": "स्वर्ण सुरक्षा नियम: केवल अपने बैंक के आधिकारिक SMS पर भरोसा करें। और याद रखें: पैसे प्राप्त करने के लिए कभी भी UPI PIN की आवश्यकता नहीं होती!",
            "mr": "सुवर्ण सुरक्षा नियम: नेहमी तुमच्या बँकेच्या अधिकृत SMS वरच विश्वास ठेवा. आणि लक्षात ठेवा: पैसे खात्यात येण्यासाठी कधीही UPI PIN लागत नाही!"
        }

        intro = intros.get(lang, intros["en"])
        closing = closings.get(lang, closings["en"])
        safety = safety_tips.get(lang, safety_tips["en"])

        step_1_text = step_1_icons.get(app_key, step_1_icons["gpay"]).get(lang, step_1_icons[app_key]["en"])
        step_2_text = step_2_texts.get(lang, step_2_texts["en"])
        step_3_text = step_3_texts.get(lang, step_3_texts["en"])
        step_4_text = step_4_texts.get(lang, step_4_texts["en"])
        step_5_text = step_5_texts.get(lang, step_5_texts["en"])
        step_6_text = step_6_texts.get(lang, step_6_texts["en"])

        steps = [
            {"step": 1, "text": step_1_text},
            {"step": 2, "text": step_2_text},
            {"step": 3, "text": step_3_text},
            {"step": 4, "text": step_4_text},
            {"step": 5, "text": step_5_text},
            {"step": 6, "text": step_6_text}
        ]

        body_parts = [intro, "\n".join(f"{s['step']}. {s['text']}" for s in steps), closing]

        return {
            "answer": "\n\n".join(body_parts),
            "intro": intro,
            "closing": closing,
            "language": lang,
            "steps": steps,
            "safety_warning": safety,
            "related_guides": related,
            "topic": "upi",
            "options": []
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
            "closing": None,
            "topic": "general"
        }

    def _find_related_guides(self, query: str, db_guides: Optional[List[Any]]) -> List[Dict[str, Any]]:
        """Dynamically finds related step-by-step guides from the database based on query relevance."""
        if not db_guides:
            return []
        is_action = self._is_payment_action_query(query)
        is_safety = self._is_safety_query(query)
        q_words = [
            w.lower() for w in re.split(r"[\s,?!.]+", query)
            if len(w) > 2 and w.lower() not in COMMON_STOP_WORDS
        ]
        if not q_words:
            return []

        results = []
        for g in db_guides:
            title_lower = getattr(g, "title", "").lower()
            tags_lower = (getattr(g, "tags", "") or "").lower()
            desc_lower = (getattr(g, "description", "") or "").lower()

            # Intent Fix: Stop Over-Matching on "Pay". If action query and NOT safety query, skip safety template
            if is_action and not is_safety:
                if any(w in title_lower or w in tags_lower for w in ["safely", "golden rules", "scam", "fraud", "सुरक्षित"]):
                    continue

            # Prioritize title and tags matching
            title_or_tags_match = any(w in title_lower or w in tags_lower for w in q_words)
            desc_match_count = sum(1 for w in q_words if w in desc_lower)

            if title_or_tags_match or desc_match_count >= 2:
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

        is_action = self._is_payment_action_query(message)
        is_safety = self._is_safety_query(message)

        # Look for the best matching guide using non-stop keywords
        q_words = [
            w.lower() for w in re.split(r"[\s,?!.]+", message)
            if len(w) > 2 and w.lower() not in COMMON_STOP_WORDS
        ]
        if not q_words:
            return None

        best_guide = None
        best_score = 0
        for g in db_guides:
            title_lower = getattr(g, "title", "").lower()
            tags_lower = (getattr(g, "tags", "") or "").lower()

            # Intent Fix: Stop Over-Matching on "Pay". If action query and NOT safety query, do not select safety guide
            if is_action and not is_safety:
                if any(w in title_lower or w in tags_lower for w in ["safely", "golden rules", "scam", "fraud", "सुरक्षित"]):
                    continue

            score = 0
            for w in q_words:
                if w in title_lower:
                    score += 3
                elif w in tags_lower:
                    score += 2

            # Extra weight for explicit intent match
            if is_safety and any(w in title_lower for w in ["safely", "safety", "golden rules"]):
                score += 5
            if is_action and any(w in title_lower for w in ["send money", "pay"]):
                score += 5

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
