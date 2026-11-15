import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
  Check,
  Loader2,
  AlertTriangle,
  Flame,
  HeartPulse,
  Shield,
  Search,
  Filter,
  Eye,
  Mail,
  MessageSquare,
  Sparkles,
  Lock,
  X,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { EmergencyReport, ReportStatus } from '../types';
import {
  calculateReportStats,
  filterReports,
  getStatusBadgeConfig,
  getEmergencyTypeInfo,
} from '../utils/reportLogic';
import { getDispatchHistory } from '../services/emailService';
import { EMAIL_CONFIG } from '../config/emailConfig';

interface AdminDashboardProps {
  onOpenAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAuth }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const effectiveIsAdmin = Boolean(
    isAdmin || currentUser?.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com'
  );
  const { reports, updateReportStatus, deleteReport } = useReports();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active report for editing admin note
  const [editingNoteReport, setEditingNoteReport] = useState<EmergencyReport | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  // Selected status draft map and update success feedback
  const [selectedStatusMap, setSelectedStatusMap] = useState<Record<string, ReportStatus>>({});
  const [updatedSuccessMap, setUpdatedSuccessMap] = useState<Record<string, boolean>>({});

  // Dispatched email audit drawer
  const [showEmailAudit, setShowEmailAudit] = useState<boolean>(false);

  const stats = calculateReportStats(reports);
  const filteredReports = filterReports(reports, {
    status: statusFilter,
    type: typeFilter,
    searchQuery,
  });

  const emailDispatches = getDispatchHistory();

  const handleStatusChange = async (reportId: string, explicitStatus?: ReportStatus) => {
    const report = reports.find((r: EmergencyReport) => r.id === reportId);
    const newStatus = explicitStatus || selectedStatusMap[reportId] || report?.status || 'NEW';
    setIsUpdatingStatus(reportId);
    try {
      await updateReportStatus(reportId, newStatus);
      setSelectedStatusMap((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
      setUpdatedSuccessMap((prev) => ({ ...prev, [reportId]: true }));
      setTimeout(() => {
        setUpdatedSuccessMap((prev) => ({ ...prev, [reportId]: false }));
      }, 2500);
    } catch (err: any) {
      console.error('Failed to update status in Firestore:', err);
      alert(`Status update failed: ${err.message || 'Firestore update permission denied'}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleQuickDispatch = async (reportId: string, unitNote: string) => {
    setIsUpdatingStatus(reportId);
    try {
      await updateReportStatus(reportId, 'ACKNOWLEDGED', unitNote);
      setSelectedStatusMap((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
      setUpdatedSuccessMap((prev) => ({ ...prev, [reportId]: true }));
      setTimeout(() => {
        setUpdatedSuccessMap((prev) => ({ ...prev, [reportId]: false }));
      }, 2500);
    } catch (err: any) {
      console.error('Failed to dispatch unit:', err);
      alert(`Dispatch failed: ${err.message || 'Permission denied'}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this emergency report?')) {
      return;
    }
    setDeletingReportId(reportId);
    try {
      await deleteReport(reportId);
    } catch (err: any) {
      console.error('Failed to delete report from Firestore:', err);
      alert(`Deletion failed: ${err.message || 'Firestore delete permission denied'}`);
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!editingNoteReport) return;
    try {
      await updateReportStatus(editingNoteReport.id, editingNoteReport.status, noteText);
      setEditingNoteReport(null);
      setNoteText('');
    } catch (e) {
      console.error('Note update failed:', e);
    }
  };

  // Immediate RBAC redirect if non-admin reaches dashboard
  useEffect(() => {
    if (!loading && !effectiveIsAdmin) {
      window.location.hash = '#/';
    }
  }, [effectiveIsAdmin, loading]);

  if (!loading && !effectiveIsAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#2E7D6B] text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span>Live Firestore Real-Time Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Campus Emergency Monitoring Console
          </h1>
          <p className="text-sm text-[#64748B]">
            Real-time incident dispatch, status tracking, and automated administrator alert logs.
          </p>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowEmailAudit(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2E7D6B] bg-[#E6F4F1] hover:bg-[#d6f0ea] border border-[#2E7D6B]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Admin Email Audit ({emailDispatches.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="card-soft p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Reports</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#1E293B]">{stats.total}</div>
          <div className="text-[11px] text-slate-500">All recorded campus incidents</div>
        </div>

        {/* New Alerts (Red with Gentle Pulse) */}
        <div className="card-soft p-5 bg-white border-red-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-red-600 font-semibold uppercase tracking-wider">
            <span>New Alerts</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse-gentle" />
          </div>
          <div className="text-3xl font-extrabold text-[#B91C1C] flex items-center gap-2">
            {stats.newCount}
            {stats.newCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse-gentle">
                Action Required
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting acknowledgement</div>
        </div>

        {/* Acknowledged Alerts */}
        <div className="card-soft p-5 bg-white border-amber-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <span>Acknowledged</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.acknowledgedCount}</div>
          <div className="text-[11px] text-slate-500">Responders dispatched / in progress</div>
        </div>

        {/* Resolved Alerts */}
        <div className="card-soft p-5 bg-white border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#15803D]">{stats.resolvedCount}</div>
          <div className="text-[11px] text-slate-500">Incidents cleared and closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-soft p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'NEW', 'ACKNOWLEDGED', 'RESOLVED'] as string[]).map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? st === 'NEW'
                      ? 'bg-[#FEE2E2] text-[#B91C1C] border border-red-300'
                      : st === 'ACKNOWLEDGED'
                      ? 'bg-[#FEF3C7] text-[#B45309] border border-amber-300'
                      : st === 'RESOLVED'
                      ? 'bg-[#DCFCE7] text-[#15803D] border border-emerald-300'
                      : 'bg-[#2E7D6B] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            );
          })}
        </div>

        {/* Search and Type Dropdown */}
        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#2E7D6B]"
          >
            <option value="ALL">All Incident Types</option>
            <option value="Medical">Medical</option>
            <option value="Fire">Fire / Smoke</option>
            <option value="Security">Security</option>
            <option value="Hazard">Hazard</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D6B]"
            />
          </div>
        </div>
      </div>

      {/* Reports Table & Feed */}
      <div className="card-soft bg-white overflow-hidden shadow-xs border border-slate-200/90">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800">Incident Reports Feed</h3>
            <span className="text-xs text-slate-400">({filteredReports.length} showing)</span>
          </div>
          <span className="text-xs text-slate-500">Live Snapshot Connected</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="text-base font-bold text-slate-800">No Incidents Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no reports matching the selected filters. Change filter options or submit a new alert.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => {
              const statusCfg = getStatusBadgeConfig(report.status);
              const typeCfg = getEmergencyTypeInfo(report.type);
              const isUpdating = isUpdatingStatus === report.id;

              return (
                <div
                  key={report.id}
                  className="p-5 sm:p-6 hover:bg-[#F8FAFC]/80 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Type, Location, Time */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Emergency Type Badge */}
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border"
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
                          <span>{report.type}</span>
                        </span>

                        {/* Urgency */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            report.urgency === 'Critical'
                              ? 'bg-red-600 text-white'
                              : report.urgency === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {report.urgency || 'High'} Urgency
                        </span>

                        {/* ID */}
                        <span className="text-[11px] font-mono text-slate-400">
                          #{report.id.slice(0, 8)}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 pt-0.5">
                        <MapPin className="w-4 h-4 text-[#2E7D6B] shrink-0" />
                        <span>{report.location}</span>
                      </div>
                    </div>

                    {/* Right: Current Status Badge & Interactive Selector */}
                    <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 shrink-0">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                          statusCfg.pulse ? 'animate-pulse-gentle' : ''
                        }`}
                        style={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.text,
                          borderColor: statusCfg.border,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: statusCfg.dotColor }}
                        />
                        <span>{statusCfg.label}</span>
                      </span>

                      {/* Interactive Status Selector & Dedicated Update Button */}
                      <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                        {/* Status selector tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                          {(['NEW', 'ACKNOWLEDGED', 'RESOLVED'] as ReportStatus[]).map((targetStatus) => {
                            const isCurrentSelected =
                              (selectedStatusMap[report.id] || report.status) === targetStatus;
                            return (
                              <button
                                key={targetStatus}
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  setSelectedStatusMap((prev) => ({
                                    ...prev,
                                    [report.id]: targetStatus,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isCurrentSelected
                                    ? targetStatus === 'NEW'
                                      ? 'bg-red-600 text-white shadow-xs font-extrabold'
                                      : targetStatus === 'ACKNOWLEDGED'
                                      ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                                      : 'bg-emerald-600 text-white shadow-xs font-extrabold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                } disabled:opacity-60`}
                              >
                                {targetStatus === 'NEW'
                                  ? 'New'
                                  : targetStatus === 'ACKNOWLEDGED'
                                  ? 'Ack'
                                  : 'Resolve'}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explicit Update Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(report.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            updatedSuccessMap[report.id]
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                              : selectedStatusMap[report.id] && selectedStatusMap[report.id] !== report.status
                              ? 'bg-[#2E7D6B] hover:bg-[#236354] text-white ring-2 ring-[#2E7D6B]/30 animate-pulse-gentle'
                              : 'bg-slate-800 hover:bg-slate-900 text-white'
                          } disabled:opacity-60`}
                          title="Update report status permanently"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : updatedSuccessMap[report.id] ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Updated!</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                    {report.description}
                  </div>

                  {/* Quick Dispatch Action Strip */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 shrink-0">
                      Deploy Responders:
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleQuickDispatch(
                          report.id,
                          `Campus Police Patrol Unit dispatched to ${report.location}. Responders en route.`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200/80 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Quick dispatch Campus Police & Security"
                    >
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>Deploy Police</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleQuickDispatch(
                          report.id,
                          `University EMS Ambulance & First Responders deployed to ${report.location}.`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200/80 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Quick dispatch Medical EMS"
                    >
                      <HeartPulse className="w-3 h-3 text-red-600" />
                      <span>Deploy EMS</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleQuickDispatch(
                          report.id,
                          `Emergency Fire & Hazard Team deployed to ${report.location}.`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200/80 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Quick dispatch Hazard & Fire"
                    >
                      <Flame className="w-3 h-3 text-amber-600" />
                      <span>Deploy Hazmat</span>
                    </button>
                  </div>

                  {/* Admin Notes if present */}
                  {report.adminNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Responder Note:</span> {report.adminNotes}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata & actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(report.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </span>

                      <span>
                        Reported by:{' '}
                        <strong className="text-slate-700">
                          {report.submittedByName || report.submittedByEmail || 'Campus Student'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Add/Edit Note button */}
                      <button
                        onClick={() => {
                          setEditingNoteReport(report);
                          setNoteText(report.adminNotes || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#E6F4F1] hover:bg-[#d4ece7] text-[#2E7D6B] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{report.adminNotes ? 'Edit Note' : 'Add Note'}</span>
                      </button>

                      {/* Admin Delete Report Option */}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={deletingReportId === report.id}
                        title="Permanently Delete Report"
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>{deletingReportId === report.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Adding/Editing Admin Note */}
      {editingNoteReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-800">
                Responder Memo / Dispatch Note
              </h4>
              <button
                onClick={() => setEditingNoteReport(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Attach internal resolution details or response unit coordinates for incident #{editingNoteReport.id.slice(0, 8)}.
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Dispatch Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `Campus Police Unit 3 dispatched to ${editingNoteReport.location}. ETA 3 mins.`,
                  `University EMS Ambulance & Paramedics en route to ${editingNoteReport.location}.`,
                  `Emergency Fire & Hazmat team assessing ${editingNoteReport.location}.`,
                  `Perimeter secured. Responders actively containing scene.`,
                  `Incident contained and campus area declared safe and secure.`,
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoteText(tmpl)}
                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer text-left"
                  >
                    {idx === 0 && '🚓 Police Unit ETA 3m'}
                    {idx === 1 && '🚑 EMS En Route'}
                    {idx === 2 && '🚒 Fire/Hazmat'}
                    {idx === 3 && '⚠️ Perimeter Secured'}
                    {idx === 4 && '✅ All Clear'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Officer Davis arrived at 10:45 AM. Situation contained."
              className="w-full p-3 text-sm input-sage"
              maxLength={1000}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNoteReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdminNote}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2E7D6B] hover:bg-[#256859] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Email Audit Drawer / Modal */}
      {showEmailAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#2E7D6B] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Automated Admin Email Alerts</h3>
                  <p className="text-xs text-slate-500">
                    Audit log of emails triggered via EmailJS to {EMAIL_CONFIG.adminEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailAudit(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Email Trigger Configuration:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  Recipient: <span className="font-mono text-slate-700">{EMAIL_CONFIG.adminEmail}</span>
                </div>
                <div>
                  Service ID: <span className="font-mono text-slate-700">{EMAIL_CONFIG.serviceId}</span>
                </div>
                <div>
                  Template: <span className="font-mono text-slate-700">{EMAIL_CONFIG.templateId}</span>
                </div>
                <div>
                  Status:{' '}
                  <span className="font-semibold text-emerald-700">
                    {EMAIL_CONFIG.simulateInDev ? 'Active (Development Simulation & Audit)' : 'Live EmailJS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email list */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {emailDispatches.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No automated emails dispatched yet. Submit a new emergency alert to see the email trigger log.
                </div>
              ) : (
                emailDispatches.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{disp.subject}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          disp.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : disp.status === 'SIMULATED'
                            ? 'bg-[#E6F4F1] text-[#2E7D6B]'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {disp.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{disp.preview}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>To: {disp.recipient}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(disp.recipient)}&su=${encodeURIComponent(disp.subject)}&body=${encodeURIComponent(disp.preview)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2E7D6B] font-bold hover:underline"
                        >
                          Send via Gmail ↗
                        </a>
                        <span>•</span>
                        <span>{new Date(disp.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowEmailAudit(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Close Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
