import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Send, Sparkles, Trash2, Bot, User, ShieldCheck, 
  ArrowLeft, RotateCcw, Lightbulb, Compass
} from 'lucide-react';
import { aiAPI } from '../api';
import { useAccessibility } from '../context/AccessibilityContext';
import VoiceButton from '../components/VoiceButton';
import TextToSpeech from '../components/TextToSpeech';

const SUGGESTED_QUESTIONS = {
  en: [
    "How do I send a photo on WhatsApp?",
    "How do I connect to Wi-Fi at home?",
    "How to use UPI safely without getting scammed?",
    "How do I increase text size on my phone?",
    "How to make a WhatsApp video call to my family?"
  ],
  hi: [
    "व्हाट्सएप पर फोटो कैसे भेजें?",
    "घर पर वाई-फाई (Wi-Fi) से कैसे कनेक्ट करें?",
    "धोखाधड़ी से बचकर UPI का सुरक्षित उपयोग कैसे करें?",
    "फोन में अक्षरों का आकार कैसे बड़ा करें?",
    "परिवार से व्हाट्सएप पर वीडियो कॉल कैसे करें?"
  ],
  mr: [
    "व्हॉट्सॲपवर फोटो कसा पाठवावा?",
    "घरातील वाय-फाय (Wi-Fi) शी फोन कसा जोडावा?",
    "फसवणूक टाळून UPI चा सुरक्षित वापर कसा करावा?",
    "मोबाईलमधील अक्षरांचा आकार कसा वाढवावा?",
    "मुलांशी व्हॉट्सॲपवर व्हिडिओ कॉल कसा करावा?"
  ]
};

export default function Chat() {
  const { language, t } = useAccessibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chatWelcome'),
      steps: [],
      safety_warning: null,
      related_guides: []
    }
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle URL query parameter if user navigated with voice or search
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      handleSendMessage(query);
      setSearchParams({});
    }
  }, [searchParams]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiAPI.chat(
        query.trim(),
        language,
        conversationId,
        historyPayload
      );

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        steps: response.steps || [],
        safety_warning: response.safety_warning,
        related_guides: response.related_guides || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had a little trouble connecting right now, but please do not worry. You can also explore our step-by-step Guides Library anytime.',
          steps: [],
          safety_warning: null,
          related_guides: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: t('chatWelcome'),
        steps: [],
        safety_warning: null,
        related_guides: [],
      },
    ]);
    setConversationId(null);
  };

  const prompts = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-slate-50 dark:bg-slate-950">
      {/* Top Gemini-Style Header */}
      <header className="flex-shrink-0 px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to Home"
            title="Back to Home"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-amber-400 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  {t('appName')}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Patient, step-by-step assistant for everyday smartphone tasks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleClearChat}
            aria-label={t('clearChat')}
            title={t('clearChat')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t('clearChat')}</span>
          </button>
        </div>
      </header>

      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Gemini-Style Welcome & Prompts when only welcome message is present */}
        {messages.length === 1 && (
          <div className="space-y-4 my-2">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent border border-teal-500/20">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>How can I help you today?</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Ask any question simply in your own words, or tap on any common question below to get clear, step-by-step guidance.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                {t('suggestedPrompts')}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(promptText)}
                    className="text-left text-xs sm:text-sm p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-800 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition shadow-sm font-medium flex items-center justify-between gap-2 group"
                  >
                    <span>{promptText}</span>
                    <span className="text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={index}
              className={`flex gap-3 sm:gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-2xl rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 ${
                  isAssistant
                    ? 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                    : 'bg-teal-600 text-white rounded-br-sm ml-auto'
                }`}
              >
                {/* Safety Warning Interception Alert */}
                {msg.safety_warning && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{msg.safety_warning}</p>
                  </div>
                )}

                {/* Main Message Text (Warm intro/conversational text) */}
                {msg.content && (
                  <div className="whitespace-pre-line text-base sm:text-lg leading-relaxed font-normal text-slate-800 dark:text-slate-100">
                    {msg.content}
                  </div>
                )}

                {/* Structured Step Cards (PRD Section 10) */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="pt-2 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-xs sm:text-sm text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        Step-by-Step Instructions
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                        {msg.steps.length} {msg.steps.length === 1 ? 'Step' : 'Steps'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {msg.steps.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/20 dark:from-slate-800/80 dark:to-teal-950/20 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-teal-400 dark:hover:border-teal-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                              {s.step || sIdx + 1}
                            </span>
                            <p className="text-slate-900 dark:text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
                              {s.text}
                            </p>
                          </div>
                          
                          {/* Prominent Listen Button for each step */}
                          <div className="flex items-center justify-end sm:justify-start pt-1 sm:pt-0 pl-11 sm:pl-0 flex-shrink-0">
                            <TextToSpeech
                              text={s.text}
                              label={t('listen')}
                              className="font-bold text-xs sm:text-sm px-3.5 py-2 shadow-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Readout Toolbar for Assistant */}
                {isAssistant && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Need the full answer read aloud?
                    </span>
                    <TextToSpeech
                      text={
                        msg.steps && msg.steps.length > 0
                          ? `${msg.content ? msg.content + '. ' : ''}${msg.steps.map((s) => `Step ${s.step}: ${s.text}`).join('. ')}`
                          : msg.content
                      }
                      label={t('listen')}
                    />
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-fit shadow-sm">
            <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sahayyak AI is preparing simple instructions for you...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Gemini-Style Locked Bottom Input Bar */}
      <footer className="flex-shrink-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative max-w-3xl mx-auto flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 rounded-3xl p-2 transition shadow-sm"
        >
          {/* Voice Input Button */}
          <div className="flex-shrink-0 pb-0.5">
            <VoiceButton
              onTranscript={(text) => handleSendMessage(text)}
              className="p-2.5 sm:p-3"
            />
          </div>

          {/* Multiline capable textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t('chatPlaceholder')}
            disabled={loading}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base resize-none py-2 px-1 max-h-28 overflow-y-auto leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            aria-label="Send message"
            className="flex-shrink-0 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Send</span>
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
          Sahayyak AI guides you step-by-step. Never share your bank passwords or OTPs with anyone.
        </p>
      </footer>
    </div>
  );
}
