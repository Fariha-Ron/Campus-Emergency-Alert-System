import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Flame,
  Shield,
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  ShieldAlert,
  Loader2,
  ArrowRight,
  Info,
  Lock,
  LogIn,
} from 'lucide-react';
import { EmergencyType, UrgencyLevel, EmergencyReport } from '../types';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { getEmergencyTypeInfo } from '../utils/reportLogic';

interface ReportFormProps {
  initialType?: EmergencyType;
  onSuccessNavigate?: (tab: string) => void;
  onOpenAuth?: () => void;
}

const CAMPUS_LOCATION_PRESETS = [
  'Main Library, 2nd Floor',
  'Science Complex, Lab Wing',
  'Student Union & Cafeteria',
  'North Residence Hall B',
  'West Campus Parking Garage',
  'Athletic Center & Gym',
  'Engineering Building A',
];

export const ReportForm: React.FC<ReportFormProps> = ({ initialType = 'Medical', onSuccessNavigate, onOpenAuth }) => {
  const { currentUser, isAdmin } = useAuth();
  const { submitReport } = useReports();

  const [type, setType] = useState<EmergencyType>(initialType);
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');

  const typeConfig = getEmergencyTypeInfo(type);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<EmergencyReport | null>(null);
  const [emailNotice, setEmailNotice] = useState<{
    mode: string;
    message: string;
    gmailUrl?: string;
    mailtoUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (initialType) {
      setType(initialType);
      if (initialType === 'Fire') setUrgency('Critical');
      else if (initialType === 'Hazard') setUrgency('Medium');
      else setUrgency('High');
    }
  }, [initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage('Authentication required: You must be signed in to submit an emergency alert.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please specify the campus location of the incident.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the situation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReport({
        type,
        location: location.trim(),
        description: description.trim(),
        urgency,
      });

      setSubmittedReport(result.report);
      setEmailNotice({
        mode: result.emailResult.mode,
        message: result.emailResult.message,
        gmailUrl: result.emailResult.gmailUrl,
        mailtoUrl: result.emailResult.mailtoUrl,
      });

      // Clear form inputs
      setLocation('');
      setDescription('');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit report. Please try again or call emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If visitor is not authenticated, show authentication required screen
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
        <div className="card-soft p-8 sm:p-10 text-center bg-white border border-slate-200/90 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-[#2E7D6B]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#1E293B]">
              Authentication Required to Report
            </h2>
            <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
              To verify incident authenticity and ensure rapid responder coordination, students and faculty must sign in with their university account before submitting an emergency alert.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Facing an immediate life-threatening emergency?</strong> Call <strong>911</strong> or Campus Police directly at <strong>(555) 0199</strong> without waiting for account sign-in.
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Submit Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If report was just submitted, show calming confirmation screen
  if (submittedReport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="card-soft p-8 sm:p-10 bg-white border border-emerald-200 shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D6B]">
                Incident Logged Successfully
              </span>
              <h2 className="text-2xl font-extrabold text-[#1E293B]">Emergency Alert Dispatched</h2>
              <p className="text-xs text-[#64748B]">Reference ID: #{submittedReport.id.slice(0, 10)}</p>
            </div>
          </div>

          {/* Reassurance Banner */}
          <div className="p-4 rounded-xl bg-[#E6F4F1] border border-[#2E7D6B]/20 text-[#2E7D6B] space-y-1">
            <div className="font-semibold text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#10B981]" />
              Responders are notified and the alert is currently marked as NEW
            </div>
            <p className="text-xs text-[#2E7D6B]/90 leading-relaxed">
              University Campus Safety, building monitors, and designated dispatch staff have received your incident details.
            </p>
          </div>

          {/* Automated Campus Dispatch Notification Status */}
          <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <MailCheck className="w-4 h-4 text-[#2E7D6B]" />
                <span>Automated Administrator Dispatch</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                EMAIL DISPATCHED
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-ping shrink-0" />
              <div>
                <p className="font-semibold text-emerald-950">
                  Emergency notification email automatically dispatched to Campus Safety Administration.
                </p>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Please stand by while response authorities review the alert and coordinate units. You can track real-time dispatch progress below.
                </p>
              </div>
            </div>
          </div>

          {/* Incident Summary Card */}
          <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submitted Incident Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Incident Type</span>
                <span className="font-semibold text-slate-800">{submittedReport.type}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Urgency</span>
                <span className="font-semibold text-red-700">{submittedReport.urgency}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-800">{submittedReport.location}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Description</span>
                <p className="text-xs text-slate-700 mt-0.5">{submittedReport.description}</p>
              </div>
            </div>
          </div>

          {/* Safety next steps */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-700" />
              What you should do next:
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
              <li>Stay in a safe location unless you must evacuate immediately.</li>
              <li>Keep your phone line open in case responders call for clarification.</li>
              <li>If the situation escalates rapidly, do not hesitate to call 911.</li>
            </ul>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onSuccessNavigate && (
              <button
                onClick={() =>
                  onSuccessNavigate(isAdmin ? 'admin' : 'my-reports')
                }
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {isAdmin ? 'View on Admin Dashboard' : 'Track in My Reports'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedReport(null);
                setEmailNotice(null);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#2E7D6B] text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Real-Time University Emergency Form</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
          Report an Emergency or Campus Hazard
        </h1>
        <p className="text-sm text-[#64748B]">
          Fill in the details below. Responders receive live notifications and automated email alerts.
        </p>
      </div>

      {/* Immediate danger banner */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold block mb-0.5">Are you in immediate life-threatening danger?</strong>
          Please call <strong>911</strong> or Campus Police directly at <strong>(555) 0199</strong> before submitting an online report.
        </div>
      </div>

      {/* Main Form Card (Photo upload section removed) */}
      <form onSubmit={handleSubmit} className="card-soft p-6 sm:p-8 bg-white space-y-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Emergency Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Select Emergency Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Medical */}
            <button
              type="button"
              onClick={() => {
                setType('Medical');
                setUrgency('High');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                type === 'Medical'
                  ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Medical</div>
                <div className="text-[10px] text-slate-500">Injury, fainting, illness</div>
              </div>
            </button>

            {/* Fire */}
            <button
              type="button"
              onClick={() => {
                setType('Fire');
                setUrgency('Critical');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                type === 'Fire'
                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Fire / Smoke</div>
                <div className="text-[10px] text-slate-500">Visible smoke, fire</div>
              </div>
            </button>

            {/* Security */}
            <button
              type="button"
              onClick={() => {
                setType('Security');
                setUrgency('High');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                type === 'Security'
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Security</div>
                <div className="text-[10px] text-slate-500">Threat, intruder, theft</div>
              </div>
            </button>

            {/* Hazard */}
            <button
              type="button"
              onClick={() => {
                setType('Hazard');
                setUrgency('Medium');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                type === 'Hazard'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Hazard</div>
                <div className="text-[10px] text-slate-500">Spill, leak, wire, lift</div>
              </div>
            </button>
          </div>

          {/* Type instruction chip */}
          <div className="mt-2.5 p-2.5 rounded-lg text-xs bg-slate-50 border border-slate-200/80 text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2E7D6B] shrink-0" />
            <span>{typeConfig.instruction}</span>
          </div>
        </div>

        {/* 2. Campus Location */}
        <div>
          <label htmlFor="location-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Campus Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              id="location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Complex, 2nd Floor, Room 204"
              className="w-full pl-10 pr-4 py-2.5 text-sm input-sage"
              maxLength={200}
              required
            />
          </div>

          {/* Quick campus presets */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Quick presets:</span>
            {CAMPUS_LOCATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setLocation(preset)}
                className="px-2 py-1 text-[11px] rounded-md bg-slate-100 hover:bg-[#E6F4F1] hover:text-[#2E7D6B] text-slate-600 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Incident Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="desc-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Description of Incident <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">{description.length} / 2000</span>
          </div>
          <textarea
            id="desc-input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what is happening, how many people are affected, and any immediate hazards responders should know about..."
            className="w-full px-3.5 py-2.5 text-sm input-sage"
            maxLength={2000}
            required
          />
        </div>

        {/* 4. Urgency Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            4. Estimated Urgency Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Critical'] as UrgencyLevel[]).map((lvl) => {
              const isSelected = urgency === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUrgency(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    isSelected
                      ? lvl === 'Critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : lvl === 'High'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : lvl === 'Medium'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submitter Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div>
            Submitting as:{' '}
            <strong className="text-slate-800">
              {currentUser?.displayName || currentUser?.email || 'Campus Student (Guest Mode)'}
            </strong>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Encrypted Dispatch
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl text-base font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Dispatching Alert to University Responders...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Emergency Alert Now</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Upon submission, an instant automated email alert is dispatched to designated safety administrators.
          </p>
        </div>
      </form>
    </div>
  );
};
