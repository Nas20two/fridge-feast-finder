// Edge Function: generate-dish-image
// Generates AI images of dishes using Gemini

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  try {
    const { title, ingredients } = await req.json()
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Please provide recipe title' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ingredientsText = ingredients?.join(', ') || ''
    
    const prompt = `A beautiful, appetizing food photography style image of "${title}" made with ${ingredientsText}. Professional food styling, natural lighting, on a rustic wooden table with simple garnish. High quality, realistic, mouth-watering presentation.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['Text', 'Image']
          }
        })
      }
    )
    
    const data = await response.json()
    
    // Extract image data from response
    const parts = data.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find((p: any) => p.inlineData)
    
    if (imagePart?.inlineData?.data) {
      return new Response(
        JSON.stringify({ 
          imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Fallback: return placeholder or generate description
    return new Response(
      JSON.stringify({ 
        imageUrl: null,
        error: 'Image generation not available'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
