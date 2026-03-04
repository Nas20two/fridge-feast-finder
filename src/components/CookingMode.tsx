import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  instructions: string[];
  title: string;
  onExit: () => void;
}

const CookingMode = ({ instructions, title, onExit }: Props) => {
  const [step, setStep] = useState(0);

  // Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch {}
    };
    request();
    return () => { wakeLock?.release(); };
  }, []);

  // Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff > 60 && step > 0) setStep(step - 1);
    if (diff < -60 && step < instructions.length - 1) setStep(step + 1);
    setTouchStart(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-serif text-lg font-bold truncate">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onExit}><X className="h-5 w-5" /></Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <p className="mb-4 text-sm text-muted-foreground">Step {step + 1} of {instructions.length}</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center text-2xl font-medium leading-relaxed md:text-3xl"
          >
            {instructions[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / instructions.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-4">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {step < instructions.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onExit}>Done 🎉</Button>
        )}
      </div>
    </div>
  );
};

export default CookingMode;
