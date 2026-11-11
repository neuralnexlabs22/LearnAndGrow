import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveCompleteCourseFile } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isImage = formData.get("isImage") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const ext = lowerName.slice(lowerName.lastIndexOf("."));

    const allowedDocExts = [".pdf", ".docx", ".doc"];
    const allowedImgExts = [".jpg", ".jpeg", ".png", ".webp"];

    if (isImage) {
      if (!allowedImgExts.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid image format. Allowed: ${allowedImgExts.join(", ")}` },
          { status: 400 }
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file exceeds maximum limit of 5 MB." },
          { status: 400 }
        );
      }
    } else {
      if (!allowedDocExts.includes(ext)) {
        return NextResponse.json(
          {
            error: `Invalid document format. Only PDF (.pdf) and Word (.docx, .doc) files are supported.`,
          },
          { status: 400 }
        );
      }
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Document exceeds maximum file limit of 50 MB." },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { storagePath, fileSizeBytes } = await saveCompleteCourseFile(
      file.name,
      buffer
    );

    const resourceType = ext === ".pdf" ? "pdf" : "doc";

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileStoragePath: storagePath,
      fileSizeBytes,
      resourceType,
      message: `File '${file.name}' uploaded successfully.`,
    });
  } catch (error: any) {
    console.error("Complete Course upload error:", error);
    return NextResponse.json(
      { error: error?.message || "File upload failed." },
      { status: 500 }
    );
  }
}
