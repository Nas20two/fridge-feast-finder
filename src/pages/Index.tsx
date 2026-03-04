import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import HeroSection from "@/components/HeroSection";
import IngredientInput from "@/components/IngredientInput";
import IngredientEditor from "@/components/IngredientEditor";
import RecipeResults from "@/components/RecipeResults";
import CookingLoader from "@/components/CookingLoader";
import type { Recipe } from "@/types/recipe";

type Step = "input" | "edit" | "loading" | "results";

const Index = () => {
  const [step, setStep] = useState<Step>("input");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [analyzingLoading, setAnalyzingLoading] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (data: { image?: string; text?: string }) => {
    setAnalyzingLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-ingredients", {
        body: data,
      });
      if (error) throw error;
      setIngredients(result.ingredients);
      setStep("edit");
    } catch (e: any) {
      toast({ title: "Error analyzing ingredients", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzingLoading(false);
    }
  };

  const handleGenerateRecipes = async (confirmedIngredients: string[]) => {
    setRecipesLoading(true);
    setStep("loading");
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-recipes", {
        body: { ingredients: confirmedIngredients },
      });
      if (error) throw error;

      const recipesWithLoading: Recipe[] = result.recipes.map((r: any, i: number) => ({
        id: `recipe-${i}`,
        title: r.title,
        ingredients: r.ingredients,
        instructions: r.instructions,
        nutrition: r.nutrition,
        servings: r.servings || 4,
        imageUrl: undefined,
        imageLoading: true,
      }));
      setRecipes(recipesWithLoading);
      setStep("results");

      // Generate images in parallel
      recipesWithLoading.forEach(async (recipe, i) => {
        try {
          const { data: imgResult, error: imgError } = await supabase.functions.invoke("generate-dish-image", {
            body: { title: recipe.title, ingredients: recipe.ingredients },
          });
          if (imgError) throw imgError;
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === recipe.id ? { ...r, imageUrl: imgResult.imageUrl, imageLoading: false } : r
            )
          );
        } catch {
          setRecipes((prev) =>
            prev.map((r) => (r.id === recipe.id ? { ...r, imageLoading: false } : r))
          );
        }
      });
    } catch (e: any) {
      toast({ title: "Error generating recipes", description: e.message, variant: "destructive" });
      setStep("edit");
    } finally {
      setRecipesLoading(false);
    }
  };

  const reset = () => {
    setStep("input");
    setIngredients([]);
    setRecipes([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      {step === "input" && (
        <IngredientInput onSubmit={handleAnalyze} isLoading={analyzingLoading} />
      )}
      {step === "edit" && (
        <IngredientEditor
          ingredients={ingredients}
          onConfirm={handleGenerateRecipes}
          onBack={reset}
          isLoading={recipesLoading}
        />
      )}
      {step === "loading" && <CookingLoader />}
      {step === "results" && <RecipeResults recipes={recipes} onReset={reset} />}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        Made with 💚 by Recipe Genie
      </footer>
    </div>
  );
};

export default Index;
