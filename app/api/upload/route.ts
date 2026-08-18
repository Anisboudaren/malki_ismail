import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { IMAGE_MAX_BYTES, IMAGE_TYPES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/upload-limits";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.suspended) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
        maximumSizeInBytes: Math.max(IMAGE_MAX_BYTES, VIDEO_MAX_BYTES),
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
