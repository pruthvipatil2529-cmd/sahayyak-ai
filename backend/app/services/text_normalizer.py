import re
import difflib
from typing import Tuple, Dict

# High-frequency abbreviations, missing-vowel words, phonetic slang, and common mobile typos
COMMON_TYPO_MAP: Dict[str, str] = {
    # Greetings & polite words
    "hw": "how",
    "hwo": "how",
    "ho": "how",
    "plz": "please",
    "pls": "please",
    "hlp": "help",
    "hlping": "helping",
    "thx": "thanks",
    "tq": "thank you",
    "ty": "thank you",
    
    # Common verbs
    "snd": "send",
    "snt": "send",
    "sen": "send",
    "snding": "sending",
    "cnnect": "connect",
    "conect": "connect",
    "conct": "connect",
    "connct": "connect",
    "chek": "check",
    "chck": "check",
    "chk": "check",
    "cheak": "check",
    "chking": "checking",
    "wnt": "want",
    "wnat": "want",
    "wan": "want",
    "wants": "want",
    "instl": "install",
    "instal": "install",
    "instll": "install",
    "instaling": "installing",
    "crete": "create",
    "creat": "create",
    "crte": "create",
    "crting": "creating",
    "delte": "delete",
    "dlete": "delete",
    "delet": "delete",
    "dlt": "delete",
    "dlte": "delete",
    "deleting": "deleting",
    "trnsfr": "transfer",
    "tranfer": "transfer",
    "transfr": "transfer",
    "trnsfer": "transfer",
    "trasfer": "transfer",
    "trnsfring": "transferring",
    "dwnlod": "download",
    "dnload": "download",
    "downlod": "download",
    "dawnload": "download",
    "shre": "share",
    "shar": "share",
    "shring": "sharing",
    "bok": "book",
    "buk": "book",
    "boook": "book",
    "boking": "booking",
    "buking": "booking",
    "rcv": "receive",
    "recive": "receive",
    "receve": "receive",
    "rcving": "receiving",
    "cll": "call",
    "cal": "call",
    "clling": "calling",
    "rechrge": "recharge",
    "rechrg": "recharge",
    "rcg": "recharge",
    "recharg": "recharge",
    "srch": "search",
    "serch": "search",
    "opn": "open",
    "cls": "close",
    "clse": "close",

    # Common nouns & tech terms
    "mony": "money",
    "moni": "money",
    "mny": "money",
    "monye": "money",
    "monry": "money",
    "blance": "balance",
    "balanc": "balance",
    "balnce": "balance",
    "blnc": "balance",
    "balence": "balance",
    "wfi": "wifi",
    "wfy": "wifi",
    "wif": "wifi",
    "whatsap": "whatsapp",
    "watsapp": "whatsapp",
    "whatapp": "whatsapp",
    "watsp": "whatsapp",
    "whatsup": "whatsapp",
    "whtsap": "whatsapp",
    "watsap": "whatsapp",
    "whatsaap": "whatsapp",
    "mesage": "message",
    "msg": "message",
    "msge": "message",
    "messege": "message",
    "msgs": "messages",
    "mesages": "messages",
    "acnt": "account",
    "accnt": "account",
    "acount": "account",
    "accout": "account",
    "acc": "account",
    "ac": "account",
    "pht": "photo",
    "phto": "photo",
    "pic": "photo",
    "pics": "photos",
    "foto": "photo",
    "fota": "photo",
    "photto": "photo",
    "vdo": "video",
    "vedio": "video",
    "vdeo": "video",
    "vido": "video",
    "vidio": "video",
    "sttng": "settings",
    "sttngs": "settings",
    "seting": "settings",
    "setings": "settings",
    "settng": "settings",
    "settngs": "settings",
    "numbr": "number",
    "nmbr": "number",
    "nomber": "number",
    "nubr": "number",
    "no": "number",
    "tkt": "ticket",
    "tikct": "ticket",
    "tket": "ticket",
    "tiket": "ticket",
    "tikcet": "ticket",
    "tickt": "ticket",
    "trin": "train",
    "trai": "train",
    "trean": "train",
    "tran": "train",
    "pswd": "password",
    "paswd": "password",
    "pasword": "password",
    "passwrd": "password",
    "passward": "password",
    "scrn": "screen",
    "scren": "screen",
    "screan": "screen",
    "fon": "phone",
    "fhone": "phone",
    "phn": "phone",
    "moble": "mobile",
    "mobil": "mobile",
    "mob": "mobile",
    "ap": "app",
    "gugl": "google",
    "gogal": "google",
    "googl": "google",
    "gogle": "google",
    "gogl": "google",
    "yutub": "youtube",
    "utub": "youtube",
    "utube": "youtube",
    "youtub": "youtube",
    "ytube": "youtube",
    "fonepe": "phonepe",
    "phonpe": "phonepe",
    "phonep": "phonepe",
    "phnpay": "phonepe",
    "gpay": "google pay",
    "g-pay": "google pay",
    "paytm": "paytm",
    "pay-tm": "paytm",
    "pymt": "payment",
    "paymt": "payment",
    "paymnt": "payment",
    "pyment": "payment",
    "peymnt": "payment",
    "crd": "card",
    "crdt": "card",
    "bnk": "bank",
    "bil": "bill",
    "bll": "bill",
    "gmial": "gmail",
    "gmeil": "gmail",
    "gmal": "gmail",
    "emil": "email",
    "e-mail": "email",
    "intrnet": "internet",
    "netwrk": "network",
    "blutooth": "bluetooth",
    "blutoth": "bluetooth",
    "contcts": "contacts",
    "contct": "contact",
    "cntct": "contact",
    "galery": "gallery",
    "gallry": "gallery",
    "cmra": "camera",
    "camra": "camera",
    "battry": "battery",
    "bettery": "battery",
    "volum": "volume",
    "sund": "sound",
    "languag": "language",
    "lang": "language",
    "lng": "language"
}

