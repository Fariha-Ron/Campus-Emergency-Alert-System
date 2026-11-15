import React, { useState } from 'react';
import {
  PhoneCall,
  X,
  Shield,
  HeartPulse,
  Flame,
  AlertTriangle,
  LifeBuoy,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItem {
  id: string;
  name: string;
  department: string;
  phone: string;
  cleanPhone: string;
  badge: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  badgeStyle: string;
  isPrimary?: boolean;
}

const EMERGENCY_CONTACTS: ContactItem[] = [
  {
    id: 'police',
    name: 'Campus Police & Armed Response',
    department: 'Campus Dispatch Station 1 • 24/7 Patrol',
    phone: '(555) 0199',
    cleanPhone: '555-0199',
    badge: 'Primary Dispatch',
    icon: Shield,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200 bg-red-50/70 hover:bg-red-50',
    badgeStyle: 'bg-red-100 text-red-800 border-red-200',
    isPrimary: true,
  },
  {
    id: 'health',
    name: 'Student Health Center (EMS)',
    department: 'Urgent Medical Triage & Paramedic Unit',
    phone: '(555) 0112',
    cleanPhone: '555-0112',
    badge: 'Medical Emergency',
    icon: HeartPulse,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-[#2E7D6B]',
    borderColor: 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50',
    badgeStyle: 'bg-emerald-100 text-[#1B5749] border-emerald-200',
  },
  {
    id: 'fire',
    name: 'Fire Safety & Physical Plant',
    department: 'Facilities & Hazardous Materials (Hazmat)',
    phone: '(555) 0144',
    cleanPhone: '555-0144',
    badge: 'Fire & Hazmat',
    icon: Flame,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200 bg-amber-50/70 hover:bg-amber-50',
    badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'crisis',
    name: 'Crisis & Mental Health Hotline',
    department: 'Confidential Counselor on Duty • 24/7 Support',
    phone: '(555) 0188',
    cleanPhone: '555-0188',
    badge: 'Crisis Support',
    icon: LifeBuoy,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200 bg-blue-50/70 hover:bg-blue-50',
    badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200',
  },
];

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              24/7 Rapid Response
            </div>
            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
              Campus Emergency Numbers
            </h3>
            <p className="text-xs text-slate-500">
              Immediate telephone dispatch for university emergencies
            </p>
          </div>
        </div>

        {/* 911 Emergency Alert Notice */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-red-200">
              Immediate Life-Threatening Situation
            </div>
            <div className="text-sm font-bold">Call National Emergency (911) Directly</div>
          </div>
          <a
            href="tel:911"
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-black shadow-xs shrink-0 transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>Dial 911</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-3">
          {EMERGENCY_CONTACTS.map((contact) => {
            const Icon = contact.icon;
            const isCopied = copiedId === contact.id;

            return (
              <div
                key={contact.id}
                className={`p-3.5 sm:p-4 rounded-2xl border ${contact.borderColor} transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${contact.iconBg} ${contact.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{contact.name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${contact.badgeStyle}`}
                      >
                        {contact.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{contact.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(contact.id, contact.phone)}
                    className="p-2 text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white rounded-xl border border-slate-200/80 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Copy phone number"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] font-semibold text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${contact.cleanPhone}`}
                    className="px-3.5 py-2 bg-[#2E7D6B] hover:bg-[#256859] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>University Safety Division Dispatch</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
