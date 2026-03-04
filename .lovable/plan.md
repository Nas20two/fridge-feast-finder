

## Plan: Add Features + PWA

This is a large scope expansion. I'll implement the features that are feasible for a web app, organized into phases.

### What We'll Build

**Phase 1 — Database & Auth Setup**
- Create tables: `profiles`, `saved_recipes`, `grocery_lists`, `grocery_items`, `meal_plans`, `cookbooks`, `cookbook_recipes`
- Auth pages (sign-up/sign-in) with email
- Profile management

**Phase 2 — Recipe Enhancements**
- **Save recipes** — Heart icon on recipe cards, persists to `saved_recipes` table
- **Import recipes from URL** — New edge function `import-recipe` that takes a URL (Instagram, YouTube, blog, etc.), uses AI to extract recipe data
- **Add your own recipes** — Manual recipe creation form
- **Nutrition info** — AI-generated calories, protein, carbs, fat per recipe (added to generate-recipes output)
- **Adjust servings** — Serving size slider that scales ingredient quantities
- **Convert measurements** — Toggle between metric and imperial
- **Share recipes** — Web Share API button on each recipe card (falls back to copy-link)

**Phase 3 — Grocery Lists**
- Generate grocery list from selected recipes
- Sort by aisle or by recipe
- Check off items as you shop
- Dedicated `/grocery` page

**Phase 4 — Meal Planning**
- Weekly meal planner grid (breakfast/lunch/dinner × 7 days)
- Drag or assign saved recipes to slots
- `/meal-plan` page

**Phase 5 — Cookbooks**
- Create named collections (e.g., "Weeknight Dinners", "Keto")
- Tag by meal type, cuisine, diet
- `/cookbooks` page

**Phase 6 — Cooking Mode**
- Step-by-step instruction view with large text
- Wake Lock API to keep screen on while cooking
- Swipe/tap to advance steps

**Phase 7 — PWA Setup**
- Install `vite-plugin-pwa`
- Configure manifest with app name, icons, theme color (green palette)
- Add mobile meta tags to `index.html`
- Service worker with offline caching
- `/install` page with install prompt
- Add `/~oauth` to `navigateFallbackDenylist`

**Phase 8 — Navigation & Layout**
- Bottom tab navigation (mobile) / sidebar (desktop): Home, My Recipes, Grocery List, Meal Plan, Cookbooks
- User avatar/menu in header for auth

### Features NOT included (require native integrations)
- **Order Groceries** — Requires delivery service API integration
- **AirDrop** — Native iOS only
- **Access across iOS/iPad** — Covered by PWA installability

### New Pages
| Route | Purpose |
|---|---|
| `/` | Home (existing) |
| `/auth` | Sign in / Sign up |
| `/my-recipes` | Saved + imported recipes |
| `/recipe/:id` | Full recipe detail view |
| `/grocery` | Grocery lists |
| `/meal-plan` | Weekly meal planner |
| `/cookbooks` | Cookbook collections |
| `/cookbook/:id` | Single cookbook |
| `/install` | PWA install prompt |

### New Edge Functions
- `import-recipe` — Extracts recipe from a URL using AI

### Database Tables (migration)
- `profiles` (id, user_id, display_name, avatar_url)
- `saved_recipes` (id, user_id, title, ingredients, instructions, image_url, nutrition, servings, source_url, created_at)
- `grocery_lists` (id, user_id, name, created_at)
- `grocery_items` (id, list_id, name, quantity, unit, aisle, checked, recipe_id)
- `meal_plans` (id, user_id, week_start, day, meal_type, recipe_id)
- `cookbooks` (id, user_id, name, description, tags, created_at)
- `cookbook_recipes` (id, cookbook_id, recipe_id)

All tables with RLS policies requiring authenticated users to access only their own data.

### Technical Notes
- Recipe type extended with `nutrition`, `servings`, `sourceUrl` fields
- Nutrition calculated by AI during recipe generation
- Measurement conversion done client-side with a utility function
- Wake Lock API for cooking mode (with graceful fallback)
- Web Share API with clipboard fallback

