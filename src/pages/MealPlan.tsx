import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { SavedRecipe } from "@/types/recipe";

const mealTypes = ["Breakfast", "Lunch", "Dinner"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MealSlot {
  id: string;
  day: number;
  meal_type: string;
  recipe_id: string;
  recipe?: SavedRecipe;
}

const MealPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<{ day: number; meal: string } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const ws = format(weekStart, "yyyy-MM-dd");
    const [{ data: slotsData }, { data: recipesData }] = await Promise.all([
      supabase.from("meal_plans").select("*").eq("week_start", ws),
      supabase.from("saved_recipes").select("*"),
    ]);
    const allRecipes = (recipesData as any[]) || [];
    setRecipes(allRecipes);
    const mapped = ((slotsData as any[]) || []).map((s: any) => ({
      ...s,
      recipe: allRecipes.find((r: any) => r.id === s.recipe_id),
    }));
    setSlots(mapped);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user, weekStart]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 font-serif text-2xl font-bold">Sign in for Meal Planning</h2>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const assignRecipe = async (recipeId: string) => {
    if (!adding) return;
    const ws = format(weekStart, "yyyy-MM-dd");
    const { data, error } = await supabase.from("meal_plans").insert({
      user_id: user.id,
      week_start: ws,
      day: adding.day,
      meal_type: adding.meal,
      recipe_id: recipeId,
    } as any).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSlots((prev) => [...prev, { ...(data as any), recipe: recipes.find((r) => r.id === recipeId) }]);
    setAdding(null);
  };

  const removeSlot = async (id: string) => {
    await supabase.from("meal_plans").delete().eq("id", id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold">Meal Plan</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">{format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}</span>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[700px] grid-cols-8 gap-2">
            <div />
            {dayNames.map((d, i) => (
              <div key={i} className="text-center text-sm font-medium text-muted-foreground">
                <p>{d}</p>
                <p className="text-xs">{format(addDays(weekStart, i), "d")}</p>
              </div>
            ))}
            {mealTypes.map((meal) => (
              <>
                <div key={`label-${meal}`} className="flex items-center text-sm font-medium">{meal}</div>
                {dayNames.map((_, dayIdx) => {
                  const slot = slots.find((s) => s.day === dayIdx && s.meal_type === meal);
                  return (
                    <Card key={`${meal}-${dayIdx}`} className="min-h-[80px]">
                      <CardContent className="flex h-full flex-col items-center justify-center p-2">
                        {slot ? (
                          <div className="relative w-full text-center">
                            <p className="text-xs font-medium truncate">{slot.recipe?.title || "Recipe"}</p>
                            <Button variant="ghost" size="icon" className="absolute -top-1 -right-1 h-5 w-5" onClick={() => removeSlot(slot.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : adding?.day === dayIdx && adding?.meal === meal ? (
                          <Select onValueChange={assignRecipe}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick" /></SelectTrigger>
                            <SelectContent>
                              {recipes.map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setAdding({ day: dayIdx, meal })}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {recipes.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-muted-foreground">Save some recipes first to add them to your meal plan.</p>
      )}
    </div>
  );
};

export default MealPlan;
