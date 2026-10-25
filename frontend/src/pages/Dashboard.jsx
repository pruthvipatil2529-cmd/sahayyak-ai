import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, Bookmark, MessageSquare, BookOpen, Settings,
  Sparkles, ArrowRight, Trash2, Clock
} from 'lucide-react';
import { savedGuidesAPI, conversationsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import GuideCard from '../components/GuideCard';

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, t } = useAccessibility();
  const navigate = useNavigate();

  const [savedGuides, setSavedGuides] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [savedData, convsData] = await Promise.all([
          savedGuidesAPI.getSavedGuides(),
          conversationsAPI.getConversations().catch(() => [])
        ]);
        setSavedGuides(savedData);
        setConversations(convsData);
      } catch (err) {
        console.warn('Dashboard notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleRemoveSaved = async (guideId) => {
    try {
      await savedGuidesAPI.removeSavedGuide(guideId);
      setSavedGuides((prev) => prev.filter((item) => item.guide.id !== guideId));
    } catch (err) {
      console.warn('Remove saved notice:', err.message);
    }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await conversationsAPI.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    } catch (err) {
      console.warn('Delete conversation notice:', err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-teal-100 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Namaste, {user?.name || "Friend"}!</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">
          Welcome to Your Personal Dashboard
        </h1>
        <p className="text-teal-100 text-base sm:text-lg max-w-xl">
          Everything you have saved or asked is kept right here for easy access whenever you need it.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 font-extrabold text-base shadow transition"
          >
            Ask Sahayyak AI
          </Link>
          <Link
            to="/guides"
            className="px-6 py-3 rounded-2xl bg-teal-800/60 hover:bg-teal-800 text-white font-extrabold text-base transition border border-teal-500/40"
          >
            Browse New Guides
          </Link>
        </div>
      </div>

      {/* Saved Guides Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('savedGuides')} ({savedGuides.length})
            </h2>
          </div>
          <Link to="/guides" className="text-teal-600 dark:text-teal-400 font-bold hover:underline text-sm sm:text-base">
            Find More
          </Link>
        </div>

        {savedGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedGuides.map((item) => (
              <GuideCard
                key={item.id}
                guide={item.guide}
                isSaved={true}
                onToggleSave={() => handleRemoveSaved(item.guide.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto">
              {t('noSavedGuides')}
            </p>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow transition"
            >
              <span>Explore Guides Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Recent AI Conversations Section */}
      {conversations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Recent Questions You Asked
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {conv.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/chat?id=${conv.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition"
                  >
                    Open Chat
                  </Link>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
