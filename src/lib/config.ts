/**
 * Global Configuration and WhatsApp Click-to-Chat Helpers
 * Tailored for the 8-Week English Learning Course: "Speak English with Confidence"
 */

export const COURSE_CONFIG = {
  courseTitle: "8-Week English Learning Course: Speak English with Confidence",
  shortTitle: "Speak English with Confidence",
  courseCode: "ENG-801",
  duration: "8 Weeks",
  totalModules: 8,
  studyMaterials: "Weekly Comprehensive PDF Grammar & Spoken English Guides",
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
};

// Configurable Admin WhatsApp Number
export const ADMIN_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "15550192834";

/**
 * Builds a valid WhatsApp click-to-chat URL:
 * https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE
 */
export function buildWhatsAppUrl(message: string, overrideNumber?: string): string {
  const rawNumber = overrideNumber || ADMIN_WHATSAPP_NUMBER;
  const cleanNumber = rawNumber.replace(/\D/g, "");
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Pre-filled message for 8-week English course enrollment inquiries
 */
export function getEnrollmentWhatsAppUrl(email?: string): string {
  let message =
    "Hello, I am interested in joining your 8-week English learning course. Please share the syllabus, course fee, payment instructions, and enrollment procedure.";

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
  const message = `Hello! I have a question regarding Week ${weekNumber} (${weekTitle}) of the 8-Week English Learning Course. Could you please share more details on the lesson plan and enrollment?`;
  return buildWhatsAppUrl(message);
}
