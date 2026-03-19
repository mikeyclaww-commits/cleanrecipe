import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ExtractedRecipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  ingredients: { amount: string; unit: string; item: string }[];
  steps: string[];
  tags: string[];
  imageUrl: string | null;
  sourceUrl: string;
}

export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  // First, fetch the page content
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Try to extract JSON-LD structured data first (most recipe sites have this)
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  let recipeJsonLd = "";
  
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      const content = match.replace(/<script[^>]*>/, "").replace(/<\/script>/, "").trim();
      if (content.includes("Recipe") || content.includes("recipe") || content.includes("recipeIngredient")) {
        recipeJsonLd = content;
        break;
      }
    }
  }

  // Build the best context for the AI
  let context: string;
  if (recipeJsonLd) {
    context = `JSON-LD structured data from the page:\n${recipeJsonLd.slice(0, 30000)}`;
  } else {
    context = `HTML content:\n${html.slice(0, 50000)}`;
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract the recipe from this webpage data. Return ONLY valid JSON with this exact structure, no markdown code blocks:
{
  "title": "Recipe Title",
  "description": "Brief description (1-2 sentences)",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "totalTime": "45 mins",
  "servings": 4,
  "ingredients": [
    {"amount": "2", "unit": "cups", "item": "flour"}
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tags": ["dinner", "easy", "chicken"],
  "imageUrl": null
}

If you can find an og:image or recipe image URL, include it. If times aren't specified, estimate them. If servings aren't specified, estimate. Parse ingredient amounts, units, and items separately.

${context}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  let jsonText = content.text.trim();
  // Remove markdown code blocks if present
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const recipe = JSON.parse(jsonText) as ExtractedRecipe;
  recipe.sourceUrl = url;

  return recipe;
}

export async function extractRecipeFromText(text: string): Promise<ExtractedRecipe> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract and structure the recipe from this text. Return ONLY valid JSON with this exact structure, no markdown code blocks:
{
  "title": "Recipe Title",
  "description": "Brief description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "totalTime": "45 mins",
  "servings": 4,
  "ingredients": [
    {"amount": "2", "unit": "cups", "item": "flour"}
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tags": ["dinner", "easy"],
  "imageUrl": null
}

Text:
${text.slice(0, 10000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const recipe = JSON.parse(jsonText) as ExtractedRecipe;
  recipe.sourceUrl = "";

  return recipe;
}
