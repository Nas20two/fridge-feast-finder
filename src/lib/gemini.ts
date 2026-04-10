// Supabase Edge Function calls
// Uses Gemini 2.0 Flash (Fast + Free)

import { supabase } from '@/integrations/supabase/client';

export async function analyzeIngredients(text: string) {
  const { data, error } = await supabase.functions.invoke('analyze-ingredients', {
    body: { text }
  });
  
  if (error) throw new Error(error.message || 'Failed to analyze ingredients');
  if (data.error) throw new Error(data.error);
  
  return data.ingredients || [];
}

export async function generateRecipes(ingredients: string[]) {
  const { data, error } = await supabase.functions.invoke('generate-recipes', {
    body: { ingredients }
  });
  
  if (error) throw new Error(error.message || 'Failed to generate recipes');
  if (data.error) throw new Error(data.error);
  
  return { recipes: data.recipes || [] };
}

export async function importRecipeFromURL(url: string) {
  const { data, error } = await supabase.functions.invoke('import-recipe', {
    body: { url }
  });
  
  if (error) throw new Error(error.message || 'Failed to import recipe');
  if (data.error) throw new Error(data.error);
  
  return data;
}

export async function generateDishImage(title: string, ingredients: string[]) {
  const { data, error } = await supabase.functions.invoke('generate-dish-image', {
    body: { title, ingredients }
  });
  
  if (error) {
    console.error('Image generation error:', error);
    return null;
  }
  if (data.error) {
    console.error('Image generation error:', data.error);
    return null;
  }
  
  return data.imageUrl || null;
}
