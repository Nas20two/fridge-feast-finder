import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Type, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface IngredientInputProps {
  onSubmit: (data: { image?: string; text?: string }) => void;
  isLoading: boolean;
}

const IngredientInput = ({ onSubmit, isLoading }: IngredientInputProps) => {
  const [mode, setMode] = useState<"photo" | "text" | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (mode === "photo" && imagePreview) {
      onSubmit({ image: imagePreview });
    } else if (mode === "text" && textInput.trim()) {
      onSubmit({ text: textInput.trim() });
    }
  };

  const reset = () => {
    setMode(null);
    setImagePreview(null);
    setTextInput("");
  };

  return (
    <div className="container mx-auto px-4 -mt-8 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {!mode ? (
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <Card
              className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
              onClick={() => setMode("photo")}
            >
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold font-serif">Upload a Photo</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Snap a picture of your fridge or pantry and we'll identify the ingredients
                </p>
              </CardContent>
            </Card>
            <Card
              className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
              onClick={() => setMode("text")}
            >
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Type className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold font-serif">Type Ingredients</h3>
                <p className="text-center text-sm text-muted-foreground">
                  List what you have on hand and we'll find the perfect recipes
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold font-serif">
                  {mode === "photo" ? "Upload Your Photo" : "Enter Your Ingredients"}
                </h3>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {mode === "photo" ? (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Uploaded food"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          fileInputRef.current?.click();
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-12 transition-colors hover:border-primary hover:bg-accent/50"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder="e.g., chicken breast, rice, bell peppers, soy sauce, garlic..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              )}

              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  (mode === "photo" && !imagePreview) ||
                  (mode === "text" && !textInput.trim())
                }
                className="mt-4 w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing ingredients...
                  </>
                ) : (
                  "Find Recipes ✨"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default IngredientInput;
