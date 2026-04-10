import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Heart, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

const RecipeCard = ({ recipe, index }: RecipeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Sign in to save recipes", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image_url: recipe.imageUrl || null,
        nutrition: recipe.nutrition || null,
        servings: recipe.servings || 4,
        source_type: "generated",
      } as any);
      if (error) throw error;
      setSaved(true);
      toast({ title: "Recipe saved! 💚" });
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const text = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.join("\n")}`;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {recipe.imageLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-4xl animate-pulse-cook mb-2">🍽️</div>
                <p className="text-xs text-muted-foreground">Generating image...</p>
              </div>
            </div>
          ) : recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center"><span className="text-5xl">🍽️</span></div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-xl font-bold font-serif">{recipe.title}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSave}
                disabled={saving || saved}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
              </Button>
            </div>
          </div>

          {recipe.nutrition && (
            <div className="mb-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">🔥 {recipe.nutrition.calories} cal</Badge>
              <Badge variant="secondary" className="text-xs">💪 {recipe.nutrition.protein}g</Badge>
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-1.5">
            {recipe.ingredients?.slice(0, 5).map((ing, i) => (
              <Badge key={i} variant="outline" className="text-xs">{ing}</Badge>
            ))}
            {recipe.ingredients?.length || 0 > 5 && (
              <Badge variant="outline" className="text-xs">+{recipe.ingredients?.length || 0 - 5} more</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide instructions" : "Show instructions"}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
              <h4 className="font-semibold text-sm">All Ingredients:</h4>
              <ul className="mb-3 list-disc pl-5 text-sm text-muted-foreground">
                {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
              <h4 className="font-semibold text-sm">Instructions:</h4>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                {recipe.instructions?.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecipeCard;
