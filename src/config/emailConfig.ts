/**
 * Email Notification Configuration for Campus Emergency Alerts
 * 
 * Supports environment variables (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY, VITE_ADMIN_EMAIL)
 * with clear placeholders and designated admin recipient: naofumiiwatanisan911@gmail.com
 */
export const EMAIL_CONFIG = {
  // EmailJS Service ID (e.g. 'service_campus_alerts')
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_campus_alerts',

  // EmailJS Template ID (e.g. 'template_emergency_alert')
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_emergency_alert',

  // EmailJS Public API Key (Account -> API Keys -> Public Key)
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',

  // Designated Administrator recipient email for incoming alerts
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'naofumiiwatanisan911@gmail.com',

  // Secondary campus safety dispatch / backup admin email
  dispatchEmail: 'farihaahmed3256@gmail.com',

  // Enable/disable automated dispatch
  enabled: true,

  // When true, uses real-time in-app simulation & console log if real EmailJS keys are not provided.
  simulateInDev: false,
};
