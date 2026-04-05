import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function GET() {
  try {
    const result = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Say hello in one sentence.",
    });
    return NextResponse.json({ status: "ok", text: result.text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
