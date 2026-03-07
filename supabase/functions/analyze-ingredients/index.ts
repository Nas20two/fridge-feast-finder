// Analyze ingredients using Qwen (replaces Gemini)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DASHSCOPE_API_KEY = Deno.env.get('DASHSCOPE_API_KEY') || 'sk-ba78c00dde8f4add9a24afe1b09a0e9b'

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
    const { text } = await req.json()
    
    if (!DASHSCOPE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'qwen3.5-flash',
          messages: [
            { role: 'system', content: 'Extract ingredients and return as simple list, one per line.' },
            { role: 'user', content: `Ingredients from: ${text}` }
          ],
          max_tokens: 500
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Qwen API error')
    }
    
    const resultText = data.choices?.[0]?.message?.content || ''
    const ingredients = resultText.split('\n').map(i => i.replace(/^[-*•]\s*/, '').trim()).filter(i => i && i.length > 1)
    
    return new Response(
      JSON.stringify({ ingredients }),
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
