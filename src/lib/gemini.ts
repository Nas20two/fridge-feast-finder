// Supabase Edge Function calls
// Secure backend API calls - no exposed keys

import { supabase } from '@/integrations/supabase/client';

export async function analyzeIngredients(text: string) {
  const { data, error } = await supabase.functions.invoke('analyze-ingredients', {
    body: { text }
  });
  
  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to analyze ingredients');
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.ingredients || [];
}

export async function generateRecipes(ingredients: string[]) {
  const { data, error } = await supabase.functions.invoke('generate-recipes', {
    body: { ingredients }
  });
  
  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to generate recipes');
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data || { recipes: [] };
}

export async function importRecipeFromURL(url: string) {
  const { data, error } = await supabase.functions.invoke('import-recipe', {
    body: { url }
  });
  
  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to import recipe');
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}
