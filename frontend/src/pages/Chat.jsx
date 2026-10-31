import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Send, Sparkles, Trash2, Bot, User, ShieldCheck, 
  ArrowLeft, Lightbulb, Globe, BookOpen, ChevronRight,
  MessageCircle, Wifi, Settings, Phone, ArrowRight
} from 'lucide-react';
import { aiAPI } from '../api';
import { useAccessibility } from '../context/AccessibilityContext';
import VoiceButton from '../components/VoiceButton';
import TextToSpeech from '../components/TextToSpeech';
import { FormattedText, TopicBadgeAndActions, getStepIcon } from '../components/AnswerFormatter';

const CATEGORIZED_PROMPTS = {
  en: [
    { text: "How do I send a photo on WhatsApp?", topic: "whatsapp", icon: MessageCircle },
    { text: "How do I connect to Wi-Fi at home?", topic: "wifi", icon: Wifi },
    { text: "How to use UPI safely without getting scammed?", topic: "upi", icon: ShieldCheck },
    { text: "How do I increase font size on my phone?", topic: "settings", icon: Settings },
    { text: "How to make a WhatsApp video call to my family?", topic: "whatsapp", icon: Phone },
    { text: "How to search for something on Google?", topic: "google", icon: Globe }
  ],
  hi: [
    { text: "व्हाट्सएप पर फोटो कैसे भेजें?", topic: "whatsapp", icon: MessageCircle },
    { text: "घर पर वाई-फाई (Wi-Fi) से कैसे कनेक्ट करें?", topic: "wifi", icon: Wifi },
    { text: "धोखाधड़ी से बचकर UPI का सुरक्षित उपयोग कैसे करें?", topic: "upi", icon: ShieldCheck },
    { text: "फोन में अक्षरों का आकार कैसे बड़ा करें?", topic: "settings", icon: Settings },
    { text: "परिवार से व्हाट्सएप पर वीडियो कॉल कैसे करें?", topic: "whatsapp", icon: Phone },
    { text: "गूगल पर कोई भी जानकारी कैसे खोजें?", topic: "google", icon: Globe }
  ],
  mr: [
    { text: "व्हॉट्सॲपवर फोटो कसा पाठवावा?", topic: "whatsapp", icon: MessageCircle },
    { text: "घरातील वाय-फाय (Wi-Fi) शी फोन कसा जोडावा?", topic: "wifi", icon: Wifi },
    { text: "फसवणूक टाळून UPI चा सुरक्षित वापर कसा करावा?", topic: "upi", icon: ShieldCheck },
    { text: "मोबाईलमधील अक्षरांचा आकार कसा वाढवावा?", topic: "settings", icon: Settings },
    { text: "मुलांशी व्हॉट्सॲपवर व्हिडिओ कॉल कसा करावा?", topic: "whatsapp", icon: Phone },
    { text: "गुगलवर माहिती कशी शोधावी?", topic: "google", icon: Globe }
  ]
};

