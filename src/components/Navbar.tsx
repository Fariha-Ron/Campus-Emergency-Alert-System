import React from 'react';
import {
  ShieldAlert,
  LogIn,
  LogOut,
  Radio,
  FileText,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { EmergencyReport } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (role?: 'student' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { reports } = useReports();

  const effectiveIsAdmin = Boolean(
    isAdmin || currentUser?.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com'
  );

  const newAlertsCount = reports.filter((r: EmergencyReport) => r.status === 'NEW').length;
  // For students, reports array only contains their own reports from ReportsContext
  const activeStudentReportsCount = reports.filter(
    (r: EmergencyReport) => r.status !== 'RESOLVED'
  ).length;

  const handleSignOut = async () => {
    await logout();
    window.location.hash = '#/';
    onSelectTab('home');
  };

  return (
    <>
      {/* Top University Reassurance Banner */}
      <div className="bg-[#E6F4F1] border-b border-[#2E7D6B]/15 px-4 py-1.5 text-xs text-[#2E7D6B] font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="font-semibold tracking-wide">University Safety Live Monitoring Active</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo and Brand */}
            <div
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2E7D6B] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-[#2E7D6B]/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-[#1E293B] tracking-tight group-hover:text-[#2E7D6B] transition-colors">
                    Campus Emergency Alert System
                  </span>
                  <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider bg-[#E6F4F1] text-[#2E7D6B] px-2 py-0.5 rounded-full border border-[#2E7D6B]/20">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">Real-Time Incident Dispatch</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              {/* Student "My Reports" tab */}
              {currentUser && !effectiveIsAdmin && (
                <button
                  onClick={() => onSelectTab('my-reports')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer relative ${
                    currentTab === 'my-reports'
                      ? 'bg-[#E6F4F1] text-[#2E7D6B] font-bold border border-[#2E7D6B]/25'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#2E7D6B]" />
                  <span>My Reports</span>
                  {activeStudentReportsCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-[#2E7D6B] rounded-full animate-pulse-gentle">
                      {activeStudentReportsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Campus Admin Portal tab */}
              {effectiveIsAdmin && (
                <button
                  onClick={() => onSelectTab('admin')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer relative ${
                    currentTab === 'admin'
                      ? 'bg-[#E6F4F1] text-[#2E7D6B] font-bold border border-[#2E7D6B]/25'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100'
                  }`}
                >
                  <Radio className="w-4 h-4 text-[#2E7D6B]" />
                  <span>Admin Incident Console</span>
                  {newAlertsCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-[#DC2626] rounded-full animate-pulse-gentle">
                      {newAlertsCount}
                    </span>
                  )}
                </button>
              )}
            </nav>

            {/* Right Action / Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#1E293B] truncate max-w-[140px]">
                      {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <div className="flex items-center gap-1 justify-end">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          effectiveIsAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {effectiveIsAdmin ? 'Campus Admin' : 'Student'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    title="Sign Out of Campus System"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                /* Two Distinct Professional Sign-In Buttons */
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('admin')}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-100 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs border border-slate-700/80 hover:border-emerald-500/50 cursor-pointer"
                    title="Campus Safety Administration Login"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span>Admin Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('student')}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2E7D6B] hover:bg-[#256859] rounded-xl transition-all shadow-xs shadow-[#2E7D6B]/25 hover:shadow-md cursor-pointer"
                    title="Student Safety Portal Sign In"
                  >
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Student Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip (when logged in) */}
        {currentUser && (
          <div className="flex md:hidden items-center justify-around border-t border-slate-100 px-3 py-2 bg-slate-50/90">
            {!effectiveIsAdmin ? (
              <button
                onClick={() => onSelectTab('my-reports')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  currentTab === 'my-reports' ? 'bg-[#E6F4F1] text-[#2E7D6B] font-bold' : 'text-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#2E7D6B]" />
                <span>My Reports</span>
                {activeStudentReportsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#2E7D6B] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeStudentReportsCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => onSelectTab('admin')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  currentTab === 'admin' ? 'bg-[#E6F4F1] text-[#2E7D6B] font-bold' : 'text-slate-600'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#2E7D6B]" />
                <span>Admin Console</span>
                {newAlertsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] flex items-center justify-center font-bold">
                    {newAlertsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
