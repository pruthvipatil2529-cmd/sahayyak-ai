import React, { useState } from 'react';
import { 
  Search, Copy, Check, ExternalLink,
  Wifi, Settings, Phone, Camera, ShieldCheck, Sparkles, Mic
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

// Recognizable Brand SVGs (Requirement 7)
export const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 0C5.394 0 0 5.394 0 12.031c0 2.122.553 4.188 1.603 6.009L0 24l6.147-1.612a12.008 12.008 0 0 0 5.884 1.528h.005c6.632 0 12.026-5.394 12.026-12.031 0-3.216-1.253-6.238-3.528-8.513C18.264 1.253 15.247 0 12.031 0zm0 22.019h-.004c-1.802 0-3.57-.484-5.113-1.4l-.367-.218-3.801.996 1.015-3.705-.239-.38a9.99 9.99 0 0 1-1.536-5.281c0-5.526 4.49-10.021 10.045-10.021 2.68 0 5.198 1.045 7.091 2.94a9.98 9.98 0 0 1 2.935 7.086c0 5.531-4.495 10.023-10.031 10.023z"/>
  </svg>
);

export const YouTubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const WikipediaIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.09 13.118l2.373-6.732h1.797l-3.245 8.647h-1.583L9.08 8.878l-2.35 6.155H5.147L1.9 6.386h1.797l2.28 6.732 2.18-5.697h1.637l2.296 5.697zm8.41-6.732l-3.324 8.647h-1.666l3.324-8.647h1.666z"/>
  </svg>
);

// Helper to render inline markdown like **bold**, *italic*, and `code`
export function FormattedText({ text, className = "" }) {
  if (!text) return null;

  // Split by newlines to preserve paragraphs cleanly
  const paragraphs = text.split(/\n+/).filter(Boolean);

  const renderInline = (str) => {
    // Regex matches **bold**, *italic*, or `code`
    const parts = [];
    let lastIdx = 0;
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-teal-900 dark:text-teal-200">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-800 dark:text-slate-200">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-mono text-sm">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div className={`space-y-2 break-words leading-relaxed ${className}`}>
      {paragraphs.map((p, pIdx) => (
        <p key={pIdx} className="text-base sm:text-lg">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

// Helper to detect specific icons for individual steps
export function getStepIcon(stepText = "") {
  const lower = stepText.toLowerCase();
  if (lower.includes('whatsapp') || lower.includes('व्हॉट्सॲप') || lower.includes('व्हाट्सएप')) {
    return { icon: WhatsAppIcon, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' };
  }
  if (lower.includes('setting') || lower.includes('gear') || lower.includes('चक्र') || lower.includes('गियर')) {
    return { icon: Settings, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
  }
  if (lower.includes('search') || lower.includes('magnifying') || lower.includes('खोज') || lower.includes('शोधा')) {
    return { icon: Search, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' };
  }
  if (lower.includes('photo') || lower.includes('camera') || lower.includes('gallery') || lower.includes('गैलरी') || lower.includes('फोटो')) {
    return { icon: Camera, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' };
  }
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('वाय-फाय') || lower.includes('नेटवर्क')) {
    return { icon: Wifi, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' };
  }
  if (lower.includes('call') || lower.includes('phone') || lower.includes('कॉल') || lower.includes('फोन')) {
    return { icon: Phone, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60' };
  }
  if (lower.includes('upi') || lower.includes('pin') || lower.includes('otp') || lower.includes('bank') || lower.includes('पैसे')) {
    return { icon: ShieldCheck, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' };
  }
  if (lower.includes('mic') || lower.includes('speak') || lower.includes('voice') || lower.includes('आवाज़') || lower.includes('आवाज')) {
    return { icon: Mic, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' };
  }
  return null;
}

// Topic Badge & Interactive Actions Component
export function TopicBadgeAndActions({ topic = "general", queryText = "", steps = [] }) {
  const { language, t } = useAccessibility();
  const [copied, setCopied] = useState(false);

  const cleanQuery = queryText ? encodeURIComponent(queryText) : '';
  const langSubdomain = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';

  const topicConfig = {
    whatsapp: {
      label: 'WhatsApp Topic',
      icon: WhatsAppIcon,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800',
    },
    wifi: {
      label: 'Wi-Fi & Internet',
      icon: Wifi,
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300/60 dark:border-blue-800',
    },
    upi: {
      label: 'UPI Payment Safety',
      icon: ShieldCheck,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-800',
    },
    youtube: {
      label: 'YouTube Videos',
      icon: YouTubeIcon,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300/60 dark:border-rose-800',
    },
    wikipedia: {
      label: 'Wikipedia Encyclopedia',
      icon: WikipediaIcon,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-800',
    },
    google: {
      label: 'Google Web Search',
      icon: Search,
      badgeColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300/60 dark:border-sky-800',
    },
    settings: {
      label: 'Phone Settings',
      icon: Settings,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
    },
    phone: {
      label: 'Phone & Calling',
      icon: Phone,
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300/60 dark:border-teal-800',
    },
    camera: {
      label: 'Camera & Photos',
      icon: Camera,
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300/60 dark:border-purple-800',
    },
    general: {
      label: 'Technology Guide',
      icon: Sparkles,
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300/60 dark:border-teal-800',
    }
  };

  const activeTopic = topicConfig[topic] || topicConfig.general;
  const ActiveIcon = activeTopic.icon;

  const handleCopySteps = async () => {
    let copyText = "";
    if (steps && steps.length > 0) {
      copyText = steps.map((s, idx) => `${idx + 1}. ${s.text || s}`).join("\n\n");
    } else if (queryText) {
      copyText = queryText;
    }

    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.warn('Copy failed:', e);
      }
    }
  };

  const handleShareWhatsApp = () => {
    let shareText = `*Sahayyak AI – Your Technology Guide*\n\n`;
    if (steps && steps.length > 0) {
      shareText += steps.map((s, idx) => `Step ${idx + 1}: ${s.text || s}`).join("\n\n");
    } else {
      shareText += queryText;
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Top Topic Indicator Badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${activeTopic.badgeColor}`}>
          <ActiveIcon className="w-3.5 h-3.5" />
          <span>{activeTopic.label}</span>
        </span>
      </div>

      {/* Helpful Interactive Action Buttons (Requirement 6 & 7) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          title={t('shareWhatsApp')}
          aria-label={t('shareWhatsApp')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('shareWhatsApp')}</span>
        </button>

        {/* Google Search Button */}
        {cleanQuery && (
          <a
            href={`https://www.google.com/search?q=${cleanQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t('searchGoogle')}
            aria-label={t('searchGoogle')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition"
          >
            <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{t('searchGoogle')}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}

        {/* Wikipedia Read Button */}
        {cleanQuery && (
          <a
            href={`https://${langSubdomain}.wikipedia.org/wiki/Special:Search?search=${cleanQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t('searchWikipedia')}
            aria-label={t('searchWikipedia')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
          >
            <WikipediaIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('searchWikipedia')}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}

        {/* YouTube Watch Button */}
        {cleanQuery && (
          <a
            href={`https://www.youtube.com/results?search_query=${cleanQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t('watchYouTube')}
            aria-label={t('watchYouTube')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
          >
            <YouTubeIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t('watchYouTube')}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}

        {/* Copy Steps Button */}
        {steps && steps.length > 0 && (
          <button
            type="button"
            onClick={handleCopySteps}
            title={t('copySteps')}
            aria-label={t('copySteps')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">{t('copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('copySteps')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