export default function Chat() {
  const { language, setLanguage, t } = useAccessibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chatWelcome'),
      intro: t('chatWelcome'),
      closing: null,
      steps: [],
      safety_warning: null,
      related_guides: [],
      topic: 'general'
    }
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lastMessageRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Dynamically update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          role: 'assistant',
          content: t('chatWelcome'),
          intro: t('chatWelcome'),
          closing: null,
          steps: [],
          safety_warning: null,
          related_guides: [],
          topic: 'general'
        }];
      }
      return prev;
    });
  }, [language, t]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      handleSendMessage(query);
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
    }
  }, [inputMessage]);

  const handleVoiceTranscript = (transcript, isFinal) => {
    setInputMessage(transcript);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
      textareaRef.current.focus();
    }
  };

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
        intro: response.intro,
        closing: response.closing,
        steps: response.steps || [],
        safety_warning: response.safety_warning,
        related_guides: response.related_guides || [],
        topic: response.topic || 'general',
        query: query.trim()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had a little trouble connecting right now, but please do not worry. You can also explore our step-by-step Guides Library anytime.',
          intro: 'I had a little trouble connecting right now, but please do not worry. You can also explore our step-by-step Guides Library anytime.',
          closing: null,
          steps: [],
          safety_warning: null,
          related_guides: [],
          topic: 'general',
          query: query.trim()
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
        intro: t('chatWelcome'),
        closing: null,
        steps: [],
        safety_warning: null,
        related_guides: [],
        topic: 'general'
      },
    ]);
    setConversationId(null);
  };

  const prompts = CATEGORIZED_PROMPTS[language] || CATEGORIZED_PROMPTS.en;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white dark:bg-slate-950 shadow-xs">
      {/* Top Header with Consistent Branding and One-Tap Language Switcher */}
      <header className="flex-shrink-0 px-3 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to Home"
            title="Back to Home"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-amber-400 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                  {t('appName')}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 hidden xs:inline-block">
                  {t('appTagline')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('activeStatus')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Direct Language Switcher & Clear Conversation */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Multilingual Switcher: English, Marathi, Hindi */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700" role="group" aria-label="Select Language">
            {[
              { code: 'en', label: 'EN' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' }
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                aria-pressed={language === item.code}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === item.code
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearChat}
            aria-label={t('clearChat')}
            title={t('clearChat')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">{t('clearChat')}</span>
          </button>
        </div>
      </header>

      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-7 pb-12">
        {/* Welcome Banner and Suggested Questions when conversation is fresh */}
        {messages.length === 1 && (
          <div className="space-y-6 my-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent border border-teal-500/20 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-800 dark:text-teal-300 font-bold text-base sm:text-lg">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>{t('howToHelp')}</span>
              </div>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {t('chatSubIntro')}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  🎙️ {t('speakButton')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  🌐 English • हिंदी • मराठी
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  🛡️ 100% Safe & Private
                </span>
              </div>
            </div>

            {/* Categorized Suggested Questions */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {t('suggestedPrompts')}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prompts.map((item, idx) => {
                  const PromptIcon = item.icon || Lightbulb;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.text)}
                      className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 text-slate-800 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition shadow-xs font-medium flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <PromptIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold leading-snug">{item.text}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';

          // User message rendered as right-aligned rounded pill
          if (!isAssistant) {
            return (
              <div key={index} className="flex justify-end gap-3 items-end">
                <div className="max-w-[85%] sm:max-w-xl bg-teal-600 text-white rounded-3xl rounded-br-sm px-5 py-3.5 shadow-sm text-base sm:text-lg leading-relaxed font-medium">
                  {msg.content}
                </div>
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm mb-0.5">
                  <User className="w-5 h-5" />
                </div>
              </div>
            );
          }

          // Assistant message: Free-flowing, beautifully formatted answer
          const introText = msg.intro || (msg.steps && msg.steps.length > 0 ? '' : msg.content);
          const closingText = msg.closing;
          const queryText = msg.query || (messages[index - 1]?.content) || "";

          return (
            <div key={index} className="flex items-start gap-3 sm:gap-4 w-full">
              {/* Bot Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-0.5">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Response Body with clear formatting */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Topic Header & Quick Actions */}
                <TopicBadgeAndActions 
                  topic={msg.topic || 'general'} 
                  queryText={queryText}
                  steps={msg.steps || []}
                />

                {/* Safety Warning Alert */}
                {msg.safety_warning && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3 shadow-xs">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{msg.safety_warning}</p>
                  </div>
                )}

                {/* Empathetic Intro Text */}
                {introText && (
                  <div className="text-slate-800 dark:text-slate-100 font-normal">
                    <FormattedText text={introText} />
                  </div>
                )}

                {/* Step-by-Step Instructions Cards (Requirement 3, 6, 7) */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="pt-2 space-y-3.5">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="font-bold text-xs sm:text-sm text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                        {t('stepByStep')}
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                        {msg.steps.length} {msg.steps.length === 1 ? t('step') : `${t('step')}s`}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {msg.steps.map((s, sIdx) => {
                        const stepIconInfo = getStepIcon(s.text);
                        const StepIconComponent = stepIconInfo?.icon;

                        return (
                          <div
                            key={sIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-400 dark:hover:border-teal-700 transition space-y-3"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Step Number Badge */}
                              <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                                {s.step || sIdx + 1}
                              </span>

                              {/* Action Icon if keyword detected */}
                              {StepIconComponent && (
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${stepIconInfo.color}`}>
                                  <StepIconComponent className="w-4 h-4" />
                                </div>
                              )}

                              {/* Formatted Step Instruction */}
                              <div className="flex-1 text-slate-900 dark:text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
                                <FormattedText text={s.text} />
                              </div>
                            </div>

                            {/* Audio Readout for this step */}
                            <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between pl-11">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {t('listenStep')}:
                              </span>
                              <TextToSpeech
                                text={`Step ${s.step || sIdx + 1}: ${s.text}`}
                                label={t('listen')}
                                className="font-bold text-xs sm:text-sm px-3.5 py-1.5 shadow-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Friendly Closing Reassurance */}
                {closingText && (
                  <div className="text-slate-800 dark:text-slate-100 font-normal pt-1">
                    <FormattedText text={closingText} />
                  </div>
                )}

                {/* Full Audio Readout Toolbar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t('listenFull')}:
                  </span>
                  <TextToSpeech
                    text={
                      msg.steps && msg.steps.length > 0
                        ? `${introText ? introText + '. ' : ''}${msg.steps.map((s) => `Step ${s.step}: ${s.text}`).join('. ')}${closingText ? '. ' + closingText : ''}`
                        : msg.content
                    }
                    label={t('listen')}
                  />
                </div>

                {/* Related Guides Recommendation Cards */}
                {msg.related_guides && msg.related_guides.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      {t('relatedGuides')}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.related_guides.map((g) => {
                        const guideTitle = (language === 'hi' && g.title_hi) ? g.title_hi : (language === 'mr' && g.title_mr) ? g.title_mr : g.title;
                        return (
                          <Link
                            key={g.id}
                            to={`/guides/${g.id}`}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-800 dark:text-slate-200 transition flex items-center justify-between gap-2 group text-xs sm:text-sm font-semibold"
                          >
                            <span className="truncate">{guideTitle}</span>
                            <ArrowRight className="w-4 h-4 text-teal-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-fit shadow-xs">
            <div className="w-5 h-5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {language === 'hi' 
                ? 'सहाय्यक AI आपके लिए सरल चरण-दर-चरण निर्देश तैयार कर रहा है...'
                : language === 'mr'
                  ? 'सहाय्यक AI आपल्यासाठी सोप्या पायऱ्या तयार करत आहे...'
                  : 'Sahayyak AI is preparing simple instructions for you...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Locked Bottom Bar: Voice Input Display & Multiline Textarea */}
      <footer className="flex-shrink-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        {/* Real-time Voice Listening Indicator Banner */}
        {isVoiceListening && (
          <div className="max-w-3xl mx-auto mb-2 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>🎙️ {t('voiceListening')} ({t('voiceHelp')})</span>
            </div>
            <span className="text-xs font-normal opacity-80 hidden sm:inline">
              Spoken words will appear in the text box below
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative max-w-3xl mx-auto flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 rounded-3xl p-2 transition shadow-xs"
        >
          {/* Voice Input Button (Requirement 4) */}
          <div className="flex-shrink-0 pb-0.5">
            <VoiceButton
              onTranscript={handleVoiceTranscript}
              onListeningChange={setIsVoiceListening}
              size="md"
            />
          </div>

          {/* Multiline Textarea: Displays recognized voice and user input */}
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
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base resize-none py-2 px-1 max-h-32 overflow-y-auto leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            aria-label="Send message"
            className="flex-shrink-0 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Send</span>
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {t('appFullName')} • Never share your bank OTP, UPI PIN, or passwords with anyone.
        </p>
      </footer>
    </div>
  );
}
