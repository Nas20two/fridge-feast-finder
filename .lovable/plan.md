

## Recipe Genie Remix — Implementation Plan

### Overview
A warm, food-themed app where users upload a photo of their fridge contents **or** type in ingredients, and the app identifies ingredients and generates 4 recipe suggestions with AI-generated dish images.

### Color Theme
Warm & cozy using the green palette provided (primary greens, earthy neutrals). Food-themed typography and soft rounded cards.

### Pages & Layout

1. **Home / Landing Page**
   - Hero section with tagline "Transform your fridge leftovers into delicious meals"
   - Two input options side by side: **Upload a photo** or **Type your ingredients**
   - Warm green gradient background, inviting illustration/icon

2. **Results Page**
   - Loading state with cooking-themed animation while AI processes
   - Grid of 4 recipe cards, each showing:
     - AI-generated photorealistic dish image
     - Recipe title
     - Ingredient list
     - Step-by-step instructions (expandable)
   - "Try again" button to go back

3. **Optional Auth** (save favorites)
   - Simple sign-in/sign-up via Supabase Auth (email)
   - Heart icon on recipe cards to save favorites
   - Saved recipes page accessible from nav

### Backend (Lovable Cloud + Supabase Edge Functions)

1. **`analyze-ingredients` edge function**
   - Accepts image (base64) and/or text input
   - Uses Lovable AI (Gemini) to identify ingredients from image/text
   - Returns ingredient list

2. **`generate-recipes` edge function**
   - Takes ingredient list, generates 4 recipes with titles, ingredients, instructions
   - Uses structured output (tool calling) for consistent format

3. **`generate-dish-image` edge function**
   - Takes recipe description, generates photorealistic dish image using Gemini image model
   - Returns base64 image data

4. **Database tables** (if auth enabled)
   - `saved_recipes` — stores favorited recipes per user

### User Flow
1. User lands on home page → uploads photo OR types ingredients
2. App calls `analyze-ingredients` → shows identified ingredients (user can edit)
3. App calls `generate-recipes` → streams/displays 4 recipe cards
4. Each card's dish image generated via `generate-dish-image`
5. Optionally save favorites (requires sign-in)

