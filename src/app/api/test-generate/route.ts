import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export async function GET() {
  try {
    const result = await generateText({
      model: createGroq({ apiKey: process.env.GROQ_API_KEY! })("llama-3.3-70b-versatile"),
      prompt: "Say hello in one sentence.",
    });
    return NextResponse.json({ status: "ok", text: result.text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
