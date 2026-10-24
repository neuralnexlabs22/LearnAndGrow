/**
 * Global Configuration and WhatsApp Click-to-Chat Helpers
 * Tailored for Learn and Grow - "LEARN | IMPROVE | ACHIEVE"
 * 8-Week English Learning Course: "Speak English with Confidence"
 */

export const COURSE_CONFIG = {
  companyName: "Learn and Grow",
  companyMotto: "LEARN | IMPROVE | ACHIEVE",
  logoUrl: "/logo.png",
  courseTitle: "8-Week English Learning Course: Speak English with Confidence",
  shortTitle: "Learn and Grow",
  courseCode: "ENG-801",
  duration: "8 Weeks",
  totalModules: 8,
  studyMaterials: "Weekly Comprehensive PDF Grammar & Spoken English Workbooks",
  supportChannel: "Direct WhatsApp Instructor Advisory",
  tagline: "Build your English skills step by step through an 8-week learning journey covering grammar, vocabulary, speaking, listening, and everyday communication.",
  description:
    "A structured, encouraging 8-week curriculum designed to transform your everyday English communication. Master core sentence foundations, grammar and tenses, natural vocabulary, clear pronunciation, listening comprehension, and confident speaking with weekly in-depth PDF workbooks.",
  highlights: [
    {
      title: "English Grammar",
      desc: "Master essential sentence foundations, tenses, and structural clarity without confusing jargon.",
    },
    {
      title: "Vocabulary Building",
      desc: "Acquire natural, modern vocabulary and everyday expressions used by fluent speakers.",
    },
    {
      title: "Spoken English",
      desc: "Gain confidence speaking in one-on-one dialogues, workplace discussions, and social settings.",
    },
    {
      title: "Pronunciation",
      desc: "Refine vowel sounds, syllable stress, rhythm, and clarity for natural, articulate speech.",
    },
    {
      title: "Listening & Comprehension",
      desc: "Train your ear with conversational dialogues, accents, and fast-paced speech patterns.",
    },
    {
      title: "Writing & Communication",
      desc: "Draft professional emails, clear messages, and well-structured real-life correspondence.",
    },
  ],
  contactEmail: "learnandgrow050518@gmail.com",
  contactPhone: "8148440389",
  contactPhoneDisplay: "+91 81484 40389",
};

// Configurable Admin WhatsApp Number
export const ADMIN_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "918148440389";

/**
 * Builds a valid WhatsApp click-to-chat URL:
 * https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE
 */
export function buildWhatsAppUrl(message: string, overrideNumber?: string): string {
  const rawNumber = overrideNumber || ADMIN_WHATSAPP_NUMBER;
  let cleanNumber = rawNumber.replace(/\D/g, "");
  // Prefix Indian country code (91) if 10-digit number is provided without country code
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Pre-filled message for Learn and Grow English course enrollment inquiries
 */
export function getEnrollmentWhatsAppUrl(email?: string): string {
  let message =
    "Hello Learn and Grow! I am interested in your 8-week Spoken English Course. Please share the syllabus, course fee, duration, and enrollment details.";

  if (email) {
    message += ` (Registered Email: ${email})`;
  }

  return buildWhatsAppUrl(message);
}

/**
 * Pre-filled message with specific offer pricing details
 */
export function getPriceOfferWhatsAppUrl(
  originalPrice: number,
  sellingPrice: number,
  currency: string = "₹",
  email?: string
): string {
  let message = `Hello Learn and Grow! I would like to enroll in your 8-week Spoken English Course at the offer price of ${currency}${sellingPrice} (Original: ${currency}${originalPrice}). Please share the enrollment, payment, and batch details.`;
  if (email) {
    message += ` (Registered Email: ${email})`;
  }
  return buildWhatsAppUrl(message);
}

/**
 * Pre-filled message for specific week syllabus inquiries
 */
export function getWeekInquiryWhatsAppUrl(
  weekNumber: number,
  weekTitle: string
): string {
  const message = `Hello Learn and Grow team! I have a question regarding Week ${weekNumber} (${weekTitle}) of the 8-Week English Learning Course. Could you please share more details on the lesson plan and enrollment?`;
  return buildWhatsAppUrl(message);
}

/**
 * Deterministic date formatter to prevent React SSR/Client hydration mismatches.
 * Formats dates uniformly as "Oct 21, 2026" regardless of server OS or browser locale.
 */
export function formatDisplayDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

/**
 * Builds the WhatsApp click-to-chat URL with the student's dynamic assessment results.
 * Matches exact format from user specifications:
 * Hello Learn and Grow! I have completed the English Grammar Assessment.
 * [Student Name: Jane Doe]
 * My Score: 16/20
 * Accuracy: 80%
 * My Level: Intermediate
 * I am interested in joining your 8-week Spoken English Course. Please share the syllabus, course fee, and enrollment details.
 */
export function buildAssessmentWhatsAppUrl(params: {
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  levelTitle: string;
  studentName?: string;
  customTemplate?: string;
}): string {
  const { score, totalQuestions, accuracyPercentage, levelTitle, studentName, customTemplate } = params;

  // Clean level title (e.g. "Intermediate Level" -> "Intermediate")
  const cleanLevel = levelTitle.replace(/\s+Level$/i, "").trim();

  if (customTemplate && customTemplate.trim()) {
    let msg = customTemplate
      .replace(/{{score}}/g, String(score))
      .replace(/{{total}}/g, String(totalQuestions))
      .replace(/{{accuracy}}/g, `${accuracyPercentage}%`)
      .replace(/{{level}}/g, cleanLevel)
      .replace(/{{name}}/g, studentName?.trim() ? `\nStudent Name: ${studentName.trim()}` : "");
    return buildWhatsAppUrl(msg);
  }

  let lines: string[] = [
    "Hello Learn and Grow! I have completed the English Grammar Assessment.",
  ];

  if (studentName && studentName.trim()) {
    lines.push(`Student Name: ${studentName.trim()}`);
  }

  lines.push(`My Score: ${score}/${totalQuestions}`);
  lines.push(`Accuracy: ${accuracyPercentage}%`);
  lines.push(`My Level: ${cleanLevel}`);
  lines.push(
    "I am interested in joining your 8-week Spoken English Course. Please share the syllabus, course fee, and enrollment details."
  );

  return buildWhatsAppUrl(lines.join("\n"));
}


