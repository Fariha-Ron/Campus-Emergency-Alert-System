import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';
import { EmergencyReport, EmailDispatchRecord } from '../types';

// In-memory record of dispatched alert emails for auditing and feedback
const dispatchHistory: EmailDispatchRecord[] = [];
type DispatchListener = (records: EmailDispatchRecord[]) => void;
const listeners: DispatchListener[] = [];

export function subscribeToDispatches(listener: DispatchListener) {
  listeners.push(listener);
  listener([...dispatchHistory]);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getDispatchHistory(): EmailDispatchRecord[] {
  return [...dispatchHistory];
}

export async function triggerAdminEmailNotification(report: EmergencyReport): Promise<{
  success: boolean;
  mode: 'real' | 'simulated';
  message: string;
  record: EmailDispatchRecord;
  mailtoUrl: string;
  gmailUrl: string;
}> {
  const subject = `[URGENT CAMPUS ALERT: ${report.type.toUpperCase()}] at ${report.location}`;
  const timestamp = new Date().toISOString();
  const preview = `Incident #${report.id.slice(0, 8)}: ${report.type} at ${report.location} - ${report.description.slice(0, 100)}...`;

  const bodyText =
    `CAMPUS EMERGENCY ALERT DISPATCH\n\n` +
    `Incident ID: ${report.id}\n` +
    `Type: ${report.type}\n` +
    `Urgency: ${report.urgency || 'High'}\n` +
    `Location: ${report.location}\n` +
    `Description: ${report.description}\n` +
    `Reported By: ${report.submittedByName || ''} (${report.submittedByEmail || report.submittedBy})\n` +
    `Time: ${new Date().toLocaleString()}\n`;

  const mailtoUrl = `mailto:${EMAIL_CONFIG.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_CONFIG.adminEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  const record: EmailDispatchRecord = {
    id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reportId: report.id,
    recipient: EMAIL_CONFIG.adminEmail,
    timestamp,
    subject,
    status: 'SENT',
    preview,
  };

  let dispatchedSuccessfully = false;
  let statusMessage = '';

  // 1. Direct automated HTTP dispatch to admin email via FormSubmit API
  try {
    console.info(`[Admin Email Notification] Sending automated email to ${EMAIL_CONFIG.adminEmail}...`);
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${EMAIL_CONFIG.adminEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        emergency_type: report.type,
        urgency: report.urgency || 'High',
        location: report.location,
        description: report.description,
        reported_by: `${report.submittedByName || ''} (${report.submittedByEmail || report.submittedBy})`,
        incident_id: report.id,
        timestamp: new Date().toLocaleString(),
        _captcha: 'false',
        _template: 'table',
      }),
    });

    if (formSubmitRes.ok) {
      const data = await formSubmitRes.json();
      console.info(`[Admin Email Notification] FormSubmit response:`, data);
      dispatchedSuccessfully = true;
      if (data.message && data.message.includes('Activation')) {
        statusMessage = `Automated alert dispatched to ${EMAIL_CONFIG.adminEmail}. (Check inbox to confirm one-time activation link or use 1-click Gmail below).`;
      } else {
        statusMessage = `Automated email successfully delivered to designated administrator (${EMAIL_CONFIG.adminEmail}).`;
      }
    }
  } catch (httpErr) {
    console.warn(`[Admin Email Notification] Direct HTTP dispatch notice:`, httpErr);
  }

  // 2. Automated dispatch via EmailJS (if valid public key is configured)
  const isRealEmailJS =
    EMAIL_CONFIG.publicKey &&
    EMAIL_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    EMAIL_CONFIG.publicKey.trim().length > 0;

  if (isRealEmailJS) {
    try {
      console.info(`[Admin Email Notification] Dispatching via EmailJS to ${EMAIL_CONFIG.adminEmail}...`);
      const templateParams = {
        to_email: EMAIL_CONFIG.adminEmail,
        emergency_type: report.type,
        location: report.location,
        description: report.description,
        urgency: report.urgency || 'High',
        submitted_by: report.submittedByEmail || report.submittedBy,
        report_id: report.id,
        timestamp: new Date().toLocaleString(),
      };

      const result = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams,
        EMAIL_CONFIG.publicKey
      );

      console.info(`[Admin Email Notification] EmailJS SUCCESS to ${EMAIL_CONFIG.adminEmail}`, result);
      dispatchedSuccessfully = true;
      statusMessage = `Email alert delivered to designated administrator (${EMAIL_CONFIG.adminEmail}) via EmailJS.`;
    } catch (emailjsErr) {
      console.error(`[Admin Email Notification] EmailJS error:`, emailjsErr);
    }
  }

  // 3. Fallback status
  if (!dispatchedSuccessfully) {
    statusMessage = `Alert targeted to designated admin: ${EMAIL_CONFIG.adminEmail}. Use the 1-click button below to send directly via Gmail.`;
    record.status = 'SIMULATED';
  } else {
    record.status = 'SENT';
  }

  console.info(
    `[Admin Email Notification Summary] Status: ${record.status} | Recipient: ${EMAIL_CONFIG.adminEmail} | ${statusMessage}`
  );

  dispatchHistory.unshift(record);
  listeners.forEach((l) => l([...dispatchHistory]));

  return {
    success: true,
    mode: dispatchedSuccessfully ? 'real' : 'simulated',
    message: statusMessage,
    record,
    mailtoUrl,
    gmailUrl,
  };
}
