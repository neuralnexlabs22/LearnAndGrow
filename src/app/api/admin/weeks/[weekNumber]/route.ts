import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  updateCourseWeek,
  saveCourseWeekPdf,
  deleteCourseWeekPdf,
  getCourseWeek,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export async function PATCH(
  request: Request,
  props: { params: Promise<{ weekNumber: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const weekNum = parseInt(params.weekNumber, 10);

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 8) {
      return NextResponse.json(
        { error: "Invalid week number." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, learningObjectives, isPublished } = body;

    const updates: any = {};
    if (typeof title === "string") updates.title = title.trim();
    if (typeof description === "string") updates.description = description.trim();
    if (Array.isArray(learningObjectives)) updates.learningObjectives = learningObjectives;
    if (typeof isPublished === "boolean") updates.isPublished = isPublished;

    const updated = await updateCourseWeek(weekNum, updates);

    return NextResponse.json({
      success: true,
      week: updated,
      message: `Week ${weekNum} updated successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update week." },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ weekNumber: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const weekNum = parseInt(params.weekNumber, 10);

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 8) {
      return NextResponse.json(
        { error: "Invalid week number." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Validation: Only accept PDF files
    const filename = file.name || `Week-${weekNum}-Materials.pdf`;
    const isPdfExt = filename.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf" || file.type === "";

    if (!isPdfExt) {
      return NextResponse.json(
        { error: "Invalid file format. Only official PDF (.pdf) documents are accepted." },
        { status: 400 }
      );
    }

    // Validation: Size limit
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 25MB limit. Uploaded size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const updatedWeek = await saveCourseWeekPdf(weekNum, filename, buffer);

    return NextResponse.json({
      success: true,
      week: updatedWeek,
      message: `PDF for Week ${weekNum} successfully uploaded and secured.`,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload PDF." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ weekNumber: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const weekNum = parseInt(params.weekNumber, 10);

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 8) {
      return NextResponse.json(
        { error: "Invalid week number." },
        { status: 400 }
      );
    }

    const updatedWeek = await deleteCourseWeekPdf(weekNum);

    return NextResponse.json({
      success: true,
      week: updatedWeek,
      message: `PDF for Week ${weekNum} has been permanently deleted.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete PDF." },
      { status: 500 }
    );
  }
}
