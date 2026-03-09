-- Fix saved_recipes table for FFF
-- Run this in Supabase SQL Editor

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS public.saved_recipes;

-- Create proper saved_recipes table
CREATE TABLE public.saved_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    nutrition JSONB,
    servings INTEGER DEFAULT 4,
    image_url TEXT,
    cooking_time INTEGER,
    difficulty TEXT,
    source_type TEXT DEFAULT 'generated',
    source_url TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Users can manage own saved recipes" 
    ON public.saved_recipes 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_saved_recipes_user_id ON public.saved_recipes(user_id);

-- Verify
SELECT * FROM public.saved_recipes LIMIT 1;
