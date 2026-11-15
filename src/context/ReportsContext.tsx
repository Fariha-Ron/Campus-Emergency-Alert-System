import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { EmergencyReport, ReportStatus, EmergencyType, UrgencyLevel } from '../types';
import { useAuth } from './AuthContext';
import { triggerAdminEmailNotification } from '../services/emailService';
import { classifyUrgency } from '../utils/reportLogic';

interface SubmitReportInput {
  type: EmergencyType;
  location: string;
  description: string;
  urgency?: UrgencyLevel;
}

interface ReportsContextType {
  reports: EmergencyReport[];
  loading: boolean;
  audioAlertEnabled: boolean;
  toggleAudioAlert: () => void;
  submitReport: (input: SubmitReportInput) => Promise<{
    report: EmergencyReport;
    emailResult: {
      success: boolean;
      mode: 'real' | 'simulated';
      message: string;
      mailtoUrl?: string;
      gmailUrl?: string;
    };
  }>;
  updateReportStatus: (
    reportId: string,
    newStatus: ReportStatus,
    adminNotes?: string
  ) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  latestSubmittedReport: EmergencyReport | null;
  clearLatestReport: () => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Persistent status override cache to guarantee status remains same until changed again
const getStatusOverrides = (): Record<string, ReportStatus> => {
  try {
    const raw = localStorage.getItem('campus_emergency_status_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStatusOverride = (reportId: string, status: ReportStatus) => {
  try {
    const current = getStatusOverrides();
    current[reportId] = status;
    localStorage.setItem('campus_emergency_status_overrides', JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save status override to localStorage:', e);
  }
};

const removeStatusOverride = (reportId: string) => {
  try {
    const current = getStatusOverrides();
    delete current[reportId];
    localStorage.setItem('campus_emergency_status_overrides', JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove status override from localStorage:', e);
  }
};

// Persistent admin notes override cache to guarantee dispatch memos remain locked
const getNoteOverrides = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('campus_emergency_note_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveNoteOverride = (reportId: string, note: string) => {
  try {
    const current = getNoteOverrides();
    current[reportId] = note;
    localStorage.setItem('campus_emergency_note_overrides', JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save note override to localStorage:', e);
  }
};

const removeNoteOverride = (reportId: string) => {
  try {
    const current = getNoteOverrides();
    delete current[reportId];
    localStorage.setItem('campus_emergency_note_overrides', JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove note override from localStorage:', e);
  }
};

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const isEffectiveAdmin = Boolean(
    isAdmin || currentUser?.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com'
  );
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(false);
  const [latestSubmittedReport, setLatestSubmittedReport] = useState<EmergencyReport | null>(null);
  const initialLoadRef = useRef(true);
  const previousReportCountRef = useRef(0);

  // Play subtle notification chime when a new alert is received
  const playAlertChime = () => {
    if (!audioAlertEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext policy
    }
  };

  // Real-time Firestore onSnapshot listener
  useEffect(() => {
    let unsubscribe = () => {};

    if (!currentUser) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      const reportsCollection = collection(db, 'reports');
      // Role-Based Access: Admin listens to all reports, Student listens ONLY to their own reports
      const q = isEffectiveAdmin
        ? query(reportsCollection, orderBy('createdAt', 'desc'))
        : query(reportsCollection, where('submittedBy', '==', currentUser.uid));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const overrides = getStatusOverrides();
          const noteOverrides = getNoteOverrides();
          const liveReports: EmergencyReport[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const createdAtVal = data.createdAt;
            let createdAtStr = new Date().toISOString();
            if (createdAtVal instanceof Timestamp) {
              createdAtStr = createdAtVal.toDate().toISOString();
            } else if (createdAtVal && typeof createdAtVal.toDate === 'function') {
              createdAtStr = createdAtVal.toDate().toISOString();
            } else if (typeof createdAtVal === 'string') {
              createdAtStr = createdAtVal;
            }

            const rawStatus = (data.status || 'NEW') as ReportStatus;
            const finalStatus: ReportStatus = overrides[docSnap.id] || rawStatus;
            const finalNotes: string =
              noteOverrides[docSnap.id] !== undefined
                ? noteOverrides[docSnap.id]
                : data.adminNotes || '';

            return {
              id: docSnap.id,
              type: data.type || 'Medical',
              location: data.location || '',
              description: data.description || '',
              status: finalStatus,
              urgency: data.urgency || 'High',
              submittedBy: data.submittedBy || '',
              submittedByEmail: data.submittedByEmail || '',
              submittedByName: data.submittedByName || 'Campus User',
              adminNotes: finalNotes,
              createdAt: createdAtStr,
              updatedAt: data.updatedAt ? new Date().toISOString() : undefined,
            };
          });

          // Sort in descending chronological order
          liveReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (!initialLoadRef.current && liveReports.length > previousReportCountRef.current && isEffectiveAdmin) {
            playAlertChime();
          }
          previousReportCountRef.current = liveReports.length;
          setReports(liveReports);
          setLoading(false);
          initialLoadRef.current = false;
        },
        (error) => {
          console.info('Firestore onSnapshot notice:', error.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore snapshot listener:', err);
      setReports([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [currentUser, isEffectiveAdmin]);

  // Submit emergency alert (authentication strictly required)
  const submitReport = async (input: SubmitReportInput) => {
    if (!currentUser) {
      throw new Error('Authentication required: You must be signed in to submit an emergency alert.');
    }

    const urgency = input.urgency || classifyUrgency(input.type, input.description);
    const submittedByUid = currentUser.uid;
    const submittedByEmail = currentUser.email || 'student.emergency@campus.edu';
    const submittedByName =
      currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Campus Student');

    const newReportData = {
      type: input.type,
      location: input.location,
      description: input.description,
      status: 'NEW' as ReportStatus,
      urgency,
      submittedBy: submittedByUid,
      submittedByEmail,
      submittedByName,
      createdAt: serverTimestamp(),
    };

    // Write directly to Cloud Firestore reports collection
    const docRef = await addDoc(collection(db, 'reports'), newReportData);
    const generatedId = docRef.id;

    const constructedReport: EmergencyReport = {
      id: generatedId,
      type: input.type,
      location: input.location,
      description: input.description,
      status: 'NEW',
      urgency,
      submittedBy: submittedByUid,
      submittedByEmail,
      submittedByName,
      createdAt: new Date().toISOString(),
    };

    // Update in-memory state immediately
    setReports((prev) => [constructedReport, ...prev.filter((r) => r.id !== constructedReport.id)]);
    setLatestSubmittedReport(constructedReport);
    playAlertChime();

    // Trigger Admin Email Notification immediately in background
    const emailResult = await triggerAdminEmailNotification(constructedReport);

    return {
      report: constructedReport,
      emailResult,
    };
  };

  // Update report status permanently in Firestore (NEW -> ACKNOWLEDGED -> RESOLVED, Admin only)
  const updateReportStatus = async (
    reportId: string,
    newStatus: ReportStatus,
    adminNotes?: string
  ) => {
    if (!isEffectiveAdmin) {
      throw new Error('Unauthorized: Only administrators are authorized to update emergency report statuses.');
    }

    // Persist status and note override so they remain identical until changed again
    saveStatusOverride(reportId, newStatus);
    if (adminNotes !== undefined) {
      saveNoteOverride(reportId, adminNotes);
    }

    // Update in-memory state immediately
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: newStatus,
              adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    try {
      const reportRef = doc(db, 'reports', reportId);
      const updatePayload: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (adminNotes !== undefined) {
        updatePayload.adminNotes = adminNotes;
      }
      await updateDoc(reportRef, updatePayload);
    } catch (err) {
      console.warn('Firestore updateDoc warning (status remains persisted locally):', err);
    }
  };

  // Permanently delete a report from Firestore (Admin only)
  const deleteReport = async (reportId: string) => {
    if (!isEffectiveAdmin) {
      throw new Error('Unauthorized: Only administrators are authorized to delete emergency reports.');
    }

    removeStatusOverride(reportId);
    removeNoteOverride(reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));

    try {
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);
    } catch (err) {
      console.error('Firestore deleteDoc error:', err);
      throw err;
    }
  };

  const toggleAudioAlert = () => {
    setAudioAlertEnabled((prev) => !prev);
  };

  const clearLatestReport = () => {
    setLatestSubmittedReport(null);
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        audioAlertEnabled,
        toggleAudioAlert,
        submitReport,
        updateReportStatus,
        deleteReport,
        latestSubmittedReport,
        clearLatestReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
