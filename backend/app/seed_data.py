import json
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.guide import Category, Guide
from app.models.user import User
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")

CATEGORIES_DATA = [
    {
        "name": "Smartphone Basics",
        "name_hi": "स्मार्टफोन मूल बातें",
        "name_mr": "स्मार्टफोन मूलभूत गोष्टी",
        "slug": "smartphone",
        "description": "Essential settings, volume, Wi-Fi, and screen controls.",
        "icon": "Smartphone",
        "display_order": 1
    },
    {
        "name": "WhatsApp & Calls",
        "name_hi": "व्हाट्सएप और कॉलिंग",
        "name_mr": "व्हॉट्सॲप आणि कॉलिंग",
        "slug": "whatsapp",
        "description": "Sending messages, photos, and making voice or video calls.",
        "icon": "MessageCircle",
        "display_order": 2
    },
    {
        "name": "Online Payments & UPI",
        "name_hi": "ऑनलाइन भुगतान और यूपीआई",
        "name_mr": "ऑनलाइन पेमेंट्स आणि UPI",
        "slug": "payments",
        "description": "Sending money safely, checking transactions, avoiding scams.",
        "icon": "CreditCard",
        "display_order": 3
    },
    {
        "name": "Email & Communication",
        "name_hi": "ईमेल और संवाद",
        "name_mr": "ईमेल आणि संभाषण",
        "slug": "email",
        "description": "Reading emails, sending replies, attaching documents.",
        "icon": "Mail",
        "display_order": 4
    },
    {
        "name": "Internet Safety Shield",
        "name_hi": "इंटरनेट सुरक्षा शील्ड",
        "name_mr": "इंटरनेट सुरक्षा संरक्षण",
        "slug": "safety",
        "description": "Spotting fake calls, protecting OTPs and personal details.",
        "icon": "ShieldCheck",
        "display_order": 5
    },
    {
        "name": "Digital & Government Services",
        "name_hi": "डिजिटल और सरकारी सेवाएं",
        "name_mr": "डिजिटल आणि शासकीय सेवा",
        "slug": "services",
        "description": "Accessing public portals, downloading utility bills.",
        "icon": "Globe",
        "display_order": 6
    }
]

