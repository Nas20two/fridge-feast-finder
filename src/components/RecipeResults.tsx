import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecipeCard from "./RecipeCard";
import type { Recipe } from "@/types/recipe";

interface RecipeResultsProps {
  recipes: Recipe[];
  onReset: () => void;
}

const RecipeResults = ({ recipes, onReset }: RecipeResultsProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif md:text-3xl">Your Recipes</h2>
          <Button variant="outline" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {recipes.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RecipeResults;
