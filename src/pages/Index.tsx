import { useState } from "react";
import { analyzeIngredients, generateRecipes, generateDishImage } from "@/lib/gemini";
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
      const ingredients = await analyzeIngredients(data.text || '');
      setIngredients(ingredients);
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
      const result = await generateRecipes(confirmedIngredients);

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
      setRecipesLoading(false);

      // Fetch images for each recipe in parallel
      recipesWithLoading.forEach(async (recipe, index) => {
        try {
          const imageUrl = await generateDishImage(recipe.title, recipe.ingredients);
          setRecipes(prev => prev.map((r, i) => 
            i === index ? { ...r, imageUrl: imageUrl || undefined, imageLoading: false } : r
          ));
        } catch (e) {
          console.error(`Failed to generate image for ${recipe.title}:`, e);
          setRecipes(prev => prev.map((r, i) => 
            i === index ? { ...r, imageLoading: false } : r
          ));
        }
      });
    } catch (e: any) {
      toast({ title: "Error generating recipes", description: e.message, variant: "destructive" });
      setStep("edit");
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
        Made by NaSy
      </footer>
    </div>
  );
};

export default Index;
