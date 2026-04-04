import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  /* ─── Total threads ─── */
  const totalThreads = await prisma.thread.count({ where: { userId } });

  /* ─── Average viral score ─── */
  const scoreResult = await prisma.thread.aggregate({
    where: { userId, viralScore: { not: null } },
    _avg: { viralScore: true },
    _count: { viralScore: true },
  });
  const avgViralScore = Math.round(scoreResult._avg.viralScore ?? 0);

  /* ─── Most used tone ─── */
  const toneGroups = await prisma.thread.groupBy({
    by: ["tone"],
    where: { userId },
    _count: { tone: true },
    orderBy: { _count: { tone: "desc" } },
    take: 1,
  });
  const mostUsedTone = toneGroups[0]?.tone ?? "N/A";

  /* ─── Most used style ─── */
  const styleGroups = await prisma.thread.groupBy({
    by: ["style"],
    where: { userId },
    _count: { style: true },
    orderBy: { _count: { style: "desc" } },
    take: 1,
  });
  const mostUsedStyle = styleGroups[0]?.style ?? "N/A";

  /* ─── Threads per day (last 7 days) ─── */
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentThreads = await prisma.thread.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Build day-by-day counts
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = 0;
  }
  for (const t of recentThreads) {
    const key = t.createdAt.toISOString().split("T")[0];
    if (key in dailyMap) dailyMap[key]++;
  }

  const threadsPerDay = Object.entries(dailyMap).map(([date, count]) => {
    const d = new Date(date + "T00:00:00");
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: date,
      threads: count,
    };
  });

  /* ─── Top 3 highest scoring threads ─── */
  const topThreads = await prisma.thread.findMany({
    where: { userId, viralScore: { not: null } },
    orderBy: { viralScore: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      viralScore: true,
      tone: true,
      style: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    totalThreads,
    avgViralScore,
    mostUsedTone,
    mostUsedStyle,
    threadsPerDay,
    topThreads: topThreads.map((t) => ({
      ...t,
      date: t.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
  });
}
