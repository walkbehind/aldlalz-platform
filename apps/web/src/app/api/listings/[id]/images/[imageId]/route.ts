import { auth } from "@/lib/auth";
import { deleteListingImage } from "@/lib/listings/images";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string; imageId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id, imageId } = await context.params;

  try {
    await deleteListingImage(id, session.user.id, imageId);
    revalidatePath(`/ar/dashboard/listings/${id}/edit`);
    revalidatePath(`/en/dashboard/listings/${id}/edit`);
    revalidatePath(`/ar/listings/${id}`);
    revalidatePath(`/en/listings/${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "FAILED";
    return NextResponse.json(
      { error: message },
      { status: message === "NOT_FOUND" ? 404 : 500 }
    );
  }
}
