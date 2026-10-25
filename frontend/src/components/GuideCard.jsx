import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import TextToSpeech from './TextToSpeech';

export default function GuideCard({ guide, onToggleSave, isSaved = false }) {
  const { language, t } = useAccessibility();
  const { isAuthenticated } = useAuth();

  // Pick localized title and description
  const title = (language === 'hi' && guide.title_hi) 
    ? guide.title_hi 
    : (language === 'mr' && guide.title_mr) 
      ? guide.title_mr 
      : guide.title;

  const description = (language === 'hi' && guide.description_hi)
    ? guide.description_hi
    : (language === 'mr' && guide.description_mr)
      ? guide.description_mr
      : guide.description;

  // Parse steps count
  let stepsCount = 0;
  try {
    const parsed = typeof guide.steps_json === 'string' ? JSON.parse(guide.steps_json) : guide.steps_json;
    stepsCount = Array.isArray(parsed) ? parsed.length : 0;
  } catch (e) {
    stepsCount = 4;
  }

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:border-teal-500/50">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
              {guide.category?.name || "General"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {guide.difficulty || "Easy"}
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(guide.id)}
              aria-label={isSaved ? "Remove from saved guides" : "Save this guide"}
              title={isSaved ? "Saved" : "Save this guide"}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          <Link to={`/guides/${guide.id}`}>
            {title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer Details & Action Button */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {stepsCount} {stepsCount === 1 ? t('step') : `${t('step')}s`}
          </span>
          <TextToSpeech text={`${title}. ${description}`} label="" className="p-1.5" />
        </div>

        <Link
          to={`/guides/${guide.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm"
        >
          <span>Open Guide</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
