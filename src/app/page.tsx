"use client";

import { useState } from "react";
import { ChefHat, Sparkles, Clock, ShoppingCart, BookOpen, Zap, Check, ArrowRight, Star, Loader2 } from "lucide-react";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface ExtractedRecipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  imageUrl: string | null;
  sourceUrl: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setRecipe(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setRecipe(data.recipe);
      }
    } catch {
      setError("Failed to extract recipe. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-orange-600" />
            <span className="text-xl font-bold text-stone-900">CleanRecipe</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-stone-600 hover:text-stone-900 text-sm font-medium">Pricing</a>
            <a href="#features" className="text-stone-600 hover:text-stone-900 text-sm font-medium">Features</a>
            <a href="/dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition">
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-powered recipe extraction
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight mb-6">
            Paste any URL.<br />
            <span className="text-orange-600">Get just the recipe.</span>
          </h1>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
            No more scrolling past life stories and ads. CleanRecipe extracts the recipe from any website in seconds. Save it, scale it, cook it.
          </p>

          {/* The Try-It Input */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white rounded-xl shadow-lg border border-stone-200 p-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="Paste a recipe URL — try it free, no signup needed"
                className="flex-1 px-4 py-3 text-stone-900 placeholder:text-stone-400 bg-transparent outline-none text-lg"
              />
              <button
                onClick={handleExtract}
                disabled={loading || !url.trim()}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Extract Recipe
                  </>
                )}
              </button>
            </div>
            <p className="text-stone-400 text-sm mt-3">
              Try it: paste a URL from AllRecipes, NYT Cooking, Food Network, or any recipe site
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Extracted Recipe Preview */}
      {recipe && (
        <section className="pb-20 px-4" id="result">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
              {/* Recipe Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                <div className="flex items-center gap-2 text-orange-100 text-sm mb-2">
                  <Sparkles className="h-4 w-4" />
                  Extracted in seconds — no life story, no ads
                </div>
                <h2 className="text-3xl font-bold text-white">{recipe.title}</h2>
                <p className="text-orange-100 mt-2">{recipe.description}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 border-b border-stone-200">
                <div className="p-4 text-center border-r border-stone-200">
                  <Clock className="h-5 w-5 text-stone-400 mx-auto mb-1" />
                  <div className="text-sm text-stone-500">Prep</div>
                  <div className="font-semibold text-stone-900">{recipe.prepTime}</div>
                </div>
                <div className="p-4 text-center border-r border-stone-200">
                  <Clock className="h-5 w-5 text-stone-400 mx-auto mb-1" />
                  <div className="text-sm text-stone-500">Cook</div>
                  <div className="font-semibold text-stone-900">{recipe.cookTime}</div>
                </div>
                <div className="p-4 text-center">
                  <BookOpen className="h-5 w-5 text-stone-400 mx-auto mb-1" />
                  <div className="text-sm text-stone-500">Servings</div>
                  <div className="font-semibold text-stone-900">{recipe.servings}</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="p-6 border-b border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-orange-300 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">
                        <span className="font-medium">{ing.amount} {ing.unit}</span>{" "}
                        {ing.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="p-6 border-b border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Instructions</h3>
                <ol className="space-y-4">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </span>
                      <p className="text-stone-700 leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="p-6 border-b border-stone-200">
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 bg-stone-50 text-center">
                <p className="text-stone-600 mb-3">Want to save this recipe forever?</p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Save Recipe — Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4 bg-white" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-stone-600 text-lg">No ads. No life stories. No bloat. Just recipes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-6 w-6" />,
                title: "AI Recipe Extraction",
                description: "Paste any URL — food blogs, Instagram, YouTube, TikTok — and get a clean, structured recipe in seconds.",
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Your Digital Cookbook",
                description: "Save, organize, search, and tag your recipes. Never lose a recipe to a dead bookmark again.",
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Smart Scaling",
                description: "Cooking for 2 instead of 6? Adjust servings and every ingredient recalculates instantly.",
              },
              {
                icon: <ShoppingCart className="h-6 w-6" />,
                title: "Grocery Lists",
                description: "One click adds all ingredients to your shopping list. Check items off as you shop.",
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "No Subscription Fatigue",
                description: "Free tier with 15 recipes. Pro is $4.99/mo — less than a single takeout order.",
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "Works Everywhere",
                description: "Responsive web app that works beautifully on your phone, tablet, or desktop.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Paste a URL", desc: "Copy any recipe URL from the web" },
              { step: "2", title: "AI extracts it", desc: "Our AI pulls out just the recipe — no bloat" },
              { step: "3", title: "Save & cook", desc: "Save to your cookbook, adjust servings, shop" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Simple, honest pricing</h2>
          <p className="text-stone-600 text-lg mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-left">
              <h3 className="text-lg font-bold text-stone-900 mb-1">Free</h3>
              <div className="text-3xl font-bold text-stone-900 mb-6">$0<span className="text-base font-normal text-stone-500">/forever</span></div>
              <ul className="space-y-3 mb-8">
                {["15 saved recipes", "AI recipe extraction", "Serving scaler", "Search & organize", "Grocery list (1)"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-stone-700">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/dashboard" className="block text-center bg-stone-200 text-stone-700 px-6 py-3 rounded-lg font-semibold hover:bg-stone-300 transition">
                Get Started Free
              </a>
            </div>

            {/* Pro */}
            <div className="bg-orange-50 rounded-2xl border-2 border-orange-300 p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Pro</h3>
              <div className="text-3xl font-bold text-stone-900 mb-1">
                $4.99<span className="text-base font-normal text-stone-500">/month</span>
              </div>
              <p className="text-stone-500 text-sm mb-6">or $29.99/year (save 50%)</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited recipes",
                  "AI recipe extraction",
                  "Serving scaler",
                  "Search & organize",
                  "Unlimited grocery lists",
                  "Priority extraction",
                  "Export recipes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-stone-700">
                    <Check className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/dashboard" className="block text-center bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "What URLs does it work with?",
                a: "Almost any recipe website — AllRecipes, NYT Cooking, Food Network, Bon Appétit, food blogs, and more. Our AI can extract recipes from nearly any page format.",
              },
              {
                q: "Is it really free?",
                a: "Yes! Save up to 15 recipes completely free. No credit card required. Upgrade to Pro only if you need unlimited storage.",
              },
              {
                q: "What about Instagram and TikTok recipes?",
                a: "Coming soon! We're building support for social media recipe extraction. For now, you can paste the text of any recipe manually.",
              },
              {
                q: "Can I import from other recipe apps?",
                a: "We're working on import from Paprika, Mela, and other popular recipe managers. Stay tuned!",
              },
              {
                q: "Is my data safe?",
                a: "Your recipes are stored securely and never shared. We don't sell your data or show you ads.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="font-bold text-stone-900 mb-2">{item.q}</h3>
                <p className="text-stone-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            <span className="text-white font-bold">CleanRecipe</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CleanRecipe. Made with 🧡 for home cooks.</p>
        </div>
      </footer>
    </div>
  );
}
