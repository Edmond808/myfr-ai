import { NextResponse } from "next/server";
import { classifyRequest } from "@/lib/classify";

export async function POST(request: Request) {
  try {
    const { text, location } = (await request.json()) as {
      text: string;
      location: string;
    };

    if (!text?.trim() || !location) {
      return NextResponse.json(
        { error: "text and location are required" },
        { status: 400 },
      );
    }

    const result = await classifyRequest(text.trim(), location);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Classification failed" },
      { status: 500 },
    );
  }
}
