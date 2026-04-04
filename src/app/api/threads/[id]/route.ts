import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* DELETE /api/threads/[id] — atomic ownership check */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.thread.deleteMany({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Thread not found or access denied" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
