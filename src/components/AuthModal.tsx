import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'student' | 'admin';
  onSuccess?: (role: 'student' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'student',
  onSuccess,
}) => {
  const { login, signup, logout } = useAuth();

  const [selectedPortal, setSelectedPortal] = useState<'student' | 'admin'>('student');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync defaultRole when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPortal(defaultRole || 'student');
      setMode('signin');
      setErrorMessage(null);
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let resolvedRole: 'student' | 'admin' = 'student';

      if (selectedPortal === 'admin') {
        // Admin Portal Sign In
        const res = await login(email.trim(), password);
        resolvedRole = res.role;

        // Strict role validation: Ensure user actually holds admin privileges
        const isPermittedAdmin =
          resolvedRole === 'admin' ||
          res.user.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com';

        if (!isPermittedAdmin) {
          await logout();
          throw new Error(
            'Access Restricted: This account does not possess Campus Safety Administration privileges. Please switch to the Student Portal.'
          );
        }
      } else {
        // Student Portal
        if (mode === 'signin') {
          const res = await login(email.trim(), password);
          resolvedRole = res.role;
        } else {
          if (!displayName.trim()) {
            throw new Error('Please enter your full name for student registration.');
          }
          const res = await signup(email.trim(), password, displayName.trim(), 'student');
          resolvedRole = res.role;
        }
      }

      onClose();
      onSuccess?.(resolvedRole);
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const isOperationNotAllowed =
        err.code === 'auth/operation-not-allowed' ||
        (err.message && err.message.includes('auth/operation-not-allowed')) ||
        (err.message && err.message.includes('disabled in your Firebase project console'));

      if (isOperationNotAllowed) {
        setErrorMessage(
          'Email/Password sign-in method is currently disabled in your Firebase project console. Please enable Email/Password under Authentication -> Sign-in method.'
        );
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setErrorMessage(
          selectedPortal === 'admin'
            ? 'Invalid administrative credentials. Please verify your designated safety email and password.'
            : 'Invalid email or password. If you do not have an account yet, switch to the "Create Account" tab.'
        );
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please switch to "Sign In".');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dedicated Portal Headers */}
        <div className="text-center space-y-1.5 pt-1">
          {selectedPortal === 'student' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center mx-auto shadow-xs border border-[#2E7D6B]/15">
                <GraduationCap className="w-6 h-6 text-[#2E7D6B]" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#2E7D6B] text-[10px] font-bold uppercase tracking-wider">
                Student Safety Portal
              </div>
              <h3 className="font-extrabold text-2xl text-[#1E293B] tracking-tight">
                {mode === 'signin' ? 'Student Sign In' : 'Create Student Account'}
              </h3>
              <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                {mode === 'signin'
                  ? 'Sign in to submit emergency alerts and monitor live dispatch progress.'
                  : 'Register with your university credentials to verify emergency reports.'}
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-sm border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Authorized Personnel Only
              </div>
              <h3 className="font-extrabold text-2xl text-[#0F172A] tracking-tight">
                Campus Admin Console
              </h3>
              <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                Incident command center for authorized campus safety dispatchers and responders.
              </p>
            </>
          )}
        </div>

        {/* Sub-mode switcher for Student Portal */}
        {selectedPortal === 'student' && (
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Admin Security Clearance Notice Box */}
        {selectedPortal === 'admin' && (
          <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-xs text-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Restricted Administrative Dispatch Console</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Designated campus safety administrator credentials required. All access and actions are strictly audited.
            </p>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {selectedPortal === 'student' && mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full pl-10 pr-4 py-2.5 text-sm input-sage"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {selectedPortal === 'admin' ? 'Administrative Email' : 'University Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedPortal === 'admin'
                    ? 'admin@campus-safety.edu'
                    : 'student@university.edu'
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm input-sage"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm input-sage"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              selectedPortal === 'admin'
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/25 ring-1 ring-emerald-500/30'
                : 'bg-[#2E7D6B] hover:bg-[#256859] shadow-[#2E7D6B]/25'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {selectedPortal === 'admin'
                    ? 'Authenticate Admin Console'
                    : mode === 'signin'
                    ? 'Sign In to Student Portal'
                    : 'Create Student Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Portal Switcher Link at Bottom */}
        <div className="pt-2 text-center border-t border-slate-100">
          {selectedPortal === 'student' ? (
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('admin');
                setMode('signin');
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Campus Safety Responder or Admin? <strong>Sign In to Admin Portal →</strong></span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('student');
                setMode('signin');
                setErrorMessage(null);
              }}
              className="text-xs text-[#2E7D6B] hover:text-[#256859] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#2E7D6B]" />
              <span>Student or Faculty Member? <strong>Sign In to Student Portal →</strong></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
