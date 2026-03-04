import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
  aisle: string | null;
  recipe_title: string | null;
}

interface GroceryList {
  id: string;
  name: string;
  created_at: string;
}

const Grocery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeList, setActiveList] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  const fetchLists = async () => {
    const { data } = await supabase.from("grocery_lists").select("*").order("created_at", { ascending: false });
    const l = (data as any[]) || [];
    setLists(l);
    if (l.length > 0 && !activeList) setActiveList(l[0].id);
    setLoading(false);
  };

  const fetchItems = async (listId: string) => {
    const { data } = await supabase.from("grocery_items").select("*").eq("list_id", listId).order("checked", { ascending: true });
    setItems((data as any[]) || []);
  };

  useEffect(() => {
    if (user) fetchLists();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeList) fetchItems(activeList);
  }, [activeList]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 font-serif text-2xl font-bold">Sign in for Grocery Lists</h2>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const createList = async () => {
    const { data, error } = await supabase.from("grocery_lists").insert({ user_id: user.id, name: `List ${lists.length + 1}` } as any).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setLists((prev) => [(data as any), ...prev]);
    setActiveList((data as any).id);
  };

  const addItem = async () => {
    if (!newItem.trim() || !activeList) return;
    const { data, error } = await supabase.from("grocery_items").insert({ list_id: activeList, name: newItem.trim() } as any).select().single();
    if (!error && data) { setItems((prev) => [...prev, data as any]); setNewItem(""); }
  };

  const toggleCheck = async (item: GroceryItem) => {
    await supabase.from("grocery_items").update({ checked: !item.checked } as any).eq("id", item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, checked: !i.checked } : i));
  };

  const deleteItem = async (id: string) => {
    await supabase.from("grocery_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold">Grocery Lists</h2>
        <Button size="sm" onClick={createList}><Plus className="mr-1 h-4 w-4" /> New List</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : lists.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-5xl mb-4">🛒</p>
          <p>No grocery lists yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="space-y-1">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeList === list.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50"}`}
              >
                {list.name}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">{lists.find((l) => l.id === activeList)?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Add item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
                <Button size="icon" onClick={addItem}><Plus className="h-4 w-4" /></Button>
              </div>
              {items.map((item) => (
                <motion.div key={item.id} layout className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleCheck(item)} />
                  <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.name}{item.quantity && ` (${item.quantity})`}</span>
                  {item.recipe_title && <span className="text-xs text-muted-foreground">{item.recipe_title}</span>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Grocery;
