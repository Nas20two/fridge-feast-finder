-- Supabase Database Setup for Fridge Feast Finder
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ================================
-- PROFILES TABLE (User data)
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'display_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- RECIPES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    nutrition JSONB,
    servings INTEGER DEFAULT 4,
    image_url TEXT,
    cooking_time INTEGER, -- in minutes
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own recipes" 
    ON public.recipes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recipes" 
    ON public.recipes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" 
    ON public.recipes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" 
    ON public.recipes FOR DELETE 
    USING (auth.uid() = user_id);

-- ================================
-- GROCERY LISTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.grocery_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Grocery List',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- items format: [{"name": "Eggs", "quantity": "12", "checked": false, "category": "Dairy"}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own grocery lists" 
    ON public.grocery_lists FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own grocery lists" 
    ON public.grocery_lists FOR ALL 
    USING (auth.uid() = user_id);

-- ================================
-- MEAL PLANS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    week_start DATE NOT NULL,
    meals JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- meals format: {"monday": {"breakfast": recipe_id, "lunch": recipe_id, "dinner": recipe_id}}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own meal plans" 
    ON public.meal_plans FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal plans" 
    ON public.meal_plans FOR ALL 
    USING (auth.uid() = user_id);

-- ================================
-- COOKBOOKS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.cookbooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cookbooks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own cookbooks" 
    ON public.cookbooks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cookbooks" 
    ON public.cookbooks FOR ALL 
    USING (auth.uid() = user_id);

-- ================================
-- COOKBOOK RECIPES (Many-to-Many)
-- ================================
CREATE TABLE IF NOT EXISTS public.cookbook_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cookbook_id UUID REFERENCES public.cookbooks(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cookbook_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.cookbook_recipes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view cookbook recipes they own" 
    ON public.cookbook_recipes FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.cookbooks 
        WHERE cookbooks.id = cookbook_recipes.cookbook_id 
        AND cookbooks.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage cookbook recipes they own" 
    ON public.cookbook_recipes FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.cookbooks 
        WHERE cookbooks.id = cookbook_recipes.cookbook_id 
        AND cookbooks.user_id = auth.uid()
    ));

-- ================================
-- STORAGE BUCKETS
-- ================================
-- Create bucket for recipe images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for recipe images
CREATE POLICY "Users can upload own recipe images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view recipe images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'recipe-images');

-- Create bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for avatars
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON public.recipes(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_cookbooks_user_id ON public.cookbooks(user_id);
