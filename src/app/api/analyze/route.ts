import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic();

const TweetInput = z.object({
  position: z.number(),
  content: z.string(),
  type: z.enum(["hook", "value", "cta"]),
});

const RequestSchema = z.object({
  tweets: z.array(TweetInput).min(3).max(15),
  topic: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweets, topic } = body;
  const threadText = tweets
    .map((t) => `[${t.type.toUpperCase()}] ${t.position}/ ${t.content}`)
    .join("\n\n");

  const systemPrompt = `You are a social media analytics expert who scores Twitter/X threads for viral potential.

Analyze the thread below and return a JSON object with these exact fields:

{
  "totalScore": <number 0-100>,
  "breakdown": {
    "hookStrength": {
      "score": <number 0-25>,
      "label": "Hook Strength",
      "suggestion": "<one specific actionable suggestion to improve the hook>"
    },
    "valueDensity": {
      "score": <number 0-25>,
      "label": "Value Density",
      "suggestion": "<one specific actionable suggestion to increase value>"
    },
    "engagementPotential": {
      "score": <number 0-25>,
      "label": "Engagement Potential",
      "suggestion": "<one specific actionable suggestion to boost engagement>"
    },
    "ctaEffectiveness": {
      "score": <number 0-25>,
      "label": "CTA Effectiveness",
      "suggestion": "<one specific actionable suggestion to strengthen the CTA>"
    }
  },
  "overallFeedback": "<2-3 sentence summary of the thread's strengths and what would make it go viral>"
}

Scoring criteria:
- Hook Strength (0-25): Does tweet 1 stop the scroll? Bold claim, surprising stat, or provocative question?
- Value Density (0-25): Do the middle tweets deliver genuine insights, data, stories, or actionable tips?
- Engagement Potential (0-25): Will people reply, quote-tweet, or save this? Does it spark debate or emotion?
- CTA Effectiveness (0-25): Does the last tweet drive action? Clear ask for follow, retweet, or engagement?

Be honest and critical. Most threads score 40-70. Only exceptional threads score 80+.
Return ONLY the JSON object, no markdown fences, no explanation.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Topic: ${topic}\n\nThread:\n${threadText}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No analysis returned" },
        { status: 502 }
      );
    }

    const raw = textBlock.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const ScoreSchema = z.object({
      totalScore: z.number().min(0).max(100),
      breakdown: z.object({
        hookStrength: z.object({
          score: z.number().min(0).max(25),
          label: z.string(),
          suggestion: z.string(),
        }),
        valueDensity: z.object({
          score: z.number().min(0).max(25),
          label: z.string(),
          suggestion: z.string(),
        }),
        engagementPotential: z.object({
          score: z.number().min(0).max(25),
          label: z.string(),
          suggestion: z.string(),
        }),
        ctaEffectiveness: z.object({
          score: z.number().min(0).max(25),
          label: z.string(),
          suggestion: z.string(),
        }),
      }),
      overallFeedback: z.string(),
    });

    const analysis = ScoreSchema.parse(JSON.parse(raw));

    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI auth failed" },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited — try again shortly" },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "AI returned malformed analysis" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
