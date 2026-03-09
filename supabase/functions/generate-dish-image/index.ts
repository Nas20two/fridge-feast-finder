// Edge Function: generate-dish-image using Gemini 2.5 Flash
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    })
  }

  try {
    const { title, ingredients } = await req.json()
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Please provide recipe title' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Generate image description with Gemini
    const prompt = `Generate a detailed, appetizing food photography description for a dish called "${title}". 
    
Include these ingredients: ${ingredients?.join(', ') || 'various fresh ingredients'}

The image should be:
- Professional food photography style
- Top-down or 45-degree angle
- Warm, inviting lighting
- On a clean, modern surface
- Garnished beautifully
- High resolution, detailed

Return ONLY a vivid 2-3 sentence description of how this dish should look in a photo.`

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
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || 'Gemini API error')
    }
    
    const data = await response.json()
    const imageDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      `A delicious ${title} beautifully plated with fresh ingredients, professional food photography style.`

    // Use Pollinations AI for free image generation
    const encodedPrompt = encodeURIComponent(imageDescription.substring(0, 500))
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&seed=${Date.now()}`
    
    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl,
        source: 'ai-generated'
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    // Fallback to placeholder
    const colors = ['e57373', 'f06292', 'ba68c8', '9575cd', '7986cb', '64b5f6', '4fc3f7', '4dd0e1', '4db6ac', '81c784', 'aed581', 'dce775', 'fff176', 'ffd54f', 'ffb74d', 'ff8a65']
    const colorIndex = (title?.length || 0) % colors.length
    const bgColor = colors[colorIndex]
    const placeholderText = encodeURIComponent(title?.substring(0, 20) || 'Recipe')
    const placeholderUrl = `https://placehold.co/600x400/${bgColor}/white?text=${placeholderText}`
    
    return new Response(
      JSON.stringify({ 
        imageUrl: placeholderUrl,
        source: 'placeholder'
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
