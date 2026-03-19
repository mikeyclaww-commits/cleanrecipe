export interface Recipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  prep_time: string;
  cook_time: string;
  total_time: string;
  servings: number;
  ingredients: { amount: string; unit: string; item: string }[];
  steps: string[];
  tags: string[];
  image_url: string | null;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  item: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipe_id: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: "free" | "pro";
  recipe_count: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}
