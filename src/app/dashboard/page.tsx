"use client";

import { useState } from "react";
import {
  ChefHat, Plus, Search, ShoppingCart, Zap, Loader2,
  Clock, BookOpen, ArrowLeft, Trash2, X,
} from "lucide-react";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface Recipe {
  id: string;
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

interface GroceryItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function Dashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showExtract, setShowExtract] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [showGrocery, setShowGrocery] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const FREE_LIMIT = 15;

  const handleExtract = async () => {
    if (!url.trim()) return;
    if (recipes.length >= FREE_LIMIT) {
      setError(`Free plan limit reached (${FREE_LIMIT} recipes). Upgrade to Pro for unlimited recipes.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      const newRecipe: Recipe = {
        id: Date.now().toString(),
        ...data.recipe,
      };

      setRecipes((prev) => [newRecipe, ...prev]);
      setUrl("");
      setShowExtract(false);
      setSelectedRecipe(newRecipe);
    } catch {
      setError("Failed to extract recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const addToGrocery = (recipe: Recipe) => {
    const newItems: GroceryItem[] = recipe.ingredients.map((ing) => ({
      id: `${Date.now()}-${Math.random()}`,
      text: `${ing.amount} ${ing.unit} ${ing.item}`.trim(),
      checked: false,
    }));
    setGroceryList((prev) => [...prev, ...newItems]);
    setShowGrocery(true);
  };

  const toggleGroceryItem = (id: string) => {
    setGroceryList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const clearChecked = () => {
    setGroceryList((prev) => prev.filter((item) => !item.checked));
  };

  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const scaleAmount = (amount: string) => {
    if (servingMultiplier === 1) return amount;
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    const scaled = num * servingMultiplier;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-stone-200">
          <a href="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <span className="text-lg font-bold text-stone-900">CleanRecipe</span>
          </a>
        </div>

        {/* Actions */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => { setShowExtract(true); setSelectedRecipe(null); setShowGrocery(false); }}
            className="w-full flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Recipe
          </button>
          <button
            onClick={() => { setShowGrocery(true); setSelectedRecipe(null); setShowExtract(false); }}
            className="w-full flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2.5 rounded-lg font-medium hover:bg-stone-200 transition text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Grocery List
            {groceryList.length > 0 && (
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {groceryList.filter((i) => !i.checked).length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes..."
              className="bg-transparent text-sm text-stone-900 outline-none w-full placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="text-xs text-stone-400 font-medium px-1 py-2">
            {recipes.length}/{FREE_LIMIT} recipes
          </div>
          <div className="space-y-1">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => { setSelectedRecipe(recipe); setShowExtract(false); setShowGrocery(false); setServingMultiplier(1); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition group ${
                  selectedRecipe?.id === recipe.id
                    ? "bg-orange-50 text-orange-900 border border-orange-200"
                    : "hover:bg-stone-100 text-stone-700"
                }`}
              >
                <div className="font-medium truncate">{recipe.title}</div>
                <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {recipe.totalTime}
                  <span>•</span>
                  {recipe.servings} servings
                </div>
              </button>
            ))}
            {recipes.length === 0 && (
              <div className="text-center text-stone-400 text-sm py-8">
                No recipes yet.<br />Click &quot;Add Recipe&quot; to start!
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Extract Form */}
        {showExtract && (
          <div className="max-w-2xl mx-auto py-12 px-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Add a Recipe</h1>
            <p className="text-stone-600 mb-8">Paste a URL from any recipe website and our AI will extract it cleanly.</p>

            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="https://example.com/amazing-recipe"
                className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <button
                onClick={handleExtract}
                disabled={loading || !url.trim()}
                className="bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                {loading ? "Extracting..." : "Extract"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Recipe Detail */}
        {selectedRecipe && !showExtract && !showGrocery && (
          <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToGrocery(selectedRecipe)}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Grocery List
                </button>
                <button
                  onClick={() => deleteRecipe(selectedRecipe.id)}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-stone-900 mb-2">{selectedRecipe.title}</h1>
            <p className="text-stone-600 mb-6">{selectedRecipe.description}</p>

            {/* Meta bar */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-stone-600">
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-stone-400" />Prep: {selectedRecipe.prepTime}</div>
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-stone-400" />Cook: {selectedRecipe.cookTime}</div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-stone-400" />
                Servings:
                <select
                  value={servingMultiplier}
                  onChange={(e) => setServingMultiplier(Number(e.target.value))}
                  className="bg-white border border-stone-200 rounded px-2 py-0.5 text-stone-900 font-medium"
                >
                  {[0.5, 1, 1.5, 2, 3, 4].map((m) => (
                    <option key={m} value={m}>
                      {Math.round(selectedRecipe.servings * m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-stone-900 mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 py-1">
                    <div className="w-5 h-5 rounded border-2 border-stone-300 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-700">
                      <span className="font-medium">{scaleAmount(ing.amount)} {ing.unit}</span> {ing.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-stone-900 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {selectedRecipe.steps.map((step, i) => (
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
            {selectedRecipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedRecipe.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            )}

            {selectedRecipe.sourceUrl && (
              <div className="text-sm text-stone-400">
                Source: <a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">{selectedRecipe.sourceUrl}</a>
              </div>
            )}
          </div>
        )}

        {/* Grocery List */}
        {showGrocery && (
          <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-stone-900">Grocery List</h1>
              {groceryList.some((i) => i.checked) && (
                <button onClick={clearChecked} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Clear checked items
                </button>
              )}
            </div>

            {groceryList.length === 0 ? (
              <div className="text-center text-stone-400 py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Your grocery list is empty.</p>
                <p className="text-sm mt-1">Open a recipe and click &quot;Add to Grocery List&quot;</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {groceryList.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 cursor-pointer transition ${
                      item.checked ? "opacity-50" : ""
                    }`}
                    onClick={() => toggleGroceryItem(item.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                      item.checked ? "bg-green-500 border-green-500" : "border-stone-300"
                    }`}>
                      {item.checked && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-stone-700 ${item.checked ? "line-through" : ""}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGroceryList((prev) => prev.filter((i) => i.id !== item.id)); }}
                      className="ml-auto text-stone-300 hover:text-red-500 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedRecipe && !showExtract && !showGrocery && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-stone-400">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h2 className="text-xl font-semibold text-stone-500 mb-2">Welcome to CleanRecipe</h2>
              <p className="mb-4">Add your first recipe to get started</p>
              <button
                onClick={() => setShowExtract(true)}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Add Recipe
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
