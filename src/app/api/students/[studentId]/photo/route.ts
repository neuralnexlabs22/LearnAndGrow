import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  getUserById,
  saveStudentPhoto,
  removeStudentPhoto,
  getStudentPhotoBuffer,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const { studentId } = params;

    const photoData = await getStudentPhotoBuffer(studentId);
    if (photoData) {
      return new NextResponse(new Uint8Array(photoData.buffer), {
        status: 200,
        headers: {
          "Content-Type": photoData.contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    }

    // Default Avatar SVG matching beige aesthetic
    const user = await getUserById(studentId);
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <rect width="128" height="128" fill="#EFECE4" rx="64"/>
        <text x="64" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" fill="#78716C" text-anchor="middle" dominant-baseline="middle">
          ${initial}
        </text>
      </svg>
    `.trim();

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load student photo." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const { studentId } = params;

    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Only administrator or the student themselves can upload/replace their photo
    if (user.role !== "admin" && user.id !== studentId) {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const filename = file.name || "profile.jpg";
    const ext = filename.toLowerCase().split(".").pop();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];

    if (!ext || !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds 5MB size limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const photoUrl = await saveStudentPhoto(studentId, filename, buffer);

    return NextResponse.json({
      success: true,
      photoUrl,
      message: "Student profile photo successfully updated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to upload photo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const { studentId } = params;

    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (user.role !== "admin" && user.id !== studentId) {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    await removeStudentPhoto(studentId);

    return NextResponse.json({
      success: true,
      message: "Student photo removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to remove photo." },
      { status: 500 }
    );
  }
}
