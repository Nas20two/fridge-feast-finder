import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Share2, Play, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavedRecipe } from "@/types/recipe";
import CookingMode from "./CookingMode";

interface Props {
  recipe: SavedRecipe;
  open: boolean;
  onClose: () => void;
}

const metricToImperial: Record<string, string> = {
  ml: "fl oz", g: "oz", kg: "lb", l: "qt", cm: "in",
};
const conversionFactors: Record<string, number> = {
  ml: 0.0338, g: 0.0353, kg: 2.205, l: 1.057, cm: 0.3937,
};

function scaleIngredient(ing: string, factor: number, useImperial: boolean): string {
  return ing.replace(/(\d+\.?\d*)\s*(ml|g|kg|l|cm|cup|cups|tbsp|tsp|oz|lb)?/gi, (match, num, unit) => {
    let scaled = parseFloat(num) * factor;
    let u = unit || "";
    if (useImperial && u && conversionFactors[u.toLowerCase()]) {
      scaled *= conversionFactors[u.toLowerCase()];
      u = metricToImperial[u.toLowerCase()] || u;
    }
    return `${Math.round(scaled * 100) / 100} ${u}`;
  });
}

const RecipeDetailDialog = ({ recipe, open, onClose }: Props) => {
  const [servings, setServings] = useState(recipe.servings || 4);
  const [useImperial, setUseImperial] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const { toast } = useToast();
  const factor = servings / (recipe.servings || 4);
  const ingredients = recipe.ingredients as string[];
  const instructions = recipe.instructions as string[];

  const handleShare = async () => {
    const text = `${recipe.title}\n\nIngredients:\n${ingredients.join("\n")}\n\nInstructions:\n${instructions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    }
  };

  if (cookingMode) {
    return <CookingMode instructions={instructions} title={recipe.title} onExit={() => setCookingMode(false)} />;
  }

  const nutrition = recipe.nutrition as { calories?: number; protein?: number; carbs?: number; fat?: number } | null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{recipe.title}</DialogTitle>
        </DialogHeader>

        {recipe.image_url && (
          <img src={recipe.image_url} alt={recipe.title} className="w-full rounded-lg object-cover max-h-64" />
        )}

        {nutrition && (
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline">🔥 {Math.round((nutrition.calories || 0) * factor)} cal</Badge>
            <Badge variant="outline">💪 {Math.round((nutrition.protein || 0) * factor)}g protein</Badge>
            <Badge variant="outline">🌾 {Math.round((nutrition.carbs || 0) * factor)}g carbs</Badge>
            <Badge variant="outline">🧈 {Math.round((nutrition.fat || 0) * factor)}g fat</Badge>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Servings: {servings}</span>
          <Slider value={[servings]} onValueChange={([v]) => setServings(v)} min={1} max={12} step={1} className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setUseImperial(!useImperial)}>
            <Ruler className="mr-1 h-3 w-3" />{useImperial ? "Metric" : "Imperial"}
          </Button>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Ingredients</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {ingredients.map((ing, i) => <li key={i}>{scaleIngredient(ing, factor, useImperial)}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Instructions</h4>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            {instructions.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCookingMode(true)} className="flex-1"><Play className="mr-1 h-4 w-4" /> Cooking Mode</Button>
          <Button variant="outline" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
