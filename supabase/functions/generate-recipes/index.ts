// Edge Function: generate-recipes using Gemini 2.5 Flash
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { ingredients } = await req.json()
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide ingredients' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const ingredientsList = ingredients.join(', ')
    
    const prompt = `Create 3 delicious recipes using these ingredients: ${ingredientsList}.

For each recipe, provide:
1. Recipe name (creative and appetizing)
2. Brief description (1-2 sentences)
3. List of ingredients with quantities
4. Step-by-step cooking instructions
5. Estimated nutrition info (calories, protein, carbs, fat per serving)
6. Number of servings
7. Cooking time
8. Difficulty level (Easy/Medium/Hard)

Format as JSON:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["2 cups flour", "3 eggs"],
      "instructions": ["Step 1...", "Step 2..."],
      "nutrition": {"calories": 450, "protein": 25, "carbs": 50, "fat": 15},
      "servings": 4,
      "cookingTime": 30,
      "difficulty": "Easy"
    }
  ]
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error')
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse recipe data')
    }
    
    const recipes = JSON.parse(jsonMatch[0])
    
    return new Response(
      JSON.stringify(recipes),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
