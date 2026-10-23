import { NextResponse } from "next/server";
import { requireActiveAccess } from "@/lib/auth";
import { getCourseWeekPdfBuffer } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ weekNumber: string }> }
) {
  try {
    const params = await props.params;
    const weekNum = parseInt(params.weekNumber, 10);

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 8) {
      return NextResponse.json(
        { error: "Invalid week number. Must be between 1 and 8." },
        { status: 400 }
      );
    }

    // Server-side strict authorization check
    // Will throw 401 if unauthenticated, 403 if subscription is not active
    await requireActiveAccess();

    const pdfData = await getCourseWeekPdfBuffer(weekNum);
    if (!pdfData) {
      return NextResponse.json(
        { error: `No PDF study material has been published for Week ${weekNum} yet.` },
        { status: 404 }
      );
    }

    const { buffer, filename } = pdfData;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    const status = error?.statusCode || 403;
    return NextResponse.json(
      { error: error?.message || "Access denied to protected course materials." },
      { status }
    );
  }
}