GUIDES_DATA = [
    {
        "category_slug": "smartphone",
        "title": "How to Connect to Wi-Fi",
        "title_hi": "वाई-फाई से कैसे कनेक्ट करें",
        "title_mr": "वाय-फाय (Wi-Fi) शी कसे कनेक्ट करावे",
        "description": "Connect your smartphone to home or office Wi-Fi to use the internet without mobile data charges.",
        "description_hi": "मोबाइल डेटा बचाकर इंटरनेट का उपयोग करने के लिए अपने फोन को घर के वाई-फाई से जोड़ें।",
        "description_mr": "मोबाइल डेटा वाचवून इंटरनेट वापरण्यासाठी आपल्या फोनला घरच्या वाय-फायशी जोडा.",
        "difficulty": "Easy",
        "tags": "wifi, internet, settings, network",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Settings",
                "instruction": "Open the Settings app on your phone (look for a gear icon ⚙️).",
                "instruction_hi": "अपने फोन पर सेटिंग्स ऐप खोलें (गियर आइकन ⚙️ देखें)।",
                "instruction_mr": "फोनमधील 'Settings' (गियर चिन्ह ⚙️) ॲप उघडा.",
                "tip": "Usually found on your home screen or swipe-down menu."
            },
            {
                "step_number": 2,
                "title": "Tap Wi-Fi",
                "instruction": "Tap on the 'Wi-Fi' or 'Network & Internet' option.",
                "instruction_hi": "'Wi-Fi' या 'नेटवर्क' विकल्प पर टैप करें।",
                "instruction_mr": "'Wi-Fi' किंवा 'Network' पर्यायावर टॅप करा.",
                "tip": "It is usually the very first option in Settings."
            },
            {
                "step_number": 3,
                "title": "Turn Wi-Fi On",
                "instruction": "Make sure the switch at the top is turned ON (it will turn blue or green).",
                "instruction_hi": "ऊपर दिए गए स्विच को चालू (ON) करें।",
                "instruction_mr": "वरील Wi-Fi चे बटण चालू (ON) करा.",
                "tip": "Your phone will automatically scan for available networks."
            },
            {
                "step_number": 4,
                "title": "Choose Network",
                "instruction": "Look for your home Wi-Fi name in the list and tap on it.",
                "instruction_hi": "सूची में से अपने घर के वाई-फाई के नाम पर टैप करें।",
                "instruction_mr": "खाली दिसणाऱ्या नावांतून तुमच्या घराच्या वाय-फाय नावावर टॅप करा.",
                "tip": "The Wi-Fi name is often written on the back of your home router."
            },
            {
                "step_number": 5,
                "title": "Enter Password",
                "instruction": "Carefully type the Wi-Fi password and tap 'Connect'.",
                "instruction_hi": "अपना पासवर्ड ध्यान से दर्ज करें और 'Connect' पर टैप करें।",
                "instruction_mr": "पासवर्ड काळजीपूर्वक टाका आणि 'Connect' वर टॅप करा.",
                "tip": "Check the 'Show Password' box so you can see what you type."
            }
        ],
        "safety_tips": [
            {"tip": "Avoid connecting to unknown open public Wi-Fi networks in railway stations without a password.", "tip_hi": "अपरिचित खुले वाई-फाई नेटवर्क से जुड़ने से बचें।", "tip_mr": "अनोळखी किंवा संशयास्पद मोफत वाय-फाय नेटवर्क वापरणे टाळा."}
        ]
    },
    {
        "category_slug": "whatsapp",
        "title": "How to Send a Photo on WhatsApp",
        "title_hi": "व्हाट्सएप पर फोटो कैसे भेजें",
        "title_mr": "व्हॉट्सॲपवर फोटो कसा पाठवावा",
        "description": "Send family pictures or greetings to your friends and loved ones easily.",
        "description_hi": "अपने प्रियजनों और दोस्तों को आसानी से तस्वीरें और शुभकामनाएं भेजें।",
        "description_mr": "मित्र आणि नातेवाईकांना सोप्या पद्धतीने फोटो आणि शुभेच्छा पाठवा.",
        "difficulty": "Easy",
        "tags": "whatsapp, photo, picture, camera, gallery",
        "steps": [
            {
                "step_number": 1,
                "title": "Open WhatsApp",
                "instruction": "Find and tap the green WhatsApp icon on your phone.",
                "instruction_hi": "अपने फोन पर हरे रंग के व्हाट्सएप आइकन पर टैप करें।",
                "instruction_mr": "फोनवरील हिरव्या व्हॉट्सॲप आयकॉनवर टॅप करा.",
                "tip": "WhatsApp shows your chat conversations."
            },
            {
                "step_number": 2,
                "title": "Select Friend or Relative",
                "instruction": "Tap the name of the person you want to send the photo to.",
                "instruction_hi": "उस व्यक्ति के नाम पर टैप करें जिसे आप फोटो भेजना चाहते हैं।",
                "instruction_mr": "ज्या व्यक्तीला फोटो पाठवायचा आहे त्यांच्या नावावर टॅप करा.",
                "tip": "Their chat window will open."
            },
            {
                "step_number": 3,
                "title": "Tap Attachment or Camera",
                "instruction": "At the bottom near the message box, tap the paperclip 📎 or camera 📷 icon.",
                "instruction_hi": "नीचे टाइपिंग बॉक्स के पास पेपरक्लिप 📎 या कैमरा 📷 आइकन पर टैप करें।",
                "instruction_mr": "खाली मेसेज बॉक्सजवळ पिन 📎 किंवा कॅमेरा 📷 चिन्हावर टॅप करा.",
                "tip": "Paperclip lets you choose already saved photos."
            },
            {
                "step_number": 4,
                "title": "Select Photo from Gallery",
                "instruction": "Tap 'Gallery' and tap the photo you want to share.",
                "instruction_hi": "'गैलरी' पर टैप करें और वह फोटो चुनें जिसे आप भेजना चाहते हैं।",
                "instruction_mr": "'Gallery' निवडा आणि जो फोटो पाठवायचा आहे त्यावर टॅप करा.",
                "tip": "You can add a message below the photo if you like."
            },
            {
                "step_number": 5,
                "title": "Tap Send",
                "instruction": "Tap the round green arrow button at the bottom right corner.",
                "instruction_hi": "नीचे दाईं ओर गोल हरे तीर (Send) बटन पर टैप करें।",
                "instruction_mr": "उजव्या बाजूला खाली असलेल्या हिरव्या बाणाच्या (Send) बटनावर टॅप करा.",
                "tip": "A single tick means sent, two ticks mean delivered!"
            }
        ],
        "safety_tips": [
            {"tip": "Only send private family photos to verified contacts.", "tip_hi": "केवल भरोसेमंद संपर्कों को ही अपनी निजी तस्वीरें भेजें।", "tip_mr": "फक्त खात्रीशीर ओळखीच्या व्यक्तींनाच खाजगी फोटो पाठवा."}
        ]
    },
    {
        "category_slug": "whatsapp",
        "title": "How to Make a WhatsApp Video Call",
        "title_hi": "व्हाट्सएप वीडियो कॉल कैसे करें",
        "title_mr": "व्हॉट्सॲप व्हिडिओ कॉल कसा करावा",
        "description": "See and talk to your children or grandchildren face-to-face from anywhere.",
        "description_hi": "कहीं से भी अपने बच्चों और प्रियजनों से आमने-सामने वीडियो पर बात करें।",
        "description_mr": "कुठूनही आपल्या मुलांशी व नातेवाईकांशी समोरासमोर व्हिडिओ कॉलवर बोला.",
        "difficulty": "Easy",
        "tags": "whatsapp, video call, calling, talk, face",
        "steps": [
            {
                "step_number": 1,
                "title": "Open WhatsApp",
                "instruction": "Open WhatsApp and tap the chat of the person you want to call.",
                "instruction_hi": "व्हाट्सएप खोलें और उस व्यक्ति के चैट पर टैप करें जिसे कॉल करना है।",
                "instruction_mr": "व्हॉट्सॲप उघडून कॉल करायच्या व्यक्तीच्या चॅटवर टॅप करा.",
                "tip": "Make sure you are connected to Wi-Fi or mobile internet."
            },
            {
                "step_number": 2,
                "title": "Look at Top Right Corner",
                "instruction": "Look at the top right of the screen for the small Video Camera icon 📹.",
                "instruction_hi": "स्क्रीन के ऊपर दाईं ओर छोटे वीडियो कैमरा आइकन 📹 को देखें।",
                "instruction_mr": "स्क्रीनच्या वर उजव्या कोपऱ्यात लहान व्हिडिओ कॅमेरा चिन्ह 📹 शोधा.",
                "tip": "The phone receiver icon next to it is for voice-only call."
            },
            {
                "step_number": 3,
                "title": "Tap the Video Icon",
                "instruction": "Tap the video camera icon. A popup will ask 'Start video call?'. Tap 'Call'.",
                "instruction_hi": "वीडियो कैमरा आइकन पर टैप करें और 'Call' चुनें।",
                "instruction_mr": "व्हिडिओ कॅमेरा चिन्हावर टॅप करा आणि 'Call' निवडा.",
                "tip": "Hold the phone at arm's length so they can see your smiling face."
            },
            {
                "step_number": 4,
                "title": "End Call When Done",
                "instruction": "When finished talking, tap the red circle button with the telephone handset to hang up.",
                "instruction_hi": "बातचीत समाप्त होने पर कॉल काटने के लिए लाल बटन दबाएं।",
                "instruction_mr": "बोलणे संपल्यावर कॉल कट करण्यासाठी लाल बटनावर टॅप करा.",
                "tip": "The red button is always at the bottom of the screen."
            }
        ],
        "safety_tips": [
            {"tip": "Do not accept video calls from unknown foreign numbers.", "tip_hi": "अज्ञात नंबरों से आने वाले वीडियो कॉल न उठाएं।", "tip_mr": "अनोळखी आंतरराष्ट्रीय नंबरवरून येणारे व्हिडिओ कॉल उचलू नका."}
        ]
    },
    {
        "category_slug": "payments",
        "title": "How to Use UPI Safely (Golden Rules)",
        "title_hi": "UPI का सुरक्षित उपयोग कैसे करें (स्वर्ण नियम)",
        "title_mr": "UPI चा सुरक्षित वापर कसा करावा (सुवर्ण नियम)",
        "description": "Essential safeguards every senior must know when using Google Pay, PhonePe, or Paytm.",
        "description_hi": "गूगल पे, फोनपे या पेटीएम का उपयोग करते समय हर बुजुर्ग के लिए आवश्यक सुरक्षा नियम।",
        "description_mr": "गुगल पे, फोनपे किंवा पेटीएम वापरताना ज्येष्ठ नागरिकांनी पाळायचे अत्यंत महत्त्वाचे नियम.",
        "difficulty": "Easy",
        "tags": "upi, gpay, phonepe, paytm, safety, scam, pin",
        "steps": [
            {
                "step_number": 1,
                "title": "The Golden Rule of Receiving Money",
                "instruction": "NEVER enter your UPI PIN to receive money! Receiving money is automatic; it requires NO PIN.",
                "instruction_hi": "पैसे प्राप्त करने के लिए कभी भी UPI पिन दर्ज न करें! पैसे सीधे खाते में आते हैं।",
                "instruction_mr": "पैसे खात्यात जमा होण्यासाठी कधीही UPI पिन टाकू नका! पैसे आपोआप जमा होतात.",
                "tip": "If someone says 'enter your PIN to receive Rs 5000 prize', it is 100% a fraud scam."
            },
            {
                "step_number": 2,
                "title": "When Sending Money: Verify Name",
                "instruction": "When scanning a QR code or entering a phone number, check the recipient's registered bank name displayed on screen.",
                "instruction_hi": "पैसे भेजने से पहले स्क्रीन पर दिखने वाला नाम ध्यान से पढ़ें।",
                "instruction_mr": "पैसे पाठवण्यापूर्वी स्क्रीनवर दिसणारे नाव काळजीपूर्वक तपासा.",
                "tip": "Confirm the name with the shopkeeper or person before proceeding."
            },
            {
                "step_number": 3,
                "title": "Entering Your Secret PIN",
                "instruction": "Enter your UPI PIN only on your own phone when YOU are paying.",
                "instruction_hi": "अपना UPI पिन केवल तभी दर्ज करें जब आप खुद भुगतान कर रहे हों।",
                "instruction_mr": "फक्त स्वतः पैसे पाठवतानाच तुमचा गुपित पिन टाका.",
                "tip": "Cover your keypad so nobody standing behind you can see your PIN."
            },
            {
                "step_number": 4,
                "title": "Never Share OTP or Screen",
                "instruction": "Never read out any 6-digit SMS OTP code to anyone claiming to be from your bank.",
                "instruction_hi": "बैंक अधिकारी होने का दावा करने वाले किसी भी व्यक्ति को OTP न बताएं।",
                "instruction_mr": "बँक अधिकारी असल्याचा दावा करणाऱ्या कोणालाही OTP सांगू नका.",
                "tip": "Banks will NEVER call and ask for your OTP or PIN."
            }
        ],
        "safety_tips": [
            {"tip": "Never install apps like AnyDesk, TeamViewer, or QuickSupport on the request of strangers.", "tip_hi": "अजनबियों के कहने पर AnyDesk या TeamViewer जैसे ऐप कभी इंस्टॉल न करें।", "tip_mr": "कोणीही अनोळखी व्यक्तीने सांगितल्यास AnyDesk किंवा TeamViewer सारखे ॲप्स डाऊनलोड करू नका."}
        ]
    },
    {
        "category_slug": "payments",
        "title": "How to Send Money Using Google Pay or PhonePe",
        "title_hi": "Google Pay या PhonePe से पैसे कैसे भेजें",
        "title_mr": "Google Pay किंवा PhonePe द्वारे पैसे कसे पाठवावे",
        "description": "Step by step guide to paying at local grocery stores or sending money to relatives.",
        "description_hi": "दुकानदार को क्यूआर कोड स्कैन करके या रिश्तेदारों को सुरक्षित भुगतान करने की विधि।",
        "description_mr": "दुकानातील QR कोड स्कॅन करून किंवा नातेवाईकांना सुरक्षितपणे पैसे पाठवण्याची पद्धत.",
        "difficulty": "Easy",
        "tags": "upi, pay, send money, qr code, google pay, phonepe",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Payment App",
                "instruction": "Unlock your phone and open your payment app (Google Pay or PhonePe).",
                "instruction_hi": "अपना पेमेंट ऐप (गूगल पे या फोनपे) खोलें।",
                "instruction_mr": "तुमचे पेमेंट ॲप (Google Pay किंवा PhonePe) उघडा.",
                "tip": "Use your fingerprint or screen lock to open it."
            },
            {
                "step_number": 2,
                "title": "Scan QR Code or Enter Number",
                "instruction": "Tap 'Scan QR' to point your camera at the shop's QR code, OR tap 'To Mobile Number'.",
                "instruction_hi": "दुकान का क्यूआर कोड स्कैन करने के लिए 'Scan QR' पर टैप करें।",
                "instruction_mr": "दुकानातील QR कोड स्कॅन करण्यासाठी 'Scan QR' वर टॅप करा.",
                "tip": "Hold the phone steady until it beeps."
            },
            {
                "step_number": 3,
                "title": "Check Amount and Name",
                "instruction": "Verify the name displayed matches the shop or person. Type the amount you wish to pay.",
                "instruction_hi": "नाम जांचें और भुगतान की जाने वाली राशि दर्ज करें।",
                "instruction_mr": "नाव तपासा आणि पाठवायची रक्कम टाका.",
                "tip": "Always double check the zeroes (e.g., 50 vs 500)."
            },
            {
                "step_number": 4,
                "title": "Enter Your UPI PIN",
                "instruction": "Tap 'Proceed to Pay' and enter your 4 or 6-digit secret UPI PIN.",
                "instruction_hi": "'Proceed to Pay' दबाएं और अपना 4 या 6 अंकों का UPI पिन दर्ज करें।",
                "instruction_mr": "'Proceed to Pay' वर टॅप करून तुमचा ४ किंवा ६ अंकी UPI पिन टाका.",
                "tip": "Never tell this PIN out loud."
            },
            {
                "step_number": 5,
                "title": "Check the Success Screen",
                "instruction": "A green checkmark will appear with a chime confirming the payment was successful.",
                "instruction_hi": "भुगतान पूरा होने पर हरी टिक और आवाज़ आएगी।",
                "instruction_mr": "पेमेंट पूर्ण झाल्यावर हिरवी टिक आणि आवाज येईल.",
                "tip": "Show this screen to the shopkeeper if requested."
            }
        ],
        "safety_tips": [
            {"tip": "Verify payment confirmation on your bank's official SMS, not via screenshots.", "tip_hi": "केवल अपने बैंक के आधिकारिक SMS पर भरोसा करें।", "tip_mr": "फक्त बँकेच्या अधिकृत मेसेजवर विश्वास ठेवा."}
        ]
    },
    {
        "category_slug": "smartphone",
        "title": "How to Increase Text Size on Your Phone",
        "title_hi": "अपने फोन पर फॉन्ट/अक्षरों का आकार कैसे बढ़ाएं",
        "title_mr": "फोनमधील अक्षरांचा (Font) आकार कसा वाढवावा",
        "description": "Make letters bigger and easier to read without straining your eyes.",
        "description_hi": "बिना चश्मे के तनाव के आसानी से पढ़ने के लिए अक्षरों का आकार बड़ा करें।",
        "description_mr": "डोळ्यांवर ताण न येता स्पष्ट वाचता यावे म्हणून अक्षरांचा आकार मोठा करा.",
        "difficulty": "Easy",
        "tags": "font, text size, display, vision, accessibility",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Settings",
                "instruction": "Open the Settings app ⚙️ on your smartphone.",
                "instruction_hi": "अपने फोन पर सेटिंग्स ⚙️ ऐप खोलें।",
                "instruction_mr": "फोनमधील 'Settings' ⚙️ ॲप उघडा.",
                "tip": "Look for the gear icon."
            },
            {
                "step_number": 2,
                "title": "Tap Display",
                "instruction": "Scroll down slightly and tap 'Display' (sometimes called 'Display & Brightness').",
                "instruction_hi": "नीचे स्क्रॉल करें और 'Display' (डिस्प्ले) विकल्प पर टैप करें।",
                "instruction_mr": "खाली स्क्रोल करून 'Display' पर्यायावर टॅप करा.",
                "tip": "It usually has a sun or screen icon."
            },
            {
                "step_number": 3,
                "title": "Find Font Size",
                "instruction": "Tap on 'Font Size' or 'Text Size'.",
                "instruction_hi": "'Font size' या 'अक्षर आकार' पर टैप करें।",
                "instruction_mr": "'Font size' किंवा 'Text size' वर टॅप करा.",
                "tip": "You will see a sample preview of text."
            },
            {
                "step_number": 4,
                "title": "Drag the Slider to the Right",
                "instruction": "Slide the circle to the right side towards 'Large' or 'Largest' until the text is comfortably readable.",
                "instruction_hi": "स्लाइडर को दाईं ओर खिसकाएं जब तक कि अक्षर बड़े और साफ न दिखें।",
                "instruction_mr": "स्लायडर उजवीकडे ओढा जेणेकरून अक्षरे मोठी आणि वाचायला सोपी होतील.",
                "tip": "The change takes effect across all apps immediately."
            }
        ],
        "safety_tips": [
            {"tip": "You can change this anytime without losing any messages or data.", "tip_hi": "आप इसे बिना किसी डेटा नुकसान के कभी भी बदल सकते हैं।", "tip_mr": "यामुळे कोणताही डेटा नष्ट होत नाही, तुम्ही हे कधीही बदलू शकता."}
        ]
    },
    {
        "category_slug": "smartphone",
        "title": "How to Take a Screenshot",
        "title_hi": "फोन में स्क्रीनशॉट (फोटो) कैसे लें",
        "title_mr": "फोनवर स्क्रीनशॉट कसा काढावा",
        "description": "Capture an exact picture of whatever is on your phone screen to save or share with family.",
        "description_hi": "अपने फोन की स्क्रीन पर दिखने वाली जानकारी को सहेजने के लिए स्क्रीनशॉट लें।",
        "description_mr": "स्क्रीनवर दिसणारी महत्त्वाची माहिती जतन करण्यासाठी स्क्रीनशॉट काढा.",
        "difficulty": "Easy",
        "tags": "screenshot, screen capture, save photo, buttons",
        "steps": [
            {
                "step_number": 1,
                "title": "Display What You Want to Capture",
                "instruction": "Open the message, receipt, or photo you want to save on your screen.",
                "instruction_hi": "वह रसीद या संदेश खोलें जिसे आप सहेजना चाहते हैं।",
                "instruction_mr": "जतन करायचा असलेला मेसेज किंवा पावती स्क्रीनवर उघडा.",
                "tip": "Make sure everything you want is clearly visible."
            },
            {
                "step_number": 2,
                "title": "Locate Side Buttons",
                "instruction": "Find the Power button (used to turn screen on/off) and the Volume Down button on the sides of your phone.",
                "instruction_hi": "अपने फोन का पावर बटन और वॉल्यूम डाउन (आवाज कम करने वाला) बटन खोजें।",
                "instruction_mr": "फोनचे पॉवर बटण आणि आवाज कमी करण्याचे (Volume Down) बटण शोधा.",
                "tip": "They are located on the left or right edges of the phone."
            },
            {
                "step_number": 3,
                "title": "Press Both Together Quickly",
                "instruction": "Press the Power button and Volume Down button at the exact same moment and release.",
                "instruction_hi": "पावर बटन और वॉल्यूम कम करने वाले बटन को एक साथ एक सेकंड के लिए दबाएं।",
                "instruction_mr": "दोन्ही बटणे एकाच वेळी एक सेकंदासाठी दाबा आणि सोडा.",
                "tip": "The screen will flash white or make a shutter sound."
            },
            {
                "step_number": 4,
                "title": "View in Gallery",
                "instruction": "Open your 'Photos' or 'Gallery' app and look in the 'Screenshots' album.",
                "instruction_hi": "अपनी 'गैलरी' ऐप में 'Screenshots' एल्बम देखें।",
                "instruction_mr": "गॅलरीमध्ये जाऊन 'Screenshots' फोल्डर तपासा.",
                "tip": "You can send it on WhatsApp just like any regular photo."
            }
        ],
        "safety_tips": [
            {"tip": "Do not screenshot sensitive bank cards or passwords.", "tip_hi": "बैंक कार्ड या पासवर्ड का स्क्रीनशॉट न लें।", "tip_mr": "बँक कार्ड किंवा पासवर्डचे स्क्रीनशॉट काढू नका."}
        ]
    },
    {
        "category_slug": "smartphone",
        "title": "How to Turn Bluetooth On and Connect Headphones",
        "title_hi": "ब्लूटूथ चालू करें और हेडफ़ोन कनेक्ट करें",
        "title_mr": "ब्लूटूथ चालू करून हेडफोन कसे जोडावे",
        "description": "Listen to music, bhajans, or video calls wirelessly without tangled wires.",
        "description_hi": "बिना उलझे तारों के भजन, संगीत या कॉल सुनने के लिए ब्लूटूथ हेडफ़ोन कनेक्ट करें।",
        "description_mr": "वायरशिवाय भजन, गाणी किंवा कॉल ऐकण्यासाठी ब्लूटूथ हेडफोन जोडा.",
        "difficulty": "Medium",
        "tags": "bluetooth, headphones, earphone, wireless, settings",
        "steps": [
            {
                "step_number": 1,
                "title": "Turn On Your Headphones",
                "instruction": "Press and hold the power button on your headphones or open your earbud case until a small light blinks.",
                "instruction_hi": "अपने हेडफ़ोन का पावर बटन दबाएं जब तक कि छोटी लाइट न जलने लगे।",
                "instruction_mr": "हेडफोनचे पॉवर बटण लाइट चमकेपर्यंत दाबून ठेवा.",
                "tip": "A blinking light means they are ready to connect."
            },
            {
                "step_number": 2,
                "title": "Open Bluetooth on Phone",
                "instruction": "Swipe down from the very top of your phone screen. Tap and hold the 'Bluetooth' icon ᛒ.",
                "instruction_hi": "स्क्रीन के ऊपर से नीचे स्वाइप करें और 'Bluetooth' आइकन ᛒ पर दबाकर रखें।",
                "instruction_mr": "स्क्रीनवरून खाली स्वाइप करा आणि 'Bluetooth' चिन्हावर ᛒ दाबून ठेवा.",
                "tip": "Or go to Settings > Bluetooth."
            },
            {
                "step_number": 3,
                "title": "Pair New Device",
                "instruction": "Make sure Bluetooth is turned ON, then tap 'Pair new device' or wait for scanning.",
                "instruction_hi": "ब्लूटूथ चालू करें और 'Pair new device' पर टैप करें।",
                "instruction_mr": "ब्लूटूथ चालू करून 'Pair new device' वर टॅप करा.",
                "tip": "Keep your headphones right next to the phone."
            },
            {
                "step_number": 4,
                "title": "Tap Headphone Name",
                "instruction": "Look for your headphone's brand name in the list (e.g. boAt, Noise, Sony) and tap it.",
                "instruction_hi": "सूची में से अपने हेडफ़ोन के नाम पर टैप करें।",
                "instruction_mr": "दिसणाऱ्या यादीतून तुमच्या हेडफोनच्या नावावर टॅप करा.",
                "tip": "Tap 'Pair' or 'Allow' when the confirmation box appears."
            }
        ],
        "safety_tips": [
            {"tip": "Turn off Bluetooth when not in use to save phone battery.", "tip_hi": "बैटरी बचाने के लिए उपयोग न होने पर ब्लूटूथ बंद रखें।", "tip_mr": "बॅटरी वाचवण्यासाठी गरज नसताना ब्लूटूथ बंद ठेवा."}
        ]
    },
    {
        "category_slug": "email",
        "title": "How to Read and Reply to an Email in Gmail",
        "title_hi": "जीमेल (Gmail) में ईमेल कैसे पढ़ें और उत्तर दें",
        "title_mr": "Gmail मध्ये ईमेल कसा वाचावा आणि उत्तर द्यावे",
        "description": "Check important messages from government offices, banks, or family in Gmail.",
        "description_hi": "जीमेल में बैंक, सरकारी सूचनाओं या परिवार के महत्वपूर्ण संदेश आसानी से पढ़ें।",
        "description_mr": "बँक किंवा शासनाकडून आलेले महत्त्वाचे ईमेल सहज वाचा आणि उत्तर द्या.",
        "difficulty": "Medium",
        "tags": "email, gmail, reply, read, letters",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Gmail App",
                "instruction": "Find and tap the Gmail app icon (looks like a red and white envelope with an 'M').",
                "instruction_hi": "अपने फोन पर जीमेल (लाल और सफेद 'M' लिफाफा) ऐप खोलें।",
                "instruction_mr": "फोनमधील Gmail (लाल-पांढऱ्या रंगाचे 'M' चिन्ह) ॲप उघडा.",
                "tip": "You will see a list of your received emails."
            },
            {
                "step_number": 2,
                "title": "Tap the Email to Read",
                "instruction": "Tap once on the email you want to read. The full message will open.",
                "instruction_hi": "जिस ईमेल को पढ़ना चाहते हैं, उस पर एक बार टैप करें।",
                "instruction_mr": "वाचायच्या असलेल्या ईमेलवर एकदा टॅप करा. पूर्ण मेसेज दिसेल.",
                "tip": "Unread emails appear in bold letters."
            },
            {
                "step_number": 3,
                "title": "Tap Reply at the Bottom",
                "instruction": "Scroll down to the end of the email and tap the 'Reply' button (a curved left arrow ↩️).",
                "instruction_hi": "ईमेल के नीचे जाएं और 'Reply' (घूमा हुआ बायाँ तीर ↩️) बटन पर टैप करें।",
                "instruction_mr": "खाली स्क्रोल करून 'Reply' (डाव्या बाजूचा वळलेला बाण ↩️) बटनावर टॅप करा.",
                "tip": "This automatically prepares a message back to the sender."
            },
            {
                "step_number": 4,
                "title": "Type Your Message & Send",
                "instruction": "Type your reply. When finished, tap the blue paper airplane icon at the top right.",
                "instruction_hi": "अपना संदेश लिखें और ऊपर दाईं ओर बने नीले हवाई जहाज आइकन पर टैप करें।",
                "instruction_mr": "तुमचा निरोप टाईप करा आणि वर उजव्या बाजूला असलेल्या निळ्या बाणावर टॅप करा.",
                "tip": "Your reply will be delivered immediately."
            }
        ],
        "safety_tips": [
            {"tip": "Never click on strange links in emails asking you to 'update KYC' or 'claim jackpot'.", "tip_hi": "केवाईसी अपडेट या लॉटरी के अनजान ईमेल लिंक पर कभी क्लिक न करें।", "tip_mr": "KYC अपडेट किंवा लॉटरीच्या संशयास्पद लिंक्सवर कधीही क्लिक करू नका."}
        ]
    },
    {
        "category_slug": "email",
        "title": "How to Attach a Document or Photo to an Email",
        "title_hi": "ईमेल में कोई दस्तावेज या फोटो कैसे जोड़ें (अटैच करें)",
        "title_mr": "ईमेलला कागदपत्र किंवा फोटो कसा जोडावा (Attach करावा)",
        "description": "Send bills, medical receipts, or documents to relatives, doctors, or offices via email.",
        "description_hi": "डॉक्टर, दफ्तर या परिजनों को आवश्यक दस्तावेज और बिल ईमेल से भेजें।",
        "description_mr": "डॉक्टर किंवा कार्यालयाला बिल, पावत्या किंवा कागदपत्रे ईमेलने पाठवा.",
        "difficulty": "Medium",
        "tags": "email, attach, paperclip, pdf, document, photo",
        "steps": [
            {
                "step_number": 1,
                "title": "Start a New Email",
                "instruction": "Open Gmail and tap the 'Compose' button with a colorful pen ✍️ at the bottom right.",
                "instruction_hi": "जीमेल खोलें और नीचे दाईं ओर 'Compose' (पेन ✍️) बटन पर टैप करें।",
                "instruction_mr": "Gmail उघडून खाली उजवीकडे 'Compose' बटनावर टॅप करा.",
                "tip": "Type the recipient's email address in the 'To' field."
            },
            {
                "step_number": 2,
                "title": "Tap the Paperclip Icon",
                "instruction": "At the very top of the screen, tap the paperclip icon 📎.",
                "instruction_hi": "स्क्रीन के सबसे ऊपर पेपरक्लिप 📎 आइकन पर टैप करें।",
                "instruction_mr": "स्क्रीनच्या वरच्या बाजूला पिन 📎 चिन्हावर टॅप करा.",
                "tip": "Select 'Attach file' from the small menu."
            },
            {
                "step_number": 3,
                "title": "Pick Your File or Photo",
                "instruction": "Tap on the document, PDF bill, or photo you wish to attach.",
                "instruction_hi": "वह फोटो या पीडीएफ फाइल चुनें जिसे आप भेजना चाहते हैं।",
                "instruction_mr": "पाठवायची असलेली फाईल किंवा फोटो निवडा.",
                "tip": "You will see a small preview icon attached to your email."
            },
            {
                "step_number": 4,
                "title": "Send the Email",
                "instruction": "Tap the blue paper airplane arrow at the top right to send.",
                "instruction_hi": "भेजने के लिए ऊपर नीले तीर के आइकन पर टैप करें।",
                "instruction_mr": "ईमेल पाठवण्यासाठी वरील निळ्या बाणावर टॅप करा.",
                "tip": "Wait a few seconds for the file to upload."
            }
        ],
        "safety_tips": [
            {"tip": "Check the recipient's email spelling carefully before sending sensitive documents.", "tip_hi": "दस्तावेज भेजने से पहले ईमेल पता ध्यान से जांचें।", "tip_mr": "कागदपत्रे पाठवण्यापूर्वी ईमेल पत्ता दोनदा तपासा."}
        ]
    },
    {
        "category_slug": "safety",
        "title": "How to Spot and Avoid Fake Customer Care Calls",
        "title_hi": "फर्जी कस्टमर केयर कॉल की पहचान और बचाव",
        "title_mr": "बनावट कस्टमर केअर कॉल कसे ओळखावे आणि फसवणूक कशी टाळावी",
        "description": "Protect your hard-earned pension and savings from telephone scammers posing as bank officials.",
        "description_hi": "बैंक या बिजली विभाग के नाम पर आने वाले फर्जी फोन कॉल्स से अपनी बचत की सुरक्षा करें।",
        "description_mr": "बँक किंवा वीज कंपनीच्या नावाने येणाऱ्या बनावट फोन कॉल्सपासून स्वतःचा बचाव करा.",
        "difficulty": "Easy",
        "tags": "scam, fraud, safety, customer care, fake call, warning",
        "steps": [
            {
                "step_number": 1,
                "title": "Notice Urgent Threats",
                "instruction": "Scammers always create panic saying 'Your account/SIM will be blocked in 2 hours!'. Genuine banks never give sudden 2-hour deadlines.",
                "instruction_hi": "धोखेबाज हमेशा डराते हैं कि '2 घंटे में आपका खाता बंद हो जाएगा!'। घबराएं नहीं।",
                "instruction_mr": "'दोन तासात खाते किंवा सिम बंद होईल' अशी भीती दाखवणाऱ्या कॉल्सवर अजिबात विश्वास ठेवू नका.",
                "tip": "Take a deep breath and immediately hang up the call."
            },
            {
                "step_number": 2,
                "title": "Never Install Remote Apps",
                "instruction": "If any caller asks you to install AnyDesk, QuickSupport, RustDesk, or TeamViewer, refuse immediately! These apps give them complete view of your phone screen.",
                "instruction_hi": "कॉलर के कहने पर AnyDesk या QuickSupport जैसे ऐप कभी डाउनलोड न करें।",
                "instruction_mr": "कोणीही सांगितल्यास AnyDesk किंवा QuickSupport सारखे ॲप्स मोबाईलमध्ये इन्स्टॉल करू नका.",
                "tip": "Installing them allows fraudsters to see your bank passwords and OTPs."
            },
            {
                "step_number": 3,
                "title": "Never Search Customer Care on Google",
                "instruction": "Fraudsters put fake numbers on Google Maps and search. Always find official numbers from the back of your debit card or official bank passbook.",
                "instruction_hi": "गूगल पर कस्टमर केयर नंबर न खोजें। अपनी बैंक पासबुक या एटीएम कार्ड के पीछे का नंबर देखें।",
                "instruction_mr": "गुगलवर कस्टमर केअर नंबर शोधू नका. आपल्या पासबुक किंवा एटीएम कार्डवरील अधिकृत नंबर वापरा.",
                "tip": "Your physical passbook has the real branch phone number."
            },
            {
                "step_number": 4,
                "title": "Consult a Family Member",
                "instruction": "When in any doubt, ask a younger family member or visit your local bank branch in person.",
                "instruction_hi": "संदेह होने पर परिवार के किसी सदस्य से पूछें या सीधे बैंक शाखा जाएं।",
                "instruction_mr": "काही शंका असल्यास घरातील तरुणांना सांगा किंवा थेट बँकेच्या शाखेत जाऊन खात्री करा.",
                "tip": "It is always safer to visit the bank branch physically."
            }
        ],
        "safety_tips": [
            {"tip": "Government helpline for reporting cyber fraud in India is 1930 (cybercrime.gov.in).", "tip_hi": "साइबर धोखाधड़ी की रिपोर्ट करने के लिए राष्ट्रीय हेल्पलाइन नंबर 1930 है।", "tip_mr": "सायबर फसवणुकीची तक्रार करण्यासाठी अधिकृत राष्ट्रीय हेल्पलाइन नंबर १९३० आहे."}
        ]
    },
    {
        "category_slug": "safety",
        "title": "How to Identify Suspicious Links in SMS and WhatsApp",
        "title_hi": "एसएमएस और व्हाट्सएप पर संदिग्ध लिंक कैसे पहचानें",
        "title_mr": "SMS आणि व्हॉट्सॲपवरील संशयास्पद लिंक्स कशा ओळखाव्या",
        "description": "Learn how to spot dangerous lottery, electricity bill, and courier delivery message links.",
        "description_hi": "बिजली बिल, लॉटरी या कूरियर के नाम पर आने वाले खतरनाक संदेशों और लिंक से बचें।",
        "description_mr": "वीज बिल, लॉटरी किंवा पार्सलच्या नावावर येणाऱ्या खोट्या मेसेज आणि लिंक्सपासून सावध राहा.",
        "difficulty": "Easy",
        "tags": "links, phishing, safety, sms, scam, virus",
        "steps": [
            {
                "step_number": 1,
                "title": "Look at the Sender Number",
                "instruction": "Official banks and power companies send SMS from titles like 'VK-HDFCBK' or 'AD-SBIINB', NOT from regular 10-digit mobile numbers like +91 98xxx.",
                "instruction_hi": "बैंक आधिकारिक कोड (जैसे HDFCBK) से एसएमएस भेजते हैं, साधारण 10-अंकों वाले मोबाइल नंबर से नहीं।",
                "instruction_mr": "बँका अधिकृत कोडने मेसेज पाठवतात, १० अंकी खाजगी मोबाईल नंबरवरून नाही.",
                "tip": "If a regular mobile number claims your electricity is disconnected, it is fake."
            },
            {
                "step_number": 2,
                "title": "Examine the Web Address (URL)",
                "instruction": "Check the web address carefully. Fake links look like 'bit.ly/sbi-update' or 'sbi-bank-portal.xyz' instead of 'sbi.co.in'.",
                "instruction_hi": "वेबसाइट के पते को ध्यान से देखें। फर्जी पते अजीब और गलत होते हैं।",
                "instruction_mr": "वेबसाईटचे नाव नीट तपासा. संशयास्पद स्पेलिंग असलेल्या लिंक्सवर हात लावू नका.",
                "tip": "Do not touch or click on shortened or weird links."
            },
            {
                "step_number": 3,
                "title": "Delete and Block",
                "instruction": "Tap and hold the message, tap the trash can icon to delete it, and tap 'Block / Report spam'.",
                "instruction_hi": "संदेश को दबाकर रखें और 'Delete' तथा 'Report Spam' पर टैप करें।",
                "instruction_mr": "मेसेज दाबून धरून 'Delete' आणि 'Block' करा.",
                "tip": "Deleting prevents you or your family from accidentally clicking it later."
            }
        ],
        "safety_tips": [
            {"tip": "Never enter your Aadhaar, PAN, or Bank account number on any page opened from an SMS link.", "tip_hi": "एसएमएस के लिंक पर जाकर कभी भी आधार या बैंक विवरण न भरें।", "tip_mr": "मेसेजमधील लिंक उघडून त्यावर आधार किंवा बँक नंबर कधीही भरू नका."}
        ]
    },
    {
        "category_slug": "services",
        "title": "How to Safely Search and Access Government Websites",
        "title_hi": "सरकारी वेबसाइटों को सुरक्षित रूप से कैसे खोजें और उपयोग करें",
        "title_mr": "शासकीय (Government) वेबसाईट सुरक्षितपणे कशा शोधाव्या आणि वापराव्या",
        "description": "Know the official '.gov.in' mark to distinguish real portals from duplicate commercial agents.",
        "description_hi": "फर्जी एजेंट वेबसाइटों से बचने के लिए आधिकारिक '.gov.in' की पहचान सीखें।",
        "description_mr": "दलाल किंवा बनावट वेबसाईट्स टाळण्यासाठी अधिकृत '.gov.in' वेबसाईट कशी ओळखावी ते शिका.",
        "difficulty": "Easy",
        "tags": "government, portals, gov.in, aadhaar, ration, documents",
        "steps": [
            {
                "step_number": 1,
                "title": "Look for '.gov.in' or '.nic.in'",
                "instruction": "Every genuine Indian government website ends with '.gov.in' (e.g. uidai.gov.in, incometax.gov.in).",
                "instruction_hi": "सभी असली सरकारी वेबसाइटों के पते के अंत में '.gov.in' होता है।",
                "instruction_mr": "भारतातील प्रत्येक अधिकृत सरकारी वेबसाईटच्या शेवटी '.gov.in' असते.",
                "tip": "Avoid websites ending in .com, .org, or .xyz when seeking free official services."
            },
            {
                "step_number": 2,
                "title": "Check for Secure Padlock 🔒",
                "instruction": "Look at the top of your web browser bar for a small closed padlock icon 🔒 next to the web address.",
                "instruction_hi": "वेबसाइट के नाम के पास एक बंद ताले का निशान 🔒 देखें।",
                "instruction_mr": "वेबसाईटच्या नावाच्या सुरुवातीला कुलूपाचे चिन्ह 🔒 असल्याची खात्री करा.",
                "tip": "This confirms your connection is secure."
            },
            {
                "step_number": 3,
                "title": "Beware of Charging for Free Forms",
                "instruction": "Government portals provide forms and certificate downloads for free or nominal fixed fees. Avoid private sites charging high service fees.",
                "instruction_hi": "सरकारी पोर्टल पर फॉर्म मुफ्त मिलते हैं। निजी साइटों को भारी शुल्क न दें।",
                "instruction_mr": "सरकारी फॉर्म सहसा मोफत असतात. खासगी दलालांना पैसे देऊ नका.",
                "tip": "Sahayyak AI provides guidance but never charges fees or acts as an official portal."
            }
        ],
        "safety_tips": [
            {"tip": "Download your official Aadhaar (e-Aadhaar) ONLY from uidai.gov.in.", "tip_hi": "अपना ई-आधार केवल uidai.gov.in से ही डाउनलोड करें।", "tip_mr": "आपले ई-आधार फक्त uidai.gov.in वरूनच डाऊनलोड करा."}
        ]
    },
    {
        "category_slug": "services",
        "title": "How to Download Electricity or Utility Bill Online",
        "title_hi": "बिजली या पानी का बिल ऑनलाइन कैसे डाउनलोड करें",
        "title_mr": "लाईट बिल किंवा पाण्याचे बिल ऑनलाइन कसे डाऊनलोड करावे",
        "description": "Download and check your monthly bill directly on your phone without standing in lines.",
        "description_hi": "कतार में खड़े हुए बिना सीधे अपने फोन पर मासिक बिजली बिल देखें और डाउनलोड करें।",
        "description_mr": "रांगेत उभे न राहता थेट मोबाईलवर मासिक वीज बिल तपासा आणि डाऊनलोड करा.",
        "difficulty": "Medium",
        "tags": "electricity, bill, mahadiscom, payment, download",
        "steps": [
            {
                "step_number": 1,
                "title": "Keep Your Consumer Number Ready",
                "instruction": "Find your 9 to 12 digit Consumer Number (Consumer ID) from an old physical paper bill.",
                "instruction_hi": "पुराने बिजली बिल से अपना 9-12 अंकों का उपभोक्ता क्रमांक (Consumer No.) नोट करें।",
                "instruction_mr": "जुन्या छापील बिलावरून तुमचा ग्राहक क्रमांक (Consumer Number) लिहून ठेवा.",
                "tip": "It is printed near the top of your paper bill."
            },
            {
                "step_number": 2,
                "title": "Open Official Power Portal or GPay",
                "instruction": "Open your electricity distribution company portal (or open Google Pay / PhonePe > 'Electricity Bill').",
                "instruction_hi": "बिजली कंपनी का पोर्टल या Google Pay/PhonePe में 'Electricity' विकल्प खोलें।",
                "instruction_mr": "वीज कंपनीचे पोर्टल किंवा Google Pay/PhonePe मधील 'Electricity' पर्याय उघडा.",
                "tip": "Payment apps remember your consumer number automatically every month."
            },
            {
                "step_number": 3,
                "title": "Enter Consumer Number",
                "instruction": "Select your electricity provider (e.g. Mahavitaran/MSEDCL, Adani, Tata Power, BSES) and type your Consumer ID.",
                "instruction_hi": "अपनी बिजली प्रदाता कंपनी चुनें और उपभोक्ता क्रमांक दर्ज करें।",
                "instruction_mr": "तुमची वीज कंपनी निवडा आणि ग्राहक क्रमांक टाका.",
                "tip": "Your consumer name will automatically appear."
            },
            {
                "step_number": 4,
                "title": "View & Save PDF Receipt",
                "instruction": "Your current due amount will be shown. Tap 'View Bill' or 'Download Bill' to save the PDF on your phone.",
                "instruction_hi": "'View Bill' पर टैप करें और अपने फोन में बिल का पीडीएफ सहेजें।",
                "instruction_mr": "'View Bill' वर टॅप करून बिलाची PDF फोनमध्ये सेव्ह करा.",
                "tip": "You can print it or keep it safely in your phone's files."
            }
        ],
        "safety_tips": [
            {"tip": "Ignore any SMS stating 'Power will be cut tonight at 9:30 PM due to unpaid bill'. This is a notorious scam.", "tip_hi": "बिल न भरने पर आज रात बिजली कटने वाले फर्जी एसएमएस से सावधान रहें।", "tip_mr": "'बिल न भरल्याने आज रात्री वीज पुरवठा खंडित होईल' अशा खोट्या मेसेजवर विश्वास ठेवू नका."}
        ]
    },
    {
        "category_slug": "smartphone",
        "title": "How to Install an App from Google Play Store",
        "title_hi": "गूगल प्ले स्टोर से नया ऐप कैसे इंस्टॉल करें",
        "title_mr": "गुगल प्ले स्टोअरवरून नवीन ॲप कसे इन्स्टॉल करावे",
        "description": "Safely download verified applications like news, games, or prayer apps on your phone.",
        "description_hi": "अपने फोन पर समाचार, भजन या खेल जैसे सुरक्षित ऐप आसानी से डाउनलोड करें।",
        "description_mr": "मोबाईलवर बातम्या, भजन किंवा खेळांचे सुरक्षित ॲप्स डाऊनलोड करा.",
        "difficulty": "Easy",
        "tags": "play store, install, download, app, smartphone",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Google Play Store",
                "instruction": "Tap the Play Store app icon (looks like a colorful triangle ▶️ on a white background).",
                "instruction_hi": "प्ले स्टोर (रंगीन त्रिकोण ▶️) ऐप आइकन पर टैप करें।",
                "instruction_mr": "Play Store (रंगीबेरंगी त्रिकोण ▶️) ॲप उघडा.",
                "tip": "Google Play Store verifies all apps for safety."
            },
            {
                "step_number": 2,
                "title": "Tap Search Bar at Top",
                "instruction": "Tap the search bar at the very top of the screen and type the app name (or tap the microphone 🎙️ to say it).",
                "instruction_hi": "ऊपर सर्च बार पर टैप करें और ऐप का नाम लिखें या बोलें।",
                "instruction_mr": "वरच्या सर्च बारवर टॅप करा आणि ॲपचे नाव टाईप करा किंवा बोला.",
                "tip": "You can use your voice to search in Hindi or Marathi too!"
            },
            {
                "step_number": 3,
                "title": "Check App Name & Publisher",
                "instruction": "Check that the developer name is authentic and has good star reviews (e.g. 4.2 stars).",
                "instruction_hi": "जांचें कि ऐप विश्वसनीय है और उसके अच्छे रिव्यू हैं।",
                "instruction_mr": "ॲप अधिकृत आहे आणि त्याला चांगले रिव्ह्यूज आहेत याची खात्री करा.",
                "tip": "Look at the total downloads (e.g. 10M+ or 100M+)."
            },
            {
                "step_number": 4,
                "title": "Tap the Green 'Install' Button",
                "instruction": "Tap the green 'Install' button. Wait until it shows 100% and changes to 'Open'.",
                "instruction_hi": "हरे 'Install' बटन पर टैप करें और डाउनलोड पूरा होने की प्रतीक्षा करें।",
                "instruction_mr": "हिरव्या 'Install' बटनावर टॅप करा. १००% झाल्यावर 'Open' चे बटण येईल.",
                "tip": "The app will now appear on your phone screen."
            }
        ],
        "safety_tips": [
            {"tip": "Never install apps sent as file links (.apk) from WhatsApp or telegram strangers.", "tip_hi": "व्हाट्सएप पर अनजान लोगों द्वारा भेजे गए .apk ऐप कभी इंस्टॉल न करें।", "tip_mr": "व्हॉट्सॲपवर अनोळखी व्यक्तींनी पाठवलेल्या .apk फाईल्स कधीही इन्स्टॉल करू नका."}
        ]
    },
    {
        "category_slug": "smartphone",
        "title": "How to Update Apps to Keep Your Phone Fast & Secure",
        "title_hi": "फोन को सुरक्षित और तेज रखने के लिए ऐप्स को कैसे अपडेट करें",
        "title_mr": "मोबाईल सुरक्षित आणि वेगवान ठेवण्यासाठी ॲप्स कसे अपडेट करावे",
        "description": "Keep WhatsApp, banking, and phone apps up to date with the latest features and bug fixes.",
        "description_hi": "व्हाट्सएप और पेमेंट ऐप्स को नई सुविधाओं और सुरक्षा के साथ अपडेट रखें।",
        "description_mr": "व्हॉट्सॲप आणि बँकिंग ॲप्सना नवीन सुरक्षा सुधारणांसाठी अपडेट ठेवा.",
        "difficulty": "Easy",
        "tags": "update, play store, apps, security, speed",
        "steps": [
            {
                "step_number": 1,
                "title": "Open Google Play Store",
                "instruction": "Open the Google Play Store app on your phone.",
                "instruction_hi": "अपने फोन पर गूगल प्ले स्टोर खोलें।",
                "instruction_mr": "फोनवरील Google Play Store उघडा.",
                "tip": "Ensure you are connected to home Wi-Fi to save data."
            },
            {
                "step_number": 2,
                "title": "Tap Your Profile Picture at Top Right",
                "instruction": "Look at the very top right corner for your small circle profile icon or initial letter and tap it.",
                "instruction_hi": "ऊपर दाईं ओर अपने गोल प्रोफाइल आइकन पर टैप करें।",
                "instruction_mr": "वर उजव्या कोपऱ्यातील तुमच्या प्रोफाइलच्या गोल चिन्हावर टॅप करा.",
                "tip": "A menu will slide open."
            },
            {
                "step_number": 3,
                "title": "Tap 'Manage apps & device'",
                "instruction": "Tap the first option called 'Manage apps & device'.",
                "instruction_hi": "'Manage apps & device' (ऐप्स और डिवाइस प्रबंधित करें) पर टैप करें।",
                "instruction_mr": "'Manage apps & device' पर्यायावर टॅप करा.",
                "tip": "You will see a summary of available updates."
            },
            {
                "step_number": 4,
                "title": "Tap 'Update all'",
                "instruction": "Tap the 'Update all' button to automatically update all your installed apps.",
                "instruction_hi": "'Update all' (सभी अपडेट करें) बटन पर टैप करें।",
                "instruction_mr": "'Update all' वर टॅप करा. सर्व ॲप्स आपोआप अपडेट होतील.",
                "tip": "Your phone will do all the work in the background."
            }
        ],
        "safety_tips": [
            {"tip": "Updating regularly fixes security vulnerabilities that hackers could exploit.", "tip_hi": "नियमित अपडेट करने से सुरक्षा कमजोरियां ठीक होती हैं।", "tip_mr": "नियमित अपडेट केल्याने फोन हॅकर्सपासून सुरक्षित राहतो."}
        ]
    }
]

