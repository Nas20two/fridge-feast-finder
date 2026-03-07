// Edge Function: generate-dish-image
// Note: Image generation temporarily disabled
// TODO: Integrate DALL-E, Stability AI, or similar for image generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { title, ingredients } = await req.json()
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Please provide recipe title' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Return placeholder for now
    // Future: Integrate DALL-E, Stability AI, or Unsplash API
    return new Response(
      JSON.stringify({ 
        imageUrl: null,
        message: 'Image generation temporarily disabled. Using placeholder.',
        title: title
      }),
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
