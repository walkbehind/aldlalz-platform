import { auth } from "@/lib/auth";
import {
  reorderListingImages,
  setListingCoverImage,
  uploadListingImages,
} from "@/lib/listings/images";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateListing(id: string) {
  revalidatePath("/ar/listings");
  revalidatePath("/en/listings");
  revalidatePath(`/ar/listings/${id}`);
  revalidatePath(`/en/listings/${id}`);
  revalidatePath(`/ar/dashboard/listings/${id}/edit`);
  revalidatePath(`/en/dashboard/listings/${id}/edit`);
}

function errorResponse(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return errorResponse("NO_FILES", 400);
  }

  try {
    const created = await uploadListingImages(id, session.user.id, files);
    revalidateListing(id);
    return NextResponse.json({ images: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UPLOAD_FAILED";
    const status =
      message === "NOT_FOUND"
        ? 404
        : message === "MAX_IMAGES" || message === "INVALID_TYPE" || message === "FILE_TOO_LARGE"
          ? 400
          : message === "STORAGE_NOT_CONFIGURED"
            ? 503
            : 500;
    return errorResponse(message, status);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    action?: string;
    orderedIds?: string[];
    imageId?: string;
  };

  try {
    if (body.action === "reorder" && body.orderedIds) {
      await reorderListingImages(id, session.user.id, body.orderedIds);
    } else if (body.action === "cover" && body.imageId) {
      await setListingCoverImage(id, session.user.id, body.imageId);
    } else {
      return errorResponse("INVALID_ACTION", 400);
    }

    revalidateListing(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "FAILED";
    const status = message === "NOT_FOUND" ? 404 : 400;
    return errorResponse(message, status);
  }
}
