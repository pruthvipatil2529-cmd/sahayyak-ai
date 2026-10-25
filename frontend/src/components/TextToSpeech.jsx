import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function TextToSpeech({ text, label = null, iconOnly = false, className = "" }) {
  const { language, t } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const handleSpeak = () => {
    if (!isSupported) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    const cleanText = text.replace(/[*_#`]/g, ''); // strip markdown characters for natural speech
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set utterance language and speed
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // A comfortable, slightly calmer pace for seniors
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  const displayLabel = label !== null ? label : t('listen');
  const showText = !iconOnly && Boolean(displayLabel);

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={isSpeaking ? t('stopListening') : (displayLabel || t('listen'))}
      title={isSpeaking ? t('stopListening') : (displayLabel || t('listen'))}
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
        isSpeaking
          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
          : 'bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:hover:bg-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-700/80 hover:shadow-sm'
      } ${
        iconOnly
          ? 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0'
          : 'px-3 py-1.5 rounded-xl font-medium text-sm'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
          {showText && <span className="font-semibold text-xs sm:text-sm">{t('stopListening')}</span>}
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 dark:text-teal-300" />
          {showText && <span className="text-xs sm:text-sm font-semibold">{displayLabel}</span>}
        </>
      )}
    </button>
  );
}
