/**
 * Generates a standard, valid PDF-1.4 byte buffer with course notes
 */
export function generateCourseModulePdfBuffer(
  weekNumber: number,
  title: string,
  description: string,
  topics: string[]
): Buffer {
  const contentStream = `
BT
/F1 20 Tf
50 750 Td
(MODERN WEB ENGINEERING: 8-WEEK INTENSIVE COURSE) Tj
/F1 14 Tf
0 -35 Td
(WEEK ${weekNumber}: ${title.toUpperCase().replace(/[()]/g, "")}) Tj
/F2 11 Tf
0 -30 Td
(Official Student Study Guide & Reference Materials) Tj
0 -20 Td
(Confidential - Authorized Enrolled Student Access Only) Tj
0 -30 Td
/F1 12 Tf
(MODULE OVERVIEW:) Tj
/F2 10 Tf
0 -20 Td
(${description.replace(/[()]/g, "").slice(0, 85)}) Tj
0 -15 Td
(${description.replace(/[()]/g, "").slice(85, 170)}) Tj
0 -30 Td
/F1 12 Tf
(KEY LEARNING OBJECTIVES & CORE SYLLABUS:) Tj
/F2 10 Tf
${topics
  .map(
    (t, i) => `0 -18 Td
([0${i + 1}]  ${t.replace(/[()]/g, "")}) Tj`
  )
  .join("\n")}
0 -35 Td
/F1 11 Tf
(PRACTICAL EXERCISES & LAB MILESTONES:) Tj
/F2 10 Tf
0 -18 Td
(- Complete the hands-on code exercises described in repository module ${weekNumber}.) Tj
0 -15 Td
(- Submit your architecture review via the designated student portal or WhatsApp advisory.) Tj
0 -15 Td
(- Verify test coverage and pass all CI assertions before progressing to the next module.) Tj
0 -40 Td
/F2 9 Tf
(Instructor Support: Contact Course Administrator via WhatsApp for 1-on-1 feedback.) Tj
0 -15 Td
(Copyright 2026 Modern Web Engineering Course. All Rights Reserved.) Tj
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
