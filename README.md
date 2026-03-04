# Fridge Feast Finder

A smart recipe discovery app that helps you create delicious meals from ingredients you already have. Reduce food waste and discover new recipes with AI-powered ingredient analysis.

## Features

🥗 **Ingredient Analysis**
- Upload photos of your fridge or pantry
- Type ingredients manually
- AI extracts and identifies ingredients automatically

🍳 **Recipe Generation**
- Get personalized recipes based on your ingredients
- View detailed instructions and nutrition info
- See AI-generated images of each dish

📱 **Mobile-First PWA**
- Works offline as a Progressive Web App
- Install on your phone for quick access
- Responsive design for all screen sizes

🔐 **User Accounts**
- Save your favorite recipes
- Create meal plans
- Build grocery lists

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn-ui
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **AI:** Gemini API for ingredient analysis & recipe generation
- **Hosting:** Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Nas20two/fridge-feast-finder.git
cd fridge-feast-finder

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and fill in your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication (Email/Google)
3. Deploy Edge Functions:
   - `analyze-ingredients` - Extracts ingredients from images/text
   - `generate-recipes` - Creates recipes from ingredients
   - `generate-dish-image` - Creates AI images of dishes

## How It Works

1. **Input Ingredients:** Upload a photo or type ingredients
2. **AI Analysis:** Gemini AI identifies and categorizes ingredients
3. **Confirm & Edit:** Review the ingredient list
4. **Generate Recipes:** AI creates personalized recipes
5. **Cook & Enjoy:** Follow instructions with nutrition info

## Future Enhancements

- [ ] Dietary restrictions (vegan, gluten-free, etc.)
- [ ] Nutrition tracking
- [ ] Shopping list export
- [ ] Recipe sharing
- [ ] Cookbook collections

## License

MIT License - feel free to use and modify!

## Author

Built by NaSy

---

**Live Demo:** [fridge-feast-finder.vercel.app](https://fridge-feast-finder.vercel.app)
