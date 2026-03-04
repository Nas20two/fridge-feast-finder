import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Library, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { SavedRecipe } from "@/types/recipe";

interface Cookbook {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  created_at: string;
}

const Cookbooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCookbook, setSelectedCookbook] = useState<Cookbook | null>(null);
  const [cbRecipes, setCbRecipes] = useState<SavedRecipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<SavedRecipe[]>([]);
  const [addRecipeOpen, setAddRecipeOpen] = useState(false);

  const fetchCookbooks = async () => {
    const { data } = await supabase.from("cookbooks").select("*").order("created_at", { ascending: false });
    setCookbooks(((data as any[]) || []).map((c: any) => ({ ...c, tags: (c.tags as string[]) || [] })));
    setLoading(false);
  };

  const fetchCookbookRecipes = async (cbId: string) => {
    const { data } = await supabase.from("cookbook_recipes").select("recipe_id").eq("cookbook_id", cbId);
    const ids = ((data as any[]) || []).map((r: any) => r.recipe_id);
    if (ids.length > 0) {
      const { data: recipes } = await supabase.from("saved_recipes").select("*").in("id", ids);
      setCbRecipes((recipes as any[]) || []);
    } else {
      setCbRecipes([]);
    }
    const { data: all } = await supabase.from("saved_recipes").select("*");
    setAllRecipes((all as any[]) || []);
  };

  useEffect(() => {
    if (user) fetchCookbooks();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (selectedCookbook) fetchCookbookRecipes(selectedCookbook.id);
  }, [selectedCookbook]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <Library className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 font-serif text-2xl font-bold">Sign in for Cookbooks</h2>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const createCookbook = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("cookbooks").insert({
      user_id: user.id,
      name: name.trim(),
      description: desc.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCreateOpen(false);
    setName("");
    setDesc("");
    setTags("");
    fetchCookbooks();
  };

  const deleteCookbook = async (id: string) => {
    await supabase.from("cookbooks").delete().eq("id", id);
    setCookbooks((prev) => prev.filter((c) => c.id !== id));
    if (selectedCookbook?.id === id) setSelectedCookbook(null);
  };

  const addRecipeToCookbook = async (recipeId: string) => {
    if (!selectedCookbook) return;
    const { error } = await supabase.from("cookbook_recipes").insert({ cookbook_id: selectedCookbook.id, recipe_id: recipeId } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchCookbookRecipes(selectedCookbook.id);
    setAddRecipeOpen(false);
  };

  const removeRecipeFromCookbook = async (recipeId: string) => {
    if (!selectedCookbook) return;
    await supabase.from("cookbook_recipes").delete().eq("cookbook_id", selectedCookbook.id).eq("recipe_id", recipeId);
    setCbRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  if (selectedCookbook) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCookbook(null)} className="mb-2">← Back</Button>
            <h2 className="font-serif text-3xl font-bold">{selectedCookbook.name}</h2>
            {selectedCookbook.description && <p className="text-muted-foreground">{selectedCookbook.description}</p>}
          </div>
          <Dialog open={addRecipeOpen} onOpenChange={setAddRecipeOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Recipe</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Add Recipe to Cookbook</DialogTitle></DialogHeader>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {allRecipes.filter((r) => !cbRecipes.find((cr) => cr.id === r.id)).map((r) => (
                  <Button key={r.id} variant="outline" className="w-full justify-start" onClick={() => addRecipeToCookbook(r.id)}>{r.title}</Button>
                ))}
                {allRecipes.length === 0 && <p className="text-sm text-muted-foreground">No saved recipes to add.</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {cbRecipes.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No recipes in this cookbook yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cbRecipes.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                {r.image_url && <img src={r.image_url} alt={r.title} className="aspect-video w-full object-cover" />}
                <CardContent className="p-4 flex items-start justify-between">
                  <h3 className="font-serif font-bold">{r.title}</h3>
                  <Button variant="ghost" size="icon" onClick={() => removeRecipeFromCookbook(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold">Cookbooks</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Cookbook</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Create Cookbook</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Weeknight Dinners" /></div>
              <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Quick meals for busy evenings" /></div>
              <div><Label>Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dinner, quick, healthy" /></div>
              <Button onClick={createCookbook} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : cookbooks.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-5xl mb-4">📚</p>
          <p>No cookbooks yet. Create one to organize your recipes!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cookbooks.map((cb, i) => (
            <motion.div key={cb.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => setSelectedCookbook(cb)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-serif text-lg font-bold">{cb.name}</h3>
                        {cb.description && <p className="text-sm text-muted-foreground">{cb.description}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteCookbook(cb.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {cb.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cb.tags.map((tag, j) => <Badge key={j} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cookbooks;
