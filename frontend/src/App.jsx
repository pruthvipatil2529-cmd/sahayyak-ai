import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';

import AccessibilityBar from './components/AccessibilityBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Chat from './pages/Chat';
import GuideLibrary from './pages/GuideLibrary';
import GuideDetail from './pages/GuideDetail';
import SafetyHub from './pages/SafetyHub';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function AppLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-teal-500 selection:text-white">
      <AccessibilityBar />
      <Navbar />

      <main className={`flex-1 ${isChatPage ? 'flex flex-col h-[calc(100dvh-120px)] sm:h-[calc(100dvh-130px)] overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/guides" element={<GuideLibrary />} />
          <Route path="/guides/:id" element={<GuideDetail />} />
          <Route path="/safety-hub" element={<SafetyHub />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {!isChatPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
