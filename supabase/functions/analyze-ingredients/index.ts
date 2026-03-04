// Edge Function: analyze-ingredients
// Analyzes fridge photos or text to extract ingredients using Gemini

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  try {
    const { image, text } = await req.json()
    
    if (!image && !text) {
      return new Response(
        JSON.stringify({ error: 'Please provide an image or text' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let prompt = ''
    
    if (image) {
      // Image analysis
      prompt = `Analyze this image of a fridge, pantry, or ingredients. List all the food items you can identify. Format as a simple list of ingredients. Be specific (e.g., "chicken breast" not just "meat"). Only return the ingredient names, one per line.`
      
      // Call Gemini Vision API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: image } }
              ]
            }]
          })
        }
      )
      
      const data = await response.json()
      const ingredientsText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const ingredients = ingredientsText
        .split('\n')
        .map(i => i.replace(/^[-*•]\s*/, '').trim())
        .filter(i => i.length > 0)
      
      return new Response(
        JSON.stringify({ ingredients }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      
    } else {
      // Text analysis
      prompt = `Extract ingredients from this text: "${text}". List each ingredient on a new line. Be specific and include quantities if mentioned.`
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )
      
      const data = await response.json()
      const ingredientsText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const ingredients = ingredientsText
        .split('\n')
        .map(i => i.replace(/^[-*•]\s*/, '').trim())
        .filter(i => i.length > 0)
      
      return new Response(
        JSON.stringify({ ingredients }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
