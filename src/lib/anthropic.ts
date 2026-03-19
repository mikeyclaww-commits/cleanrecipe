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

async function fetchInstagramContent(url: string): Promise<string> {
  // Use Instagram's oEmbed API to get caption text
  const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=IGQVJ...`;
  
  // Fallback: try fetching the page directly with mobile user agent
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error("INSTAGRAM_BLOCKED");
  }

  const html = await response.text();
  
  // Try to find meta description or og:description which often has the caption
  const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/);
  const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/);
  
  let content = "";
  if (titleMatch) content += titleMatch[1] + "\n";
  if (descMatch) content += descMatch[1] + "\n";
  
  // Also try to find JSON data embedded in the page
  const jsonMatch = html.match(/"caption":\s*\{[^}]*"text":\s*"([^"]+)"/);
  if (jsonMatch) content += jsonMatch[1];
  
  if (!content.trim()) {
    throw new Error("INSTAGRAM_BLOCKED");
  }
  
  return content;
}

function isInstagramUrl(url: string): boolean {
  return url.includes("instagram.com") || url.includes("instagr.am");
}

function isTikTokUrl(url: string): boolean {
  return url.includes("tiktok.com");
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  // Handle Instagram separately
  if (isInstagramUrl(url)) {
    try {
      const content = await fetchInstagramContent(url);
      const recipe = await extractRecipeFromText(content);
      recipe.sourceUrl = url;
      return recipe;
    } catch {
      throw new Error(
        "Instagram requires login to access posts. Please copy the recipe text from the Instagram post and paste it using the 'Paste text' option instead."
      );
    }
  }

  // Handle TikTok
  if (isTikTokUrl(url)) {
    throw new Error(
      "TikTok videos can't be scraped directly. Please copy the recipe from the video description or comments and paste it using the 'Paste text' option."
    );
  }

  // Handle YouTube - try to get description
  if (isYouTubeUrl(url)) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });
      const html = await response.text();
      const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/);
      if (descMatch && descMatch[1].length > 50) {
        const recipe = await extractRecipeFromText(descMatch[1]);
        recipe.sourceUrl = url;
        return recipe;
      }
      throw new Error("NO_RECIPE");
    } catch {
      throw new Error(
        "Couldn't find a recipe in this YouTube video description. Please copy the recipe from the description and paste it using the 'Paste text' option."
      );
    }
  }

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
