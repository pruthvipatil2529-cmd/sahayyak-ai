import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function VoiceButton({ onTranscript, className = "" }) {
  const { language, t } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set recognition language based on app language
    if (language === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (language === 'mr') {
      recognition.lang = 'mr-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. You can still type your questions easily!");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={isListening ? "Listening... Tap to stop" : "Speak your question using microphone"}
      title={isListening ? "Listening... Tap to stop" : "Tap to speak your question"}
      className={`relative inline-flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
        isListening
          ? 'bg-rose-600 text-white mic-recording shadow-lg shadow-rose-500/50 scale-105'
          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:scale-105 active:scale-95'
      } ${className}`}
    >
      {isListening ? (
        <>
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="sr-only">Listening... speak now</span>
        </>
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
}
