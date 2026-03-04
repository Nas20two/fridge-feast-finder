-- Add Fridge Feast Finder to NaSy Hub
-- Run this in Supabase SQL Editor

INSERT INTO public.apps (
    id,
    name,
    description,
    app_url,
    tags,
    image_url,
    is_active,
    display_order
) VALUES (
    gen_random_uuid(),
    'Recipe Remix',
    'AI-powered recipe generator from fridge ingredients. Upload a photo or type ingredients to get personalized recipes with nutrition info and AI-generated dish images.',
    'https://fridge-feast-finder.vercel.app',
    ARRAY['AI', 'Recipe', 'PWA', 'Food', 'Gemini'],
    NULL,
    true,
    3
);

-- Verify
SELECT * FROM public.apps WHERE name = 'Recipe Remix';
