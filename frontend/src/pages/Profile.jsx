import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, Type, Volume2, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, updateUserProfile } = useAuth();
  const { language, setLanguage, textSize, setTextSize, t } = useAccessibility();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [prefLang, setPrefLang] = useState('en');
  const [prefTextSize, setPrefTextSize] = useState('normal');
  const [voicePref, setVoicePref] = useState('female_friendly');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setPrefLang(user.preferred_language || language);
      setPrefTextSize(user.text_size || textSize);
      setVoicePref(user.voice_preference || 'female_friendly');
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateUserProfile({
        name,
        preferred_language: prefLang,
        text_size: prefTextSize,
        voice_preference: voicePref,
      });
      setLanguage(prefLang);
      setTextSize(prefTextSize);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('profile')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Customize how Sahayyak AI displays text, speaks, and assists you.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Your preferences have been saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Email (Read only) */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 text-base cursor-not-allowed"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>Preferred Language</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'mr', label: 'मराठी (Marathi)' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setPrefLang(lang.code)}
                  className={`py-3 px-3 rounded-2xl font-bold text-sm border transition ${
                    prefLang === lang.code
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-500" />
              <span>Text Size</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'normal', label: 'Normal (A)' },
                { val: 'large', label: 'Large (A+)' },
                { val: 'extralarge', label: 'Extra Large (A++)' }
              ].map((ts) => (
                <button
                  key={ts.val}
                  type="button"
                  onClick={() => setPrefTextSize(ts.val)}
                  className={`py-3 px-2 rounded-2xl font-bold text-sm border transition ${
                    prefTextSize === ts.val
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Preference */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Voice Preference</span>
            </label>
            <select
              value={voicePref}
              onChange={(e) => setVoicePref(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:outline-none focus:border-teal-500"
            >
              <option value="female_friendly">Warm & Gentle (Recommended)</option>
              <option value="male_calm">Calm & Clear</option>
              <option value="default">Default Device Voice</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base sm:text-lg shadow-md transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
