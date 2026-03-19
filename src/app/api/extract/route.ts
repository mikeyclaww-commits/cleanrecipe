import { NextResponse } from "next/server";
import { extractRecipeFromUrl, extractRecipeFromText } from "@/lib/anthropic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, text } = body;

    if (!url && !text) {
      return NextResponse.json(
        { error: "Please provide a URL or text" },
        { status: 400 }
      );
    }

    let recipe;

    if (url) {
      recipe = await extractRecipeFromUrl(url);
    } else {
      recipe = await extractRecipeFromText(text);
    }

    return NextResponse.json({ recipe });
  } catch (error: unknown) {
    console.error("Extraction error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
