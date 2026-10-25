import React from 'react';
import { 
  ShieldAlert, PhoneCall, AlertTriangle, CheckCircle2, XCircle, 
  Lock, KeyRound, Smartphone, ExternalLink, Volume2
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import TextToSpeech from '../components/TextToSpeech';

export default function SafetyHub() {
  const { t } = useAccessibility();

  const NEVER_SHARE = [
    { name: "UPI PIN (6 or 4 digits)", reason: "Used ONLY to deduct money from your account. Never needed to receive money." },
    { name: "SMS OTP (One Time Password)", reason: "Enables hackers to drain your bank account or take over WhatsApp." },
    { name: "ATM Card PIN", reason: "Secret card key. Banks will never ask for this over phone calls." },
    { name: "CVV (3 digits on back of card)", reason: "Allows unauthorized online payments." },
    { name: "Passwords & NetBanking Details", reason: "Keep confidential even from callers claiming to be bank managers." }
  ];

  const SCAM_PATTERNS = [
    {
      title: "1. The Electricity Disconnection Panic",
      threat: "Caller/SMS says: 'Pay Rs 100 right now or power will be cut in 1 hour!'",
      solution: "Electricity boards never disconnect power within 1 hour or ask for payments to personal UPI numbers. Hang up immediately.",
      safeAction: "Pay only via official electricity portals or trusted bill apps."
    },
    {
      title: "2. The Fake Customer Care Search Scam",
      threat: "You search Google for airline, courier or bank customer care and call the top number.",
      solution: "Fraudsters put their own phone numbers as fake customer care listings on Google Maps.",
      safeAction: "Always check the telephone number printed on the back of your debit card or your official bank passbook."
    },
    {
      title: "3. The Remote App Screen-Sharing Trap",
      threat: "Caller says: 'Download AnyDesk or QuickSupport so I can fix your phone.'",
      solution: "These applications allow the caller to see your screen and copy your OTP as it arrives.",
      safeAction: "Never install screen-sharing apps on the advice of any telephone caller."
    },
    {
      title: "4. The 'Enter PIN to Receive Money' Trick",
      threat: "Buyer sends QR code saying 'Scan and enter PIN to collect Rs 5,000 for your used item.'",
      solution: "Golden Rule: You NEVER enter your UPI PIN to receive money. PIN is solely for paying out.",
      safeAction: "If a buyer wants to pay you, they only need your mobile number. No PIN ever."
    }
  ];

  const fullSafetyText = `Elder Safety and Fraud Protection Shield. Golden rule: Never share your OTP, UPI PIN, ATM PIN, or passwords with anyone. To receive money on UPI, you never need to enter a PIN. If you face cyber fraud, call the National Cyber Helpline at 1930 immediately.`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Title & Helplines */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency Protection Portal</span>
          </div>

          <TextToSpeech text={fullSafetyText} label="Listen to Safety Overview" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t('emergencyHubTitle')}
          </h1>
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
            {t('emergencyHubDesc')}
          </p>
        </div>

        {/* National Emergency Hotline Banner */}
        <div className="p-5 rounded-2xl bg-rose-600/30 border-2 border-rose-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 rounded-xl">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-300">
                Official Indian Cyber Helpline
              </span>
              <h3 className="text-2xl font-black text-white">Call 1930</h3>
              <p className="text-sm text-slate-200">Free 24x7 Government Helpline (cybercrime.gov.in)</p>
            </div>
          </div>
          <a
            href="tel:1930"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-rose-700 font-extrabold text-base transition shadow"
          >
            Dial 1930 Now
          </a>
        </div>
      </div>

      {/* The 5 Secrets to Never Share */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            5 Things You Must NEVER Share
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Even if someone calls saying they are your bank manager, branch head, or government officer:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {NEVER_SHARE.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-950/80 rounded-2xl p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-lg">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed pl-8">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Breakdown of Common Scams */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            4 Common Tricks Fraudsters Use
          </h2>
        </div>

        <div className="space-y-4">
          {SCAM_PATTERNS.map((scam, sIdx) => (
            <div
              key={sIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {scam.title}
              </h3>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                <strong>What they say:</strong> {scam.threat}
              </div>

              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                  <strong>The Reality:</strong> {scam.solution}
                </p>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm sm:text-base pt-1">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><strong>Safe Action:</strong> {scam.safeAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
