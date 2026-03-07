-- Add missing saved_recipes table for FFF
-- Run this in Supabase SQL Editor

-- ================================
-- SAVED_RECIPES TABLE (For FFF)
-- ================================
CREATE TABLE IF NOT EXISTS public.saved_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    nutrition JSONB,
    servings INTEGER DEFAULT 4,
    image_url TEXT,
    cooking_time INTEGER,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    source_type TEXT CHECK (source_type IN ('generated', 'imported', 'manual')) DEFAULT 'generated',
    source_url TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own saved recipes" 
    ON public.saved_recipes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved recipes" 
    ON public.saved_recipes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved recipes" 
    ON public.saved_recipes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes" 
    ON public.saved_recipes FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);

-- Verify
SELECT * FROM public.saved_recipes LIMIT 1;
