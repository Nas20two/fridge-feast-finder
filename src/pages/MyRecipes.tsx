import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Link as LinkIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { importRecipeFromURL } from "@/lib/gemini";
import type { SavedRecipe } from "@/types/recipe";
import RecipeDetailDialog from "@/components/RecipeDetailDialog";
import { useNavigate } from "react-router-dom";

const MyRecipes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIngredients, setNewIngredients] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  const fetchRecipes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRecipes((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRecipes();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="mb-2 font-serif text-2xl font-bold">Sign in to save recipes</h2>
        <p className="mb-4 text-muted-foreground">Create an account to save, import, and organize your recipes.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const data = await importRecipeFromURL(importUrl.trim());
      if (!data) throw new Error("Failed to parse recipe");
      // Save imported recipe
      const { error: saveErr } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        servings: data.servings || 4,
        source_url: importUrl.trim(),
        source_type: "imported",
      } as any);
      if (saveErr) throw saveErr;
      setImportUrl("");
      fetchRecipes();
      toast({ title: "Recipe imported!" });
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleAddManual = async () => {
    if (!newTitle.trim()) return;
    try {
      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        title: newTitle.trim(),
        ingredients: newIngredients.split("\n").filter(Boolean),
        instructions: newInstructions.split("\n").filter(Boolean),
        servings: 4,
        source_type: "manual",
      } as any);
      if (error) throw error;
      setAddOpen(false);
      setNewTitle("");
      setNewIngredients("");
      setNewInstructions("");
      fetchRecipes();
      toast({ title: "Recipe added!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_recipes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-3xl font-bold">My Recipes</h2>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Recipe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Add Your Own Recipe</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Recipe name" /></div>
                <div><Label>Ingredients (one per line)</Label><Textarea value={newIngredients} onChange={(e) => setNewIngredients(e.target.value)} placeholder="1 cup flour&#10;2 eggs" className="min-h-[100px]" /></div>
                <div><Label>Instructions (one per line)</Label><Textarea value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} placeholder="Step 1...&#10;Step 2..." className="min-h-[100px]" /></div>
                <Button onClick={handleAddManual} className="w-full">Save Recipe</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Import URL */}
      <Card className="mb-6">
        <CardContent className="flex gap-2 p-4">
          <Input
            placeholder="Paste a recipe URL to import..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
          />
          <Button onClick={handleImportUrl} disabled={importing || !importUrl.trim()}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : recipes.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-5xl mb-4">📖</p>
          <p>No saved recipes yet. Generate some or add your own!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, i) => (
            <motion.div key={recipe.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg" onClick={() => setSelectedRecipe(recipe)}>
                {recipe.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={recipe.image_url} alt={recipe.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-bold">{recipe.title}</h3>
                      <p className="text-xs text-muted-foreground">{recipe.source_type} • {(recipe.ingredients as string[]).length} ingredients</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailDialog recipe={selectedRecipe} open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

export default MyRecipes;
