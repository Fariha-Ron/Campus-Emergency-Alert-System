import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ReportForm } from './components/ReportForm';
import { AdminDashboard } from './components/AdminDashboard';
import { MyReports } from './components/MyReports';
import { AuthModal } from './components/AuthModal';
import { ShieldAlert, HeartHandshake, PhoneCall, Mail } from 'lucide-react';
import { EmergencyType } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyType>('Medical');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authRoleDefault, setAuthRoleDefault] = useState<'student' | 'admin'>('student');
  const { currentUser, isAdmin, loading } = useAuth();

  const effectiveIsAdmin = Boolean(
    isAdmin || currentUser?.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com'
  );

  // Sync hash with currentTab for seamless bookmarking & history with strict RBAC guard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'report') {
        setCurrentTab('report');
      } else if (hash === 'my-reports') {
        setCurrentTab('my-reports');
      } else if (hash === 'admin') {
        if (!loading && !effectiveIsAdmin) {
          setCurrentTab('home');
          window.location.hash = '#/';
        } else if (effectiveIsAdmin) {
          setCurrentTab('admin');
        }
      } else if (hash === 'login') {
        setCurrentTab('home');
        setIsAuthOpen(true);
      } else {
        setCurrentTab('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [effectiveIsAdmin, loading]);

  // Proactively redirect if user role changes or unauthorized access to admin occurs
  useEffect(() => {
    if (!loading && currentTab === 'admin' && !effectiveIsAdmin) {
      setCurrentTab('home');
      window.location.hash = '#/';
    }
  }, [currentTab, effectiveIsAdmin, loading]);

  const handleSelectTab = (tab: string) => {
    if (tab === 'admin' && !effectiveIsAdmin) {
      setCurrentTab('home');
      window.location.hash = '#/';
      return;
    }
    setCurrentTab(tab);
    window.location.hash = `#/${tab === 'home' ? '' : tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: EmergencyType) => {
    setSelectedCategory(category);
    if (currentUser) {
      setCurrentTab('report');
      window.location.hash = '#/report';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAuth = (role: 'student' | 'admin' = 'student') => {
    setAuthRoleDefault(role);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (role: 'student' | 'admin') => {
    setIsAuthOpen(false);
    if (role === 'admin') {
      setCurrentTab('admin');
      window.location.hash = '#/admin';
    } else {
      // If user was on my-reports, retain that tab, otherwise route to report
      const nextTab = currentTab === 'my-reports' ? 'my-reports' : 'report';
      setCurrentTab(nextTab);
      window.location.hash = `#/${nextTab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={(role) => handleOpenAuth(role || 'student')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={handleSelectTab}
            onSelectCategory={handleSelectCategory}
            onOpenAuth={() => handleOpenAuth('student')}
          />
        )}

        {currentTab === 'report' && (
          <ReportForm
            initialType={selectedCategory}
            onSuccessNavigate={handleSelectTab}
            onOpenAuth={() => handleOpenAuth('student')}
          />
        )}

        {currentTab === 'my-reports' && (
          <MyReports
            onNavigateToReport={() => handleSelectTab('report')}
            onOpenAuth={() => handleOpenAuth('student')}
          />
        )}

        {currentTab === 'admin' && effectiveIsAdmin && (
          <AdminDashboard onOpenAuth={() => handleOpenAuth('admin')} />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole={authRoleDefault}
        onSuccess={handleAuthSuccess}
      />

      {/* Reassuring Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: System Branding */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E7D6B] flex items-center justify-center text-white">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-800">
                  Campus Emergency Alert System
                </span>
              </div>
              <p className="text-xs text-[#64748B] max-w-sm leading-relaxed">
                Real-time campus emergency notification and incident response system.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Quick Navigation
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  <button
                    onClick={() => handleSelectTab('home')}
                    className="hover:text-[#2E7D6B] transition-colors cursor-pointer"
                  >
                    Campus Safety Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectTab('report')}
                    className="hover:text-[#2E7D6B] transition-colors cursor-pointer"
                  >
                    Submit Emergency Alert
                  </button>
                </li>
                {currentUser && !effectiveIsAdmin && (
                  <li>
                    <button
                      onClick={() => handleSelectTab('my-reports')}
                      className="hover:text-[#2E7D6B] transition-colors cursor-pointer"
                    >
                      My Reports & Dispatch
                    </button>
                  </li>
                )}
                {effectiveIsAdmin && (
                  <li>
                    <button
                      onClick={() => handleSelectTab('admin')}
                      className="hover:text-[#2E7D6B] transition-colors cursor-pointer"
                    >
                      Admin Incident Console
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3: Emergency Dispatch */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Responder Dispatch
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2E7D6B]" />
                  <span className="truncate">Automated Admin Dispatch Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  <span>Campus Police: (555) 0199</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Student Health EMS: (555) 0112</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              © 2026 University Safety Division • Campus Emergency Alert System
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Firestore Telemetry Active
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ReportsProvider>
          <AppContent />
        </ReportsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
