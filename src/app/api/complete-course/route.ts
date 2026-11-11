import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  getCompleteCourseSettings,
  getCompleteCourseResources,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, hasCompleteCourseAccess } = await getCurrentSession();
    const settings = await getCompleteCourseSettings();
    const allPublished = await getCompleteCourseResources(false);

    const hasAccess = user?.role === "admin" || hasCompleteCourseAccess;

    // Security check: Only return resource contents, filenames, and links to authorized students
    let resourcesData = undefined;
    if (hasAccess) {
      resourcesData = allPublished.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resourceType: r.resourceType,
        fileName: r.fileName,
        fileSizeBytes: r.fileSizeBytes,
        externalUrl: r.externalUrl,
        orderIndex: r.orderIndex,
        isPublished: r.isPublished,
        createdAt: r.createdAt,
      }));
    }

    return NextResponse.json({
      settings,
      hasAccess,
      totalResources: allPublished.length,
      resources: resourcesData,
    });
  } catch (error: any) {
    console.error("GET /api/complete-course error:", error);
    return NextResponse.json(
      { error: "Failed to load Complete Course details." },
      { status: 500 }
    );
  }
}

