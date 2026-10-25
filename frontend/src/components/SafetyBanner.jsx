import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Link } from 'react-router-dom';

export default function SafetyBanner({ compact = false }) {
  const { t } = useAccessibility();

  if (compact) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-sm">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="flex-1 font-medium">{t('safetyAlertBanner')}</p>
        <Link to="/safety-hub" className="text-amber-700 dark:text-amber-300 underline font-bold whitespace-nowrap">
          Learn More
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-400/80 dark:border-amber-600 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
              <span>{t('safetyTip')}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                Official Protection
              </span>
            </h4>
            <p className="text-sm sm:text-base text-amber-900/90 dark:text-amber-300/90 mt-1 leading-relaxed">
              {t('safetyAlertBanner')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/safety-hub"
            className="w-full sm:w-auto text-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            {t('safetyHub')}
          </Link>
        </div>
      </div>
    </div>
  );
}
