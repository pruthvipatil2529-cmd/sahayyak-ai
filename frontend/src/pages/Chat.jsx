import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, Sparkles, AlertTriangle, Trash2, PlusCircle, CheckCircle2,
  Bot, User, ArrowRight, ShieldCheck, HelpCircle
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

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle URL query parameter if user navigated with speech input
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      handleSendMessage(query);
      setSearchParams({});
    }
  }, [searchParams]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build brief history
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
          content: 'I had a little trouble connecting right now, but please do not worry. You can also explore our step-by-step Guides Library from the top menu.',
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('appName')} Assistant</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Ready to help" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Patient, step-by-step guidance. Ask anything freely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>{t('clearChat')}</span>
          </button>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('suggestedPrompts')}:
        </span>
        <div className="flex flex-wrap gap-2">
          {prompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              className="text-left text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-800 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition shadow-sm font-medium"
            >
              💬 {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="space-y-5 min-h-[380px] bg-slate-50/50 dark:bg-slate-950/30 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex gap-3 sm:gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <Bot className="w-6 h-6" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-5 shadow-sm space-y-4 ${
                  isAssistant
                    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    : 'bg-teal-600 text-white rounded-br-sm'
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

                {/* Structured Step Cards */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="pt-2 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-xs sm:text-sm text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        Step-by-Step Instructions
                      </h4>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {msg.steps.length} {msg.steps.length === 1 ? 'Step' : 'Steps'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {msg.steps.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/20 dark:from-slate-800/80 dark:to-teal-950/20 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                              {s.step || sIdx + 1}
                            </span>
                            <p className="text-slate-900 dark:text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
                              {s.text}
                            </p>
                          </div>
                          <div className="flex items-center justify-end sm:justify-start pt-1 sm:pt-0 pl-11 sm:pl-0 flex-shrink-0">
                            <TextToSpeech
                              text={s.text}
                              label={t('listen')}
                              className="font-semibold text-xs sm:text-sm px-3.5 py-2 shadow-xs"
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
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
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
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-fit">
            <Bot className="w-6 h-6 text-teal-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sahayyak AI is preparing simple instructions for you...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-teal-500 rounded-3xl p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 transition"
      >
        <VoiceButton
          onTranscript={(text) => handleSendMessage(text)}
          className="flex-shrink-0"
        />

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={t('chatPlaceholder')}
          disabled={loading}
          className="flex-1 px-3 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base sm:text-lg"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          aria-label="Send question"
          className="p-3 sm:px-6 sm:py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold transition flex items-center gap-2 shadow-md shadow-teal-600/20"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
