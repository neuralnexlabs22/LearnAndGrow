/**
 * Global Configuration and WhatsApp Click-to-Chat Helpers
 */

export const COURSE_CONFIG = {
  courseTitle: "Modern Web Engineering: 8-Week Professional Foundations",
  courseCode: "MWE-801",
  duration: "8 Weeks",
  totalModules: 8,
  studyMaterials: "Weekly Comprehensive PDF Guides & Source Specs",
  supportChannel: "Direct WhatsApp Instructor Advisory",
  tagline: "From Core Architecture to Production Deployment in Eight Structured Weeks",
  description:
    "An intensive, structured online curriculum built specifically for ambitious students and developers. Master modern architectural patterns, full-stack systems, PostgreSQL data modeling, and security hardening with weekly deep-dive PDF materials.",
};

// Configurable Admin WhatsApp Number (Country code + phone number without + or spaces)
// Defaults to a valid international formatted sample if not provided in environment
export const ADMIN_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "15550192834";

/**
 * Builds a valid WhatsApp click-to-chat URL:
 * https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE
 */
export function buildWhatsAppUrl(message: string, overrideNumber?: string): string {
  // Strip any non-digit characters to ensure strict wa.me format
  const rawNumber = overrideNumber || ADMIN_WHATSAPP_NUMBER;
  const cleanNumber = rawNumber.replace(/\D/g, "");
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Pre-filled message for general course enrollment inquiries
 */
export function getEnrollmentWhatsAppUrl(email?: string): string {
  let message =
    "Hello! I am interested in enrolling in the 8-Week Modern Web Engineering course. Please share the course fee, payment instructions, and enrollment procedure.";

  if (email) {
    message += ` (Registered Email: ${email})`;
  }

  return buildWhatsAppUrl(message);
}

/**
 * Pre-filled message for specific week inquiries
 */
export function getWeekInquiryWhatsAppUrl(
  weekNumber: number,
  weekTitle: string
): string {
  const message = `Hello! I have a question regarding Week ${weekNumber} (${weekTitle}) of the 8-Week Student Course. Could you please share more information on syllabus prerequisites and enrollment?`;
  return buildWhatsAppUrl(message);
}