# Vocabulary for fuzzy matching unknown words
TECH_VOCABULARY = [
    "how", "to", "send", "money", "connect", "wifi", "whatsapp", "check", 
    "balance", "install", "create", "account", "delete", "message", "messages",
    "transfer", "photo", "photos", "video", "videos", "settings", "call", 
    "ticket", "tickets", "train", "book", "booking", "password", "screen", 
    "phone", "recharge", "google", "youtube", "phonepe", "paytm", "download", 
    "share", "help", "please", "camera", "battery", "volume", "sound", 
    "contact", "contacts", "email", "gmail", "browser", "internet", "network", 
    "bluetooth", "language", "typing", "keyboard", "gallery", "status", 
    "group", "audio", "voice", "microphone", "search", "location", "maps", 
    "payment", "payments", "scanner", "qr", "pin", "otp", "bank", "bill", 
    "railway", "irctc", "flight", "bus", "application", "update", "restart",
    "turn", "switch", "profile", "picture", "display", "light", "dark", "mode"
]

def normalize_user_query(text: str) -> Tuple[str, bool]:
    """
    Intelligently cleans, expands abbreviations, and corrects spelling mistakes 
    in user input while preserving punctuation and original intent.
    
    Returns:
        (normalized_text, was_modified)
    """
    if not text or not text.strip():
        return text, False

    original_text = text.strip()
    words_and_symbols = re.findall(r"\w+|[^\w\s]|\s+", original_text)
    
    normalized_tokens = []
    has_changes = False

    for token in words_and_symbols:
        # If whitespace or punctuation, keep as is
        if not re.match(r"^\w+$", token):
            normalized_tokens.append(token)
            continue

        token_lower = token.lower()

        # 1. Direct typo / slang dictionary match
        if token_lower in COMMON_TYPO_MAP:
            replacement = COMMON_TYPO_MAP[token_lower]
            # Preserve capitalization if user typed Capitalized word
            if token.isupper() and len(token) > 1:
                replacement = replacement.upper()
            elif token[0].isupper():
                replacement = replacement.capitalize()
            normalized_tokens.append(replacement)
            has_changes = True
            continue

        # 2. Fuzzy match against vocabulary if word is at least 3 letters long
        if len(token_lower) >= 3 and token_lower not in TECH_VOCABULARY:
            cutoff = 0.82 if len(token_lower) <= 4 else 0.74
            matches = difflib.get_close_matches(token_lower, TECH_VOCABULARY, n=1, cutoff=cutoff)
            if matches:
                matched_word = matches[0]
                if token.isupper() and len(token) > 1:
                    matched_word = matched_word.upper()
                elif token[0].isupper():
                    matched_word = matched_word.capitalize()
                normalized_tokens.append(matched_word)
                has_changes = True
                continue

        # Keep original token
        normalized_tokens.append(token)

    normalized_text = "".join(normalized_tokens).strip()
    # Normalize multiple spaces
    normalized_text = re.sub(r"\s+", " ", normalized_text)

    return normalized_text, has_changes
