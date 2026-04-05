import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStyleById } from "@/lib/thread-styles";
import { prisma } from "@/lib/prisma";

const FREE_DAILY_LIMIT = 3;

/* ─── Input validation ─── */
const RequestSchema = z.object({
  topic: z.string().min(3).max(500),
  tone: z.enum(["professional", "casual", "viral", "educational"]),
  threadLength: z.union([z.literal(5), z.literal(8), z.literal(10)]),
  style: z.string().optional().default("storytelling"),
});

/* ─── Tone descriptions ─── */
const toneGuide: Record<string, string> = {
  professional:
    "Use a polished, authoritative voice. Cite data when possible. Avoid slang.",
  casual:
    "Write like you're talking to a friend. Use humor, contractions, and relatable language.",
  viral:
    "Be bold, provocative, and attention-grabbing. Use short punchy sentences, hot takes, and pattern interrupts.",
  educational:
    "Teach clearly with examples. Use numbered lists, analogies, and 'here's why this matters' framing.",
};

export async function POST(req: Request) {
  /* ─── Auth check ─── */
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ─── Enforce daily limit ─── */
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = await prisma.thread.count({
    where: { userId: session.user.id, createdAt: { gte: todayStart } },
  });
  if (todayCount >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Daily limit reached (3/day on free tier). Resets at midnight." },
      { status: 429 }
    );
  }

  /* ─── Parse & validate body ─── */
  let body: z.infer<typeof RequestSchema>;
  try {
    const raw = await req.json();
    body = RequestSchema.parse(raw);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
        : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { topic, tone, threadLength, style } = body;
  const threadStyle = getStyleById(style);

  /* ─── Build prompt ─── */
  const styleSection = threadStyle
    ? `\n\nThread Style — ${threadStyle.title}:\n${threadStyle.promptGuide}`
    : "";

  const systemPrompt = `You are an expert social media strategist who writes viral Twitter/X threads.

Rules:
- Each tweet MUST be under 280 characters (this is a hard limit).
- Number each tweet (1/, 2/, etc.) at the start.
- Use line breaks within tweets for readability.
- Tone: ${toneGuide[tone]}
${styleSection}

IMPORTANT: Output each tweet as a SEPARATE JSON object on its own line, using NDJSON format (one JSON object per line).
Each object has:
- "position": number (1-based index)
- "content": string (the tweet text, under 280 chars)
- "type": "hook" | "value" | "cta"

Output ONLY the JSON objects, one per line. No array brackets, no commas between objects, no markdown, no explanation.

Example output format:
{"position":1,"content":"1/ Your hook tweet here","type":"hook"}
{"position":2,"content":"2/ Value tweet here","type":"value"}
{"position":3,"content":"3/ CTA tweet here","type":"cta"}`;

  const userPrompt = `Write a ${threadLength}-tweet ${threadStyle ? threadStyle.title.toLowerCase() + "-style " : ""}thread about: ${topic}`;

  /* ─── Stream from Claude via Vercel AI SDK ─── */
  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse();
}
