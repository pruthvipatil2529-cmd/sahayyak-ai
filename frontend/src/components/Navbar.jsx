import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, MessageSquare, BookOpen, Shield, LayoutDashboard, 
  Settings, LogIn, LogOut, Menu, X, User, Globe, Type, Sun, Moon, Sparkles, SlidersHorizontal 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { 
    textSize, setTextSize, 
    contrastMode, setContrastMode, 
    language, setLanguage, 
    t 
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: HeartHandshake },
    { to: '/chat', label: t('askAiButton'), icon: MessageSquare, highlight: true },
    { to: '/guides', label: t('browseGuides'), icon: BookOpen },
    { to: '/safety-hub', label: t('safetyHub'), icon: Shield },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              {t('appName')}
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                AI
              </span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {t('appTagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-base font-semibold transition-all ${
                  link.highlight
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                    : active
                      ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${link.highlight ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls (Settings + Auth) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Settings Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
              title="Settings & Accessibility"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Settings</span>
            </button>

            {/* Desktop Settings Modal / Popup */}
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-4 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                    Accessibility & Theme
                  </span>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {t('language')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिंदी' },
                      { code: 'mr', label: 'मराठी' }
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => setLanguage(item.code)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          language === item.code
                            ? 'bg-teal-600 text-white shadow'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    {t('textSize')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {[
                      { val: 'normal', label: 'A (Normal)' },
                      { val: 'large', label: 'A+ (Large)' },
                      { val: 'extralarge', label: 'A++ (Max)' }
                    ].map((ts) => (
                      <button
                        key={ts.val}
                        onClick={() => setTextSize(ts.val)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          textSize === ts.val
                            ? 'bg-amber-600 text-white shadow'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {ts.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-teal-500" />
                    {t('contrast')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setContrastMode('light')}
                      className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                        contrastMode === 'light' ? 'bg-teal-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Light
                    </button>
                    <button
                      onClick={() => setContrastMode('dark')}
                      className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                        contrastMode === 'dark' ? 'bg-teal-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Dark
                    </button>
                    <button
                      onClick={() => setContrastMode('high-contrast')}
                      className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                        contrastMode === 'high-contrast' ? 'bg-yellow-400 text-black font-extrabold shadow' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Contrast
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-sm transition ${
                  isActive('/dashboard')
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('dashboard')}</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition"
                >
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:text-teal-600 rounded-xl transition"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Includes all Settings options directly) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Settings Section inside Drawer */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-200 dark:border-slate-700 pb-2">
              <Settings className="w-5 h-5 text-teal-600" />
              <span>Settings & Accessibility</span>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>{t('language')} (Language)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'mr', label: 'मराठी' }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setLanguage(item.code)}
                    className={`py-2 rounded-xl text-sm font-bold border transition ${
                      language === item.code
                        ? 'bg-teal-600 text-white border-teal-600 shadow'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-500" />
                <span>{t('textSize')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'normal', label: 'Normal' },
                  { val: 'large', label: 'Large A+' },
                  { val: 'extralarge', label: 'Extra A++' }
                ].map((ts) => (
                  <button
                    key={ts.val}
                    onClick={() => setTextSize(ts.val)}
                    className={`py-2 rounded-xl text-sm font-bold border transition ${
                      textSize === ts.val
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Sun className="w-4 h-4 text-teal-500" />
                <span>{t('contrast')} (Theme)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setContrastMode('light')}
                  className={`py-2 rounded-xl text-sm font-bold border flex items-center justify-center gap-1.5 transition ${
                    contrastMode === 'light'
                      ? 'bg-teal-600 text-white border-teal-600 shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setContrastMode('dark')}
                  className={`py-2 rounded-xl text-sm font-bold border flex items-center justify-center gap-1.5 transition ${
                    contrastMode === 'dark'
                      ? 'bg-teal-600 text-white border-teal-600 shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => setContrastMode('high-contrast')}
                  className={`py-2 rounded-xl text-sm font-bold border flex items-center justify-center gap-1.5 transition ${
                    contrastMode === 'high-contrast'
                      ? 'bg-yellow-400 text-black border-yellow-400 font-extrabold shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  High Contrast
                </button>
              </div>
            </div>
          </div>

          {/* User Auth Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-6 h-6 text-amber-500" />
                  <span>{t('dashboard')}</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-6 h-6 text-slate-500" />
                  <span>{t('profile')}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-6 h-6" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                >
                  <LogOut className="w-6 h-6" />
                  <span>{t('logout')}</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 px-4 rounded-xl font-bold bg-teal-600 text-white shadow"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
