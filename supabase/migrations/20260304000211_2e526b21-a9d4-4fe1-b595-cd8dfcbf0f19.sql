
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved recipes
CREATE TABLE public.saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  nutrition jsonb,
  servings integer NOT NULL DEFAULT 4,
  source_url text,
  source_type text DEFAULT 'generated',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own recipes" ON public.saved_recipes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grocery lists
CREATE TABLE public.grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My List',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lists" ON public.grocery_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grocery items
CREATE TABLE public.grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text,
  unit text,
  aisle text,
  checked boolean NOT NULL DEFAULT false,
  recipe_title text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own items" ON public.grocery_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grocery_lists gl WHERE gl.id = list_id AND gl.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.grocery_lists gl WHERE gl.id = list_id AND gl.user_id = auth.uid()));

-- Meal plans
CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  day integer NOT NULL,
  meal_type text NOT NULL,
  recipe_id uuid REFERENCES public.saved_recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own plans" ON public.meal_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cookbooks
CREATE TABLE public.cookbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cookbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own cookbooks" ON public.cookbooks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cookbook recipes (junction)
CREATE TABLE public.cookbook_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cookbook_id uuid REFERENCES public.cookbooks(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES public.saved_recipes(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cookbook_id, recipe_id)
);
ALTER TABLE public.cookbook_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own cookbook recipes" ON public.cookbook_recipes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cookbooks c WHERE c.id = cookbook_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cookbooks c WHERE c.id = cookbook_id AND c.user_id = auth.uid()));
