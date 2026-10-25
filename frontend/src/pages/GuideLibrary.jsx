import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { guidesAPI, categoriesAPI, savedGuidesAPI } from '../api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import GuideCard from '../components/GuideCard';

export default function GuideLibrary() {
  const { language, t } = useAccessibility();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoriesAPI.getCategories();
        setCategories(cats);
      } catch (err) {
        console.warn('Notice loading categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory) params.category_id = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;

        const data = await guidesAPI.getGuides(params);
        setGuides(data);
      } catch (err) {
        console.warn('Notice loading guides:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchGuides();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleToggleSave = async (guideId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const guide = guides.find((g) => g.id === guideId);
      if (guide?.is_saved) {
        await savedGuidesAPI.removeSavedGuide(guideId);
      } else {
        await savedGuidesAPI.saveGuide(guideId);
      }
      setGuides((prev) =>
        prev.map((g) => (g.id === guideId ? { ...g, is_saved: !g.is_saved } : g))
      );
    } catch (err) {
      console.warn('Save guide notice:', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t('browseGuides')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Clear, tested, step-by-step guides for everyday mobile and internet tasks.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 text-base"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              selectedCategory === ''
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const catName =
              language === 'hi' && cat.name_hi
                ? cat.name_hi
                : language === 'mr' && cat.name_mr
                ? cat.name_mr
                : cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  selectedCategory === String(cat.id)
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Cards Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading guides...</p>
        </div>
      ) : guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              isSaved={guide.is_saved}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No exact guides found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Would you like to ask Sahayyak AI directly? It will answer your question step-by-step.
          </p>
          <Link
            to={`/chat?q=${encodeURIComponent(searchTerm)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition"
          >
            <Bot className="w-5 h-5" />
            <span>Ask Sahayyak AI</span>
          </Link>
        </div>
      )}
    </div>
  );
}
