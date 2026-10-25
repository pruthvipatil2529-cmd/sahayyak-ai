import React from 'react';
import { HeartHandshake, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useAccessibility();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Sahayyak Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {t('appName')}
              </span>
            </div>
            <p className="text-slate-400 text-base max-w-md leading-relaxed">
              Designed with immense care and patience for senior citizens and technology beginners. We believe everyone deserves to enjoy digital technology with confidence and total peace of mind.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-amber-300 text-sm font-semibold">
              <PhoneCall className="w-4 h-4" />
              <span>{t('nationalHelpline')}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-base">
              <li>
                <Link to="/" className="hover:text-teal-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-teal-400 transition">{t('askAiButton')}</Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-teal-400 transition">{t('browseGuides')}</Link>
              </li>
              <li>
                <Link to="/safety-hub" className="hover:text-teal-400 transition">{t('safetyHub')}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Trust & Ethics</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero PIN/Password Storage</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multilingual Native Support</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audio Reading for All Steps</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>WCAG Accessible Controls</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <p>
            © {new Date().getFullYear()} Sahayyak AI. Educational guidance only. Always verify bank details using official branches.
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for our elders.
          </p>
        </div>
      </div>
    </footer>
  );
}
