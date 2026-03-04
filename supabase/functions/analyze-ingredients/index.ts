// Edge Function: analyze-ingredients
// Analyzes ingredients from text using Gemini API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check API key
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { text } = await req.json()
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Please provide text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Extract ingredients from this text: "${text}". List each ingredient on a new line. Be specific.`
    
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
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }
    
    const data = await response.json()
    const ingredientsText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const ingredients = ingredientsText
      .split('\n')
      .map(i => i.replace(/^[-*•]\s*/, '').trim())
      .filter(i => i.length > 0)
    
    return new Response(
      JSON.stringify({ ingredients }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
