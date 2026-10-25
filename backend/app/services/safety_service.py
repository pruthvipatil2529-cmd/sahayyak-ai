import re
from typing import Tuple, Optional

# Keywords that indicate sensitive financial / identity information
SENSITIVE_PATTERNS = [
    # OTP patterns (e.g., "my otp is 123456", "otp 4821")
    (r"\b(?:otp|one[- ]time[- ]password|verification code)\s*(?:is|:|=)?\s*(\d{4,8})\b", "OTP"),
    # UPI PIN / ATM PIN (e.g., "pin is 1234", "upi pin 5678")
    (r"\b(?:upi\s*pin|atm\s*pin|mpin|pin)\s*(?:is|:|=)?\s*(\d{4,6})\b", "PIN"),
    # CVV / CVC (3-4 digits preceded by cvv/cvc)
    (r"\b(?:cvv|cvc|security code)\s*(?:is|:|=)?\s*(\d{3,4})\b", "CVV"),
    # Credit/Debit Card numbers (16 digits or 4x4 groups)
    (r"\b(?:\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4})\b", "Card Number"),
    # Passwords
    (r"\b(?:password|passcode)\s*(?:is|:|=)\s*([^\s]{4,})\b", "Password"),
    # Bank account numbers
    (r"\b(?:account\s*number|ac\s*no|a/c)\s*(?:is|:|=)?\s*(\d{8,18})\b", "Bank Account Number"),
]

SAFETY_WARNINGS = {
    "en": "⚠️ Safety Alert: Never share your OTP, UPI PIN, Password, CVV, or banking details with anyone, including Sahayyak AI or customer support. We have protected your details and will not save them.",
    "hi": "⚠️ सुरक्षा चेतावनी: कभी भी अपना OTP, UPI पिन, पासवर्ड, CVV या बैंक विवरण किसी के साथ साझा न करें, जिसमें सहायक AI भी शामिल है। हमने आपके विवरण सुरक्षित रखे हैं और उन्हें सहेजा नहीं है।",
    "mr": "⚠️ सुरक्षा सूचना: आपला OTP, UPI पिन, पासवर्ड, CVV किंवा बँक तपशील कोणाशीही शेअर करू नका, अगदी सहाय्यक AI सोबतही नाही. आम्ही तुमचे तपशील सुरक्षित ठेवले आहेत आणि ते सेव्ह केलेले नाहीत."
}

def inspect_safety(message: str, language: str = "en") -> Tuple[bool, Optional[str], str]:
    """
    Checks if user message contains dangerous credentials.
    Returns:
        (is_flagged, warning_message, sanitized_message)
    """
    flagged = False
    sanitized = message
    lang_key = language if language in SAFETY_WARNINGS else "en"

    for pattern, name in SENSITIVE_PATTERNS:
        match = re.search(pattern, sanitized, re.IGNORECASE)
        if match:
            flagged = True
            # Sanitize the sensitive portion
            sanitized = re.sub(pattern, f"[REDACTED {name}]", sanitized, flags=re.IGNORECASE)

    warning = SAFETY_WARNINGS[lang_key] if flagged else None
    return flagged, warning, sanitized
