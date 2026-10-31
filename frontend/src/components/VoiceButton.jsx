import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertCircle, X } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function VoiceButton({ 
  onTranscript, 
  onListeningChange = null,
  className = "",
  size = "md" // "sm" | "md" | "lg"
}) {
  const { language, t } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  const getLangCode = (lang) => {
    if (lang === 'hi') return 'hi-IN';
    if (lang === 'mr') return 'mr-IN';
    return 'en-IN';
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Sync listening status with parent
  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  const startRecognition = () => {
    const SpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setErrorMessage(t('voiceNotSupported') || "Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or a mobile browser.");
      return;
    }

    setErrorMessage(null);
    isManuallyStoppedRef.current = false;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = getLangCode(language);

      let accumulatedFinal = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcriptChunk;
          } else {
            interim += transcriptChunk;
          }
        }

        const combined = accumulatedFinal + (interim ? (accumulatedFinal ? ' ' : '') + interim : '');
        if (combined && onTranscript) {
          onTranscript(combined, false);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t('voicePermissionDenied') || "Microphone permission is required. Please allow microphone access in your browser settings.");
        } else if (event.error === 'no-speech') {
          // If no speech, notify gently
          setErrorMessage(t('voiceNoSpeech') || "No voice detected. Please speak closer to your microphone.");
        } else if (event.error === 'network') {
          setErrorMessage("Network error. Please check your internet connection.");
        } else if (event.error !== 'aborted') {
          setErrorMessage("Could not capture speech. Please try tapping the microphone again.");
        }

        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Dispatch final accumulated transcript if available
        if (accumulatedFinal && onTranscript) {
          onTranscript(accumulatedFinal, true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
      setErrorMessage(t('voicePermissionDenied') || "Could not start microphone. Please check permissions.");
    }
  };

  const stopRecognition = () => {
    isManuallyStoppedRef.current = true;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        try {
          recognitionRef.current.abort();
        } catch (err) {}
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5 sm:w-6 sm:h-6",
    lg: "w-7 h-7"
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? t('voiceStop') : t('speakButton')}
        title={isListening ? t('voiceStop') : t('speakButton')}
        aria-pressed={isListening}
        className={`relative inline-flex items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer shadow-sm select-none ${
          isListening
            ? 'bg-rose-600 text-white mic-recording shadow-lg shadow-rose-500/40 ring-4 ring-rose-400/40 scale-105'
            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 hover:scale-105 active:scale-95'
        } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      >
        {isListening ? (
          <>
            <Mic className={`${iconSizes[size] || iconSizes.md} animate-pulse`} />
            <span className="sr-only">{t('voiceListening')}</span>
          </>
        ) : (
          <Mic className={iconSizes[size] || iconSizes.md} />
        )}
      </button>

      {/* Floating Error Tooltip if permissions or mic issue occurs */}
      {errorMessage && (
        <div 
          role="alert"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-72 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-2xl shadow-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="flex-1 font-medium leading-relaxed">{errorMessage}</p>
          <button 
            type="button"
            onClick={() => setErrorMessage(null)} 
            aria-label="Dismiss message"
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
