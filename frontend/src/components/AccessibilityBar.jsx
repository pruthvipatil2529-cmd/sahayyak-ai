import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Type, Sun, Moon, Sparkles, Globe } from 'lucide-react';

export default function AccessibilityBar() {
  const { textSize, setTextSize, contrastMode, setContrastMode, language, setLanguage, t } = useAccessibility();

  return (
    <aside aria-label="Accessibility settings" className="bg-slate-900 text-slate-100 px-4 py-2 text-sm border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <span className="font-medium mr-1">{t('language')}:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5" role="group" aria-label="Language options">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition ${
                language === 'en' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
              aria-pressed={language === 'en'}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition ${
                language === 'hi' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
              aria-pressed={language === 'hi'}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition ${
                language === 'mr' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
              aria-pressed={language === 'mr'}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Text Size & Contrast Controls */}
        <div className="flex items-center flex-wrap gap-4">
          {/* Text Size */}
          <div className="flex items-center gap-1.5">
            <Type className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="font-medium hidden sm:inline">{t('textSize')}:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5" role="group" aria-label="Text size options">
              <button
                onClick={() => setTextSize('normal')}
                className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold ${
                  textSize === 'normal' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Normal text"
                aria-pressed={textSize === 'normal'}
              >
                A
              </button>
              <button
                onClick={() => setTextSize('large')}
                className={`px-2.5 py-0.5 rounded text-sm sm:text-base font-bold ${
                  textSize === 'large' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Large text"
                aria-pressed={textSize === 'large'}
              >
                A+
              </button>
              <button
                onClick={() => setTextSize('extralarge')}
                className={`px-2.5 py-0.5 rounded text-base sm:text-lg font-extrabold ${
                  textSize === 'extralarge' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Extra large text"
                aria-pressed={textSize === 'extralarge'}
              >
                A++
              </button>
            </div>
          </div>

          {/* Color Contrast */}
          <div className="flex items-center gap-1.5">
            <span className="font-medium hidden md:inline">{t('contrast')}:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5" role="group" aria-label="Theme contrast options">
              <button
                onClick={() => setContrastMode('light')}
                className={`p-1.5 rounded ${
                  contrastMode === 'light' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Standard light mode"
                aria-label="Light mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setContrastMode('high-contrast')}
                className={`p-1.5 rounded ${
                  contrastMode === 'high-contrast' ? 'bg-yellow-400 text-black font-black' : 'text-slate-300 hover:text-white'
                }`}
                title="High contrast mode"
                aria-label="High contrast mode"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setContrastMode('dark')}
                className={`p-1.5 rounded ${
                  contrastMode === 'dark' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
