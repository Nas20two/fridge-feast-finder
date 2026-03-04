export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  imageLoading?: boolean;
  nutrition?: Nutrition;
  servings?: number;
  sourceUrl?: string;
  sourceType?: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  image_url?: string | null;
  nutrition?: Nutrition | null;
  servings: number;
  source_url?: string | null;
  source_type?: string | null;
  created_at: string;
}

export interface AnalyzeResult {
  ingredients: string[];
}
