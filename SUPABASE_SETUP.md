# Fridge Feast Finder - Supabase Setup Guide

## Overview
Complete setup guide for Supabase backend including Auth, Database, Storage, and Edge Functions.

---

## Step 1: Supabase Project Setup

### 1.1 Create Project (if not done)
1. Go to https://supabase.com
2. Create new project
3. Note down:
   - Project URL
   - Project API Keys (anon/public)
   - Project ID

### 1.2 Update Vercel Environment Variables
```bash
# In your project directory
npx vercel env add VITE_SUPABASE_URL
# Enter: https://your-project-id.supabase.co

npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Enter: your-anon-key

npx vercel env add VITE_SUPABASE_PROJECT_ID
# Enter: your-project-id

npx vercel env add GEMINI_API_KEY
# Enter: your-gemini-api-key
```

---

## Step 2: Enable Authentication

### 2.1 Configure Email Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable "Enable Email confirmations" (recommended)
   - ✅ Enable "Secure email change"
   - Set "Site URL": `https://fridge-feast-finder.vercel.app`
   - Add to "Additional redirect URLs":
     - `https://fridge-feast-finder.vercel.app`
     - `http://localhost:8080` (for local testing)

### 2.2 Configure Email Templates (Optional - with Resend)
1. Go to **Authentication** → **Email Templates**
2. For each template (Confirm signup, Magic Link, etc.):
   - Update sender email to your verified domain
   - Customize message content

### 2.3 Set Up Resend (For Production Email)
1. Create account at https://resend.com
2. Verify your domain
3. Get API key
4. In Supabase, go to **Settings** → **Auth**
5. Enable "Custom SMTP"
6. Enter Resend credentials:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: Your Resend API key
   - Sender: Your verified email (e.g., `noreply@yourdomain.com`)

---

## Step 3: Database Setup

### 3.1 Run Schema SQL
1. Go to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy contents of `supabase/schema.sql`
4. Run the SQL

This creates:
- ✅ Profiles table (user data)
- ✅ Recipes table (saved recipes)
- ✅ Grocery lists table
- ✅ Meal plans table
- ✅ Cookbooks tables
- ✅ Storage buckets
- ✅ RLS policies for security

---

## Step 4: Deploy Edge Functions

### 4.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 4.2 Login to Supabase
```bash
supabase login
```

### 4.3 Link Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4.4 Deploy Functions
```bash
# From project root
supabase functions deploy analyze-ingredients
supabase functions deploy generate-recipes
supabase functions deploy generate-dish-image
```

### 4.5 Set Function Secrets
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```

---

## Step 5: Configure Storage

### 5.1 Create Buckets (Already done via SQL)
- `recipe-images` - For recipe photos
- `avatars` - For user profile pictures

### 5.2 Storage Policies (Already set via SQL)
Users can only upload/view their own images

---

## Step 6: Test Everything

### 6.1 Test Auth
1. Visit: https://fridge-feast-finder.vercel.app
2. Try to sign up
3. Check if confirmation email arrives
4. Verify you can log in

### 6.2 Test Recipe Generation
1. Upload a fridge photo or type ingredients
2. Verify AI analyzes ingredients
3. Generate recipes
4. Save a recipe
5. Verify it appears in "My Recipes"

### 6.3 Test Storage
1. Try uploading a recipe image
2. Verify image displays correctly

---

## Step 7: Security Checklist

- [ ] RLS enabled on all tables
- [ ] Storage policies restrict access
- [ ] Environment variables set (not in code)
- [ ] .env file in .gitignore
- [ ] API keys rotated (if previously exposed)

---

## Troubleshooting

### "Invalid API Key" Error
- Check Vercel environment variables are set
- Verify Supabase project is active
- Ensure you're using the `anon` key (not service_role)

### "Email not sending"
- Check Resend configuration
- Verify domain is verified in Resend
- Check spam folders

### "Cannot save recipe"
- Verify user is authenticated
- Check database RLS policies
- Review browser console for errors

### "Images not generating"
- Check GEMINI_API_KEY is set in Supabase secrets
- Verify Edge Function deployed successfully
- Check function logs in Supabase dashboard

---

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Supabase Auth | 50,000 users/month | $0.00325/user |
| Supabase DB | 500MB | $0.125/GB |
| Supabase Storage | 1GB | $0.021/GB |
| Gemini API | 1,500 req/day | Pay per use |
| Vercel | 100GB bandwidth | $20+/mo |

**Typical cost: $0-10/month** for personal use

---

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Gemini API: https://ai.google.dev/gemini-api

---

**Ready for your wife to use!** 🍳
