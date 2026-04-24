// Edge Function: generate-dish-image using Unsplash
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

    // Create search query from title and ingredients
    const searchTerms = [title, ...(ingredients || [])].join(' ')
    const encodedQuery = encodeURIComponent(searchTerms.substring(0, 100))
    
    // Use Unsplash Source for free images (no API key needed)
    // Create search keywords from title
    const keywords = title.toLowerCase()
      .replace(/stir-fry|stirfry/g, 'stir-fry')
      .replace(/chicken/g, 'chicken')
      .replace(/beef/g, 'beef')
      .replace(/pasta/g, 'pasta')
      .replace(/salad/g, 'salad')
      .replace(/soup/g, 'soup')
      .replace(/curry/g, 'curry')
      .replace(/pizza/g, 'pizza')
      .split(' ')
      .slice(0, 3)
      .join(',')
    
    // Use source.unsplash.com (deprecated but still works) or direct images
    const imageUrl = `https://source.unsplash.com/800x600/?food,${keywords},cooking`
    const source = 'unsplash'
    
    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl,
        source: source
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    // Fallback to generic food image
    const fallbackUrl = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80'
    
    return new Response(
      JSON.stringify({ 
        imageUrl: fallbackUrl,
        source: 'fallback'
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
