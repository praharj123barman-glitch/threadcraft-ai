import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* GET /api/threads?page=1&limit=10 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
  const skip = (page - 1) * limit;

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.thread.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    threads: threads.map((t) => {
      let content;
      try {
        content = JSON.parse(t.content);
      } catch {
        content = [];
      }
      return { ...t, content };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/* POST /api/threads — validated input */
const PostSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.array(z.unknown()).min(1),
  platform: z.string().min(1).max(50),
  tone: z.string().optional(),
  style: z.string().optional(),
  viralScore: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof PostSchema>;
  try {
    body = PostSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const thread = await prisma.thread.create({
    data: {
      title: body.title,
      content: JSON.stringify(body.content),
      platform: body.platform,
      tone: body.tone ?? "professional",
      style: body.style ?? "storytelling",
      viralScore: body.viralScore ?? null,
      userId: session.user.id,
    },
  });

  let content;
  try {
    content = JSON.parse(thread.content);
  } catch {
    content = [];
  }

  return NextResponse.json({ ...thread, content }, { status: 201 });
}
