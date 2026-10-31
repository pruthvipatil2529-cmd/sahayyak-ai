import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function TextToSpeech({ text, label = null, iconOnly = false, className = "" }) {
  const { language, t } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const cleanSpokenText = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/[*_#`~>]/g, '')
      .replace(/Step \d+:/gi, '')
      .trim();
  };

  useEffect(() => {
    // Listen for native Android TTS callbacks
    const handleNativeStart = () => setIsSpeaking(true);
    const handleNativeDone = () => setIsSpeaking(false);

    window.onAndroidTTSStart = handleNativeStart;
    window.onAndroidTTSDone = handleNativeDone;

    return () => {
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    // 1. Native Android TTS
    if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') {
      try {
        window.AndroidTTS.stop();
      } catch (e) {
        console.warn('Native TTS stop error:', e);
      }
    }

    // 2. Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Web speech cancel error:', e);
      }
    }

    // 3. HTML5 Audio fallback
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.warn('Audio fallback pause error:', e);
      }
      audioRef.current = null;
    }

    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const clean = cleanSpokenText(text);
    if (!clean) return;

    const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

    // Tier 1: Check Native Android TTS Bridge (in Capacitor WebView)
    if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      try {
        setIsSpeaking(true);
        window.AndroidTTS.speak(clean, langCode);
        return;
      } catch (e) {
        console.warn('Native Android TTS error, attempting fallback:', e);
      }
    }

    // Tier 2: Standard Web Speech API (for desktop browsers like Chrome / Safari / Edge)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = langCode;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }

    // Tier 3: HTML5 Audio streaming fallback (Translate TTS)
    try {
      const shortText = clean.length > 200 ? clean.substring(0, 197) + '...' : clean;
      const ttsLang = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(shortText)}`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = (err) => {
        console.warn('Fallback audio playback failed:', err);
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.play().catch((playErr) => {
        console.warn('Audio play() promise rejected:', playErr);
        setIsSpeaking(false);
      });
    } catch (e) {
      console.warn('Audio element error:', e);
      setIsSpeaking(false);
    }
  };

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
