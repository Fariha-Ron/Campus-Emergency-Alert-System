import React, { useState } from 'react';
import {
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Flame,
  Shield,
  AlertTriangle,
  PlusCircle,
  Radio,
  Check,
  AlertCircle,
  PhoneCall,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { getStatusBadgeConfig, getEmergencyTypeInfo } from '../utils/reportLogic';
import { EmergencyReport } from '../types';

interface MyReportsProps {
  onNavigateToReport: () => void;
  onOpenAuth?: () => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onNavigateToReport, onOpenAuth }) => {
  const { currentUser } = useAuth();
  const { reports } = useReports();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in-up text-center">
        <div className="card-soft p-8 sm:p-12 bg-white space-y-5 border border-slate-200/80 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center mx-auto shadow-xs border border-[#2E7D6B]/15">
            <GraduationCap className="w-8 h-8 text-[#2E7D6B]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              Student Incident Portal Authentication Required
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Please sign in with your student account to access your submitted incident history, track live authority triage, and monitor responder personnel dispatch.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 cursor-pointer"
            >
              Sign In to Student Portal
            </button>
            <button
              onClick={onNavigateToReport}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Submit Emergency Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter reports submitted by the current authenticated student
  const studentReports = reports.filter((r: EmergencyReport) => {
    if (!currentUser) return true;
    return (
      r.submittedBy === currentUser.uid ||
      (r.submittedByEmail && r.submittedByEmail.toLowerCase() === currentUser.email?.toLowerCase())
    );
  });

  // Filter by status tab
  const filteredReports = studentReports.filter((r) => {
    if (filter === 'ACTIVE') return r.status === 'NEW' || r.status === 'ACKNOWLEDGED';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const activeCount = studentReports.filter((r) => r.status !== 'RESOLVED').length;
  const resolvedCount = studentReports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in-up">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#2E7D6B] text-xs font-semibold mb-1 border border-[#2E7D6B]/15">
            <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span>Student Incident Command Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            My Emergency Reports & Dispatch Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Monitor real-time authority triage, responder personnel deployment, and official safety memos.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Alert</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card-soft p-4 bg-white space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Alerts
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
            {studentReports.length}
          </div>
        </div>

        <div className="card-soft p-4 bg-white border-amber-200/80 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
            <span>In Dispatch</span>
            {activeCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {activeCount}
          </div>
        </div>

        <div className="card-soft p-4 bg-white border-emerald-200/80 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Resolved / Safe
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D]">
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-[#2E7D6B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Reports ({studentReports.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ACTIVE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Active / Dispatched ({activeCount})
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'RESOLVED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 ? (
        <div className="card-soft p-12 text-center bg-white space-y-4 border border-slate-200/80">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center mx-auto shadow-xs border border-[#2E7D6B]/15">
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-slate-800">No Incidents Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {filter === 'ALL'
                ? "You haven't submitted any emergency reports yet. If you observe any safety concern or threat on campus, report it immediately."
                : `You currently have no ${filter.toLowerCase()} emergency reports on record.`}
            </p>
          </div>
          <button
            onClick={onNavigateToReport}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] transition-all shadow-md shadow-[#2E7D6B]/25 cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Emergency Report</span>
          </button>
        </div>
      ) : (
        /* Reports List */
        <div className="space-y-6">
          {filteredReports.map((report: EmergencyReport) => {
            const statusCfg = getStatusBadgeConfig(report.status);
            const typeCfg = getEmergencyTypeInfo(report.type);

            // 4 Authority Lifecycle Stages
            const isAcknowledged = report.status === 'ACKNOWLEDGED' || report.status === 'RESOLVED';
            const isResolved = report.status === 'RESOLVED';

            return (
              <div
                key={report.id}
                className="card-soft p-5 sm:p-7 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-5 rounded-2xl"
              >
                {/* Top Row: Category, Reference ID, Urgency, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border shadow-2xs"
                      style={{
                        backgroundColor: typeCfg.bgColor,
                        color: typeCfg.color,
                        borderColor: typeCfg.borderColor,
                      }}
                    >
                      {report.type === 'Medical' && <HeartPulse className="w-3.5 h-3.5" />}
                      {report.type === 'Fire' && <Flame className="w-3.5 h-3.5" />}
                      {report.type === 'Security' && <Shield className="w-3.5 h-3.5" />}
                      {report.type === 'Hazard' && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{report.type} Emergency</span>
                    </span>

                    <span className="text-xs font-mono text-slate-400 font-medium">
                      Ref #{report.id.slice(0, 8)}
                    </span>

                    {report.urgency && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Urgency: {report.urgency}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 border self-start sm:self-auto ${
                      statusCfg.pulse ? 'animate-pulse-gentle' : ''
                    }`}
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.text,
                      borderColor: statusCfg.border,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: statusCfg.dotColor }}
                    />
                    <span>{statusCfg.label}</span>
                  </span>
                </div>

                {/* Location & Reported Text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                    <MapPin className="w-4 h-4 text-[#2E7D6B] shrink-0" />
                    <span>{report.location}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                      Your Report Description
                    </strong>
                    {report.description}
                  </p>
                </div>

                {/* VISUAL 4-PHASE AUTHORITY DISPATCH PROGRESS STEPPER */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#2E7D6B]" />
                    <span>Authority Response & Dispatch Stepper</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {/* Stage 1: Alert Logged */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                      <div className="flex items-center justify-between text-emerald-800">
                        <span className="text-[11px] font-bold">1. Alert Logged</span>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-[10px] text-emerald-900/80">
                        Registered in central dispatch system
                      </p>
                      <div className="text-[10px] font-mono text-emerald-700 pt-0.5">
                        {new Date(report.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Stage 2: Triaged & Assigned */}
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isAcknowledged
                          ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
                          : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">2. Triage & Review</span>
                        {isAcknowledged ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-80">
                        {isAcknowledged
                          ? 'Reviewed by campus safety command'
                          : 'Evaluating urgency & responders'}
                      </p>
                      <div className="text-[10px] font-bold pt-0.5">
                        {isAcknowledged ? 'Completed' : 'In Review'}
                      </div>
                    </div>

                    {/* Stage 3: Responders Dispatched */}
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isResolved
                          ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
                          : report.status === 'ACKNOWLEDGED'
                          ? 'bg-blue-50/90 border-blue-300 text-blue-900 ring-2 ring-blue-400/30'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">3. Units Dispatched</span>
                        {isResolved ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : report.status === 'ACKNOWLEDGED' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-80">
                        {isResolved
                          ? 'Response teams arrived on site'
                          : report.status === 'ACKNOWLEDGED'
                          ? 'Responders deployed & en route'
                          : 'Awaiting unit dispatch'}
                      </p>
                      <div className="text-[10px] font-bold pt-0.5">
                        {isResolved
                          ? 'Arrived & Handled'
                          : report.status === 'ACKNOWLEDGED'
                          ? 'En Route / Active'
                          : 'Pending'}
                      </div>
                    </div>

                    {/* Stage 4: Scene Secured / Resolved */}
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isResolved
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">4. Scene Secured</span>
                        {isResolved ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-80">
                        {isResolved ? 'Situation contained & all clear' : 'Pending final resolution'}
                      </p>
                      <div className="text-[10px] font-bold pt-0.5">
                        {isResolved ? 'All Clear' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OFFICIAL DISPATCH CALLOUT & RESPONDER UPDATE */}
                <div className="pt-1">
                  {report.status === 'NEW' && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                          Alert Received • Dispatch Pending
                        </div>
                        <p className="text-xs text-amber-900/90 leading-relaxed">
                          Your emergency alert has been logged in central dispatch. Safety operators are triaging the coordinates and assigning response teams. Stay safe and keep your phone accessible.
                        </p>
                      </div>
                    </div>
                  )}

                  {report.status === 'ACKNOWLEDGED' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 text-blue-950 flex items-start gap-3 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            Official Responder Dispatch Notice
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                            Active Deployment
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-900 font-semibold leading-relaxed">
                          {report.adminNotes
                            ? report.adminNotes
                            : `Campus safety units have been dispatched to ${report.location}. Responders are en route.`}
                        </p>
                        <p className="text-[11px] text-blue-700">
                          Remain calm. If your physical safety is in immediate jeopardy, proceed to the nearest emergency blue-light station or call 911.
                        </p>
                      </div>
                    </div>
                  )}

                  {report.status === 'RESOLVED' && (
                    <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">
                          Incident Resolved & All Clear
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                          {report.adminNotes
                            ? report.adminNotes
                            : 'Campus safety responders have concluded on-site operations. The area has been declared safe and secured.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reported: {new Date(report.createdAt).toLocaleString()}</span>
                  </span>

                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                    <span className="font-semibold text-slate-700">Campus Police: (555) 0199</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