def seed_database():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Seed categories
        cat_map = {}
        for cat_data in CATEGORIES_DATA:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
                db.commit()
                db.refresh(cat)
                cat_map[cat.slug] = cat.id
                logger.info(f"Created category: {cat.name}")
            else:
                cat_map[existing.slug] = existing.id

        # Seed guides
        for g_data in GUIDES_DATA:
            cat_slug = g_data["category_slug"]
            cat_id = cat_map.get(cat_slug)
            if not cat_id:
                continue

            existing_guide = db.query(Guide).filter(Guide.title == g_data["title"]).first()
            if not existing_guide:
                guide = Guide(
                    category_id=cat_id,
                    title=g_data["title"],
                    title_hi=g_data.get("title_hi"),
                    title_mr=g_data.get("title_mr"),
                    description=g_data["description"],
                    description_hi=g_data.get("description_hi"),
                    description_mr=g_data.get("description_mr"),
                    difficulty=g_data.get("difficulty", "Easy"),
                    tags=g_data.get("tags", ""),
                    steps_json=json.dumps(g_data["steps"]),
                    safety_tips_json=json.dumps(g_data.get("safety_tips", []))
                )
                db.add(guide)
                db.commit()
                logger.info(f"Created guide: {g_data['title']}")

        # Seed default admin and demo user
        admin_email = "admin@sahayyak.ai"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                name="Sahayyak Admin",
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                preferred_language="en",
                text_size="normal",
                is_admin=True
            )
            db.add(admin)
            db.commit()
            logger.info("Default admin user created (admin@sahayyak.ai / admin123)")

        demo_email = "demo@sahayyak.ai"
        if not db.query(User).filter(User.email == demo_email).first():
            demo = User(
                name="Savitri Sharma",
                email=demo_email,
                password_hash=get_password_hash("demo123"),
                preferred_language="hi",
                text_size="large",
                is_admin=False
            )
            db.add(demo)
            db.commit()
            logger.info("Default demo user created (demo@sahayyak.ai / demo123)")

        logger.info("Database seeding finished successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
