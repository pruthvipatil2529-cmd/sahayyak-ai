import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Mic, BookOpen, ShieldCheck, Search, ArrowRight,
  Smartphone, MessageCircle, CreditCard, Mail, Globe, Sparkles, CheckCircle, Volume2
} from 'lucide-react';
import { guidesAPI, categoriesAPI, savedGuidesAPI } from '../api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import GuideCard from '../components/GuideCard';
import SafetyBanner from '../components/SafetyBanner';
import VoiceButton from '../components/VoiceButton';

const ICON_MAP = {
  Smartphone: Smartphone,
  MessageCircle: MessageCircle,
  CreditCard: CreditCard,
  Mail: Mail,
  ShieldCheck: ShieldCheck,
  Globe: Globe,
};

export default function Home() {
  const { language, t } = useAccessibility();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featuredGuides, setFeaturedGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, guides] = await Promise.all([
          categoriesAPI.getCategories(),
          guidesAPI.getGuides({ limit: 6 })
        ]);
        setCategories(cats);
        setFeaturedGuides(guides);
      } catch (err) {
        console.warn('Notice loading home data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/guides?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceInput = (transcript) => {
    // Navigate straight to chat with transcript
    navigate(`/chat?q=${encodeURIComponent(transcript)}`);
  };

  const handleToggleSave = async (guideId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const guide = featuredGuides.find(g => g.id === guideId);
      if (guide?.is_saved) {
        await savedGuidesAPI.removeSavedGuide(guideId);
      } else {
        await savedGuidesAPI.saveGuide(guideId);
      }
      setFeaturedGuides(prev => prev.map(g => g.id === guideId ? { ...g, is_saved: !g.is_saved } : g));
    } catch (err) {
      console.warn('Save guide notice:', err.message);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-8 sm:pt-14 pb-12 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold text-sm tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t('appName')} — {t('appTagline')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white max-w-4xl mx-auto tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Primary Action Buttons (PRD Section 8) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 transition hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-6 h-6" />
              <span>{t('askAiButton')}</span>
            </Link>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 shadow-sm">
              <VoiceButton onTranscript={handleVoiceInput} />
              <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200">
                {t('speakButton')}
              </span>
            </div>

            <Link
              to="/guides"
              className="inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t('browseGuides')}</span>
            </Link>
          </div>

          {/* Interactive Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-13 pr-32 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none shadow-md text-base sm:text-lg"
              />
              <button
                type="submit"
                className="absolute right-2.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Safety Protection Banner */}
        <SafetyBanner />

        {/* Popular Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('popularCategories')}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                Tap any category to find simple, patient instructions
              </p>
            </div>
            <Link to="/guides" className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline text-sm sm:text-base">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Smartphone;
              const catName = (language === 'hi' && cat.name_hi) ? cat.name_hi : (language === 'mr' && cat.name_mr) ? cat.name_mr : cat.name;
              return (
                <Link
                  key={cat.id}
                  to={`/guides?category=${cat.id}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 group-hover:bg-teal-600 text-teal-600 dark:text-teal-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">
                      {catName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                      {cat.guide_count || 0} guides
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Guides Library */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('popularGuides')}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                Frequently needed tasks with clear pictures and audio readouts
              </p>
            </div>
            <Link to="/guides" className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline text-sm sm:text-base">
              <span>All Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                isSaved={guide.is_saved}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </section>

        {/* How Sahayyak Works (PRD Section 31) */}
        <section className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('howItWorks')}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Built from the ground up for gentle learning at your own pace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-black text-xl">
                🎙️
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('feature1Title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('feature1Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black text-xl">
                👣
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('feature2Title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('feature2Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('feature3Title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('feature3Desc')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
