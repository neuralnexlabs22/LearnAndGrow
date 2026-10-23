/**
 * Generates a standard, valid PDF-1.4 byte buffer with English course study notes
 */
export function generateCourseModulePdfBuffer(
  weekNumber: number,
  title: string,
  description: string,
  topics: string[]
): Buffer {
  const contentStream = `
BT
/F1 18 Tf
50 760 Td
(8-WEEK ENGLISH LEARNING COURSE: SPEAK WITH CONFIDENCE) Tj
/F1 13 Tf
0 -32 Td
(WEEK ${weekNumber}: ${title.toUpperCase().replace(/[()]/g, "")}) Tj
/F2 11 Tf
0 -26 Td
(Official Student Workbook, Practice Exercises & Spoken English Guide) Tj
0 -18 Td
(Confidential - Authorized Enrolled Student Access Only) Tj
0 -30 Td
/F1 12 Tf
(MODULE OVERVIEW:) Tj
/F2 10 Tf
0 -18 Td
(${description.replace(/[()]/g, "").slice(0, 85)}) Tj
0 -14 Td
(${description.replace(/[()]/g, "").slice(85, 170)}) Tj
0 -28 Td
/F1 12 Tf
(CORE SYLLABUS, VOCABULARY & GRAMMAR DRILLS:) Tj
/F2 10 Tf
${topics
  .map(
    (t, i) => `0 -18 Td
([0${i + 1}]  ${t.replace(/[()]/g, "")}) Tj`
  )
  .join("\n")}
0 -32 Td
/F1 11 Tf
(SPEAKING PRACTICE & HOMEWORK ASSIGNMENTS:) Tj
/F2 10 Tf
0 -18 Td
(- Practice reading the conversational dialogues out loud twice daily for pronunciation.) Tj
0 -15 Td
(- Complete the vocabulary drills and sentence construction exercises in this workbook.) Tj
0 -15 Td
(- Record a 2-minute audio reflection and submit it via WhatsApp for instructor feedback.) Tj
0 -40 Td
/F2 9 Tf
(Instructor Support: Contact Course Administrator via WhatsApp for 1-on-1 feedback.) Tj
0 -14 Td
(Copyright 2026 8-Week English Learning Course. All Rights Reserved.) Tj
ET
`.trim();

  const streamLength = Buffer.byteLength(contentStream, "utf-8");

  const pdf = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
      /F2 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${contentStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000305 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}
