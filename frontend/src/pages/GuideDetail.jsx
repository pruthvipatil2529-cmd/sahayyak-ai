import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bookmark, CheckCircle2, Circle, Volume2, ShieldAlert,
  Share2, Award, Sparkles, MessageSquare
} from 'lucide-react';
import { guidesAPI, savedGuidesAPI } from '../api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import TextToSpeech from '../components/TextToSpeech';

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useAccessibility();
  const { isAuthenticated } = useAuth();

  const [guide, setGuide] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const data = await guidesAPI.getGuideById(id);
        setGuide(data);
        setIsSaved(data.is_saved || false);
      } catch (err) {
        console.warn('Notice loading guide details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-600 dark:text-slate-400">Loading guide...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guide Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400">This guide might have been moved or updated.</p>
        <Link to="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Guides</span>
        </Link>
      </div>
    );
  }

  // Pick localized title, description, and steps
  const title = (language === 'hi' && guide.title_hi) ? guide.title_hi : (language === 'mr' && guide.title_mr) ? guide.title_mr : guide.title;
  const description = (language === 'hi' && guide.description_hi) ? guide.description_hi : (language === 'mr' && guide.description_mr) ? guide.description_mr : guide.description;

  let steps = [];
  try {
    steps = typeof guide.steps_json === 'string' ? JSON.parse(guide.steps_json) : guide.steps_json;
  } catch (e) {
    steps = [];
  }

  let safetyTips = [];
  try {
    safetyTips = typeof guide.safety_tips_json === 'string' ? JSON.parse(guide.safety_tips_json) : guide.safety_tips_json;
  } catch (e) {
    safetyTips = [];
  }

  const toggleStepDone = (stepIdx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await savedGuidesAPI.removeSavedGuide(guide.id);
        setIsSaved(false);
      } else {
        await savedGuidesAPI.saveGuide(guide.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.warn('Bookmark notice:', err.message);
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/guides"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 font-bold transition text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>All Guides</span>
        </Link>

        <button
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition shadow-sm ${
            isSaved
              ? 'bg-amber-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-500'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          <span>{isSaved ? t('saved') : t('saveGuide')}</span>
        </button>
      </div>

      {/* Guide Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
            {guide.category?.name || "Smartphone"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Difficulty: {guide.difficulty || "Easy"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {steps.length} Steps
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Listen to entire guide introduction */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <TextToSpeech
            text={`${title}. ${description}. Follow the numbered steps below.`}
            label="Listen to Guide Overview"
          />
        </div>

        {/* Step Completion Progress */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            <span>Your Progress: {completedCount} of {steps.length} steps completed</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Step-by-Step Instructions:
        </h2>

        {steps.map((stepItem, idx) => {
          const isDone = !!completedSteps[idx];
          const instruction = (language === 'hi' && stepItem.instruction_hi)
            ? stepItem.instruction_hi
            : (language === 'mr' && stepItem.instruction_mr)
              ? stepItem.instruction_mr
              : stepItem.instruction;

          return (
            <div
              key={idx}
              className={`rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
                isDone
                  ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 opacity-90'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step number badge */}
                <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-extrabold text-base sm:text-lg ${
                  isDone
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                }`}>
                  {stepItem.step_number || idx + 1}
                </span>

                {/* Step content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={`text-lg sm:text-xl font-bold ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {stepItem.title}
                    </h3>

                    <TextToSpeech text={`${stepItem.title}. ${instruction}. ${stepItem.tip || ''}`} />
                  </div>

                  <p className={`text-base sm:text-lg leading-relaxed ${
                    isDone ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {instruction}
                  </p>

                  {stepItem.tip && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Helpful Tip:</strong> {stepItem.tip}</span>
                    </div>
                  )}

                  {/* Mark as Done Checkbox */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleStepDone(idx)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                        isDone
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('completed')}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>{t('markCompleted')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Tips Section */}
      {safetyTips.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200 font-extrabold text-lg sm:text-xl">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Important Safety Warning</span>
          </div>
          {safetyTips.map((st, sIdx) => {
            const tipText = (language === 'hi' && st.tip_hi) ? st.tip_hi : (language === 'mr' && st.tip_mr) ? st.tip_mr : st.tip;
            return (
              <p key={sIdx} className="text-rose-900/90 dark:text-rose-300 text-base leading-relaxed font-medium">
                • {tipText}
              </p>
            );
          })}
        </div>
      )}

      {/* Ask Question About this Guide */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold">Need more help with this?</h3>
          <p className="text-teal-100 text-base">Ask Sahayyak AI directly. We explain at your pace.</p>
        </div>
        <Link
          to={`/chat?q=${encodeURIComponent(`Help me with: ${title}`)}`}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 font-extrabold text-base shadow transition whitespace-nowrap"
        >
          Ask AI Now
        </Link>
      </div>
    </div>
  );
}
