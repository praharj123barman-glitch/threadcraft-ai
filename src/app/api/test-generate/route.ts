import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function GET() {
  try {
    const result = await generateText({
      model: google("gemini-2.0-flash"),
      system: `Output each tweet as a SEPARATE JSON object on its own line, using NDJSON format.
Each object has: "position" (number), "content" (string), "type" ("hook"|"value"|"cta").
Output ONLY the JSON objects, one per line. No array brackets, no commas, no markdown, no explanation.`,
      prompt: "Write a 3-tweet thread about AI in education",
    });
    return NextResponse.json({ status: "ok", raw: result.text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
