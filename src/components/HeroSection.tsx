import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-16 md:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🥕</div>
        <div className="absolute top-20 right-20 text-5xl">🍅</div>
        <div className="absolute bottom-10 left-1/4 text-4xl">🧅</div>
        <div className="absolute bottom-20 right-1/3 text-6xl">🥦</div>
        <div className="absolute top-1/3 left-1/2 text-5xl">🌶️</div>
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <ChefHat className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
            Recipe Genie
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Transform your fridge leftovers into delicious meals. Upload a photo or type your ingredients — we'll conjure up amazing recipes!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
