import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function TextToSpeech({ text, label = null, className = "" }) {
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

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={isSpeaking ? t('stopListening') : (label || t('listen'))}
      title={isSpeaking ? t('stopListening') : (label || t('listen'))}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isSpeaking
          ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow'
          : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>{t('stopListening')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{label || t('listen')}</span>
        </>
      )}
    </button>
  );
}
