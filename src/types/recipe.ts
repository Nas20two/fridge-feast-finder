export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  imageLoading?: boolean;
}

export interface AnalyzeResult {
  ingredients: string[];
}
