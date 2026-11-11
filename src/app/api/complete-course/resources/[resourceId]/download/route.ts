import { NextResponse } from "next/server";
import { requireCompleteCourseAccess } from "@/lib/auth";
import { getCompleteCourseResourceBuffer } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ resourceId: string }> }
) {
  try {
    const params = await props.params;
    const { resourceId } = params;

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    // Strict server-side authorization check: throws 401 if unauthenticated, 403 if not granted
    await requireCompleteCourseAccess();

    const resourceData = await getCompleteCourseResourceBuffer(resourceId);
    if (!resourceData) {
      return NextResponse.json(
        { error: "Resource file not found or not published." },
        { status: 404 }
      );
    }

    const { buffer, filename, contentType } = resourceData;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    const status = error?.statusCode || 403;
    return NextResponse.json(
      { error: error?.message || "Access denied to Complete Course materials." },
      { status }
    );
  }
}
