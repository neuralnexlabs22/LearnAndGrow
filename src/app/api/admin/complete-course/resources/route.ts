import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getCompleteCourseResources,
  createCompleteCourseResource,
} from "@/lib/data-store";
import { CompleteCourseResourceType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const resources = await getCompleteCourseResources(true);
    return NextResponse.json({ resources });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      title,
      description,
      resourceType,
      fileName,
      fileStoragePath,
      fileSizeBytes,
      externalUrl,
      isPublished = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Resource title is required." },
        { status: 400 }
      );
    }

    const validTypes: CompleteCourseResourceType[] = ["pdf", "doc", "link"];
    if (!validTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: `Invalid resource type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (resourceType === "link" && (!externalUrl || !externalUrl.trim().startsWith("http"))) {
      return NextResponse.json(
        { error: "A valid external URL (starting with http:// or https://) is required." },
        { status: 400 }
      );
    }

    if ((resourceType === "pdf" || resourceType === "doc") && !fileStoragePath) {
      return NextResponse.json(
        { error: "Please upload a document file for this resource." },
        { status: 400 }
      );
    }

    const created = await createCompleteCourseResource({
      title,
      description,
      resourceType,
      fileName,
      fileStoragePath,
      fileSizeBytes,
      externalUrl,
      isPublished,
    });

    return NextResponse.json({
      success: true,
      resource: created,
      message: "Resource added to Complete Course successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create resource." },
      { status: 500 }
    );
  }
}

