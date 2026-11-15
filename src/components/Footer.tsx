import React from 'react';
import { ShieldAlert, Mail, PhoneCall, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 relative z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: System Branding */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2E7D6B] flex items-center justify-center text-white shadow-xs">
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

          {/* Column 2: Quick Navigation */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              QUICK NAVIGATION
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#2E7D6B] transition-colors cursor-pointer text-left"
                >
                  Campus Safety Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('report')}
                  className="hover:text-[#2E7D6B] transition-colors cursor-pointer text-left"
                >
                  Submit Emergency Alert
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Responder Dispatch */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              RESPONDER DISPATCH
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2E7D6B] shrink-0" />
                <span className="truncate">Automated Admin Dispatch Active</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Campus Police: (555) 0199</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Student Health EMS: (555) 0112</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Live Telemetry Badge */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 University Safety Division • Campus Emergency Alert System
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              Live Firestore Telemetry Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
