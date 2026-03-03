import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface IngredientEditorProps {
  ingredients: string[];
  onConfirm: (ingredients: string[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

const IngredientEditor = ({ ingredients: initial, onConfirm, onBack, isLoading }: IngredientEditorProps) => {
  const [ingredients, setIngredients] = useState(initial);
  const [newItem, setNewItem] = useState("");

  const remove = (i: number) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const add = () => {
    if (newItem.trim()) {
      setIngredients((prev) => [...prev, newItem.trim()]);
      setNewItem("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            <h3 className="mb-2 text-xl font-semibold font-serif">We found these ingredients</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Edit the list below, then hit "Generate Recipes" when ready.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {ingredients.map((item, i) => (
                <Badge key={i} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                  {item}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => remove(i)} />
                </Badge>
              ))}
            </div>
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Add an ingredient..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
              />
              <Button variant="outline" size="icon" onClick={add}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={() => onConfirm(ingredients)}
                disabled={isLoading || ingredients.length === 0}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating recipes...
                  </>
                ) : (
                  "Generate Recipes 🍳"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default IngredientEditor;
