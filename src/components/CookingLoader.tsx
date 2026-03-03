import { motion } from "framer-motion";

const emojis = ["🥘", "🍳", "🥗", "🍲"];

const CookingLoader = ({ message = "Cooking up recipes..." }: { message?: string }) => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
      <div className="flex gap-3 mb-6">
        {emojis.map((emoji, i) => (
          <motion.span
            key={i}
            className="text-4xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, repeatDelay: 1 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="text-lg font-medium text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default CookingLoader;
