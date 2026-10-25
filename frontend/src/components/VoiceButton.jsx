import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function VoiceButton({ onTranscript, className = "" }) {
  const { language, t } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const getLangCode = () => {
    return language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
  };

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLangCode();

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
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
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language, onTranscript]);

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    // Request audio stream permission first (triggers browser/WebView permission prompt if not yet granted)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release immediately once permission is established
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn('Microphone permission request:', err);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = getLangCode();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start notice:', err);
        setIsListening(false);
      }
    } else {
      alert("Microphone voice input is not supported in this browser/device.");
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={isListening ? "Listening... Tap to stop" : "Speak your question using microphone"}
      title={isListening ? "Listening... Tap to stop" : "Tap to speak your question"}
      className={`relative inline-flex items-center justify-center p-3 rounded-full transition-all duration-300 cursor-pointer ${
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
