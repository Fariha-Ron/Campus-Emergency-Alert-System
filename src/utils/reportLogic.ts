import { EmergencyReport, EmergencyType, ReportStatus, ReportStats, UrgencyLevel } from '../types';

/**
 * Validates allowed transitions between alert statuses
 */
export function isValidStatusTransition(current: ReportStatus, target: ReportStatus): boolean {
  if (current === target) return true;
  if (current === 'NEW') {
    return target === 'ACKNOWLEDGED' || target === 'RESOLVED';
  }
  if (current === 'ACKNOWLEDGED') {
    return target === 'RESOLVED' || target === 'NEW';
  }
  if (current === 'RESOLVED') {
    // Admin reopening incident
    return target === 'ACKNOWLEDGED' || target === 'NEW';
  }
  return false;
}

/**
 * Calculates aggregate stats for reports
 */
export function calculateReportStats(reports: EmergencyReport[]): ReportStats {
  const stats: ReportStats = {
    total: reports.length,
    newCount: 0,
    acknowledgedCount: 0,
    resolvedCount: 0,
    criticalCount: 0,
  };

  for (const r of reports) {
    if (r.status === 'NEW') stats.newCount++;
    else if (r.status === 'ACKNOWLEDGED') stats.acknowledgedCount++;
    else if (r.status === 'RESOLVED') stats.resolvedCount++;

    if (r.urgency === 'Critical' || (r.type === 'Fire' && r.status !== 'RESOLVED')) {
      stats.criticalCount++;
    }
  }

  return stats;
}

/**
 * Derives default urgency if user hasn't explicitly chosen one
 */
export function classifyUrgency(type: EmergencyType, description: string): UrgencyLevel {
  const text = (description || '').toLowerCase();
  if (
    text.includes('unconscious') ||
    text.includes('weapon') ||
    text.includes('active shooter') ||
    text.includes('explosion') ||
    text.includes('trapped')
  ) {
    return 'Critical';
  }
  if (type === 'Fire' || type === 'Security') {
    return 'High';
  }
  if (type === 'Medical') {
    return 'High';
  }
  return 'Medium';
}

/**
 * Filters and searches reports
 */
export function filterReports(
  reports: EmergencyReport[],
  options: {
    status?: string;
    type?: string;
    searchQuery?: string;
  }
): EmergencyReport[] {
  const { status, type, searchQuery } = options;
  const q = (searchQuery || '').trim().toLowerCase();

  return reports.filter((r) => {
    if (status && status !== 'ALL' && r.status !== status) {
      return false;
    }
    if (type && type !== 'ALL' && r.type !== type) {
      return false;
    }
    if (q) {
      const matchLocation = r.location.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      const matchUser = (r.submittedByEmail || '').toLowerCase().includes(q);
      const matchId = (r.id || '').toLowerCase().includes(q);
      if (!matchLocation && !matchDesc && !matchType && !matchUser && !matchId) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Design-style badge metadata according to guidelines:
 * NEW: Warm Coral / Soft Red (#FEE2E2 bg, #B91C1C text) with pulse
 * ACKNOWLEDGED: Warm Amber / Honey (#FEF3C7 bg, #B45309 text)
 * RESOLVED: Calming Mint Green (#DCFCE7 bg, #15803D text)
 */
export function getStatusBadgeConfig(status: ReportStatus) {
  switch (status) {
    case 'NEW':
      return {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: 'rgba(185, 28, 28, 0.2)',
        label: 'NEW',
        pulse: true,
        dotColor: '#DC2626',
        description: 'Awaiting responder acknowledgement',
      };
    case 'ACKNOWLEDGED':
      return {
        bg: '#FEF3C7',
        text: '#B45309',
        border: 'rgba(180, 83, 9, 0.2)',
        label: 'ACKNOWLEDGED',
        pulse: false,
        dotColor: '#D97706',
        description: 'Campus security/medical team notified & responding',
      };
    case 'RESOLVED':
      return {
        bg: '#DCFCE7',
        text: '#15803D',
        border: 'rgba(21, 128, 61, 0.2)',
        label: 'RESOLVED',
        pulse: false,
        dotColor: '#16A34A',
        description: 'Incident addressed and cleared',
      };
  }
}

export function getEmergencyTypeInfo(type: EmergencyType) {
  switch (type) {
    case 'Medical':
      return {
        label: 'Medical Emergency',
        color: '#DC2626',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        defaultUrgency: 'High' as UrgencyLevel,
        instruction: 'If person is unconscious or not breathing, call 911 immediately.',
      };
    case 'Fire':
      return {
        label: 'Fire / Smoke',
        color: '#EA580C',
        bgColor: '#FFF7ED',
        borderColor: '#FED7AA',
        defaultUrgency: 'Critical' as UrgencyLevel,
        instruction: 'Evacuate via nearest fire exit. Do not use elevators.',
      };
    case 'Security':
      return {
        label: 'Security / Threat',
        color: '#7C3AED',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
        defaultUrgency: 'High' as UrgencyLevel,
        instruction: 'Move to a locked, safe area if threatened. Keep phone on silent.',
      };
    case 'Hazard':
      return {
        label: 'Physical Hazard',
        color: '#D97706',
        bgColor: '#FFFBEB',
        borderColor: '#FDE68A',
        defaultUrgency: 'Medium' as UrgencyLevel,
        instruction: 'Keep safe distance from chemical spills, downed wires, or structural damage.',
      };
  }
}
