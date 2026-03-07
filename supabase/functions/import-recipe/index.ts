// Edge Function: import-recipe
// Imports recipes from URLs using Qwen API (replaces Gemini)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY") || "sk-ba78c00dde8f4add9a24afe1b09a0e9b";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    // Fetch the page content
    let pageContent = "";
    try {
      const pageResp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeRemix/1.0)" },
      });
      pageContent = await pageResp.text();
      // Truncate to avoid token limits
      pageContent = pageContent.substring(0, 8000);
    } catch {
      pageContent = `URL: ${url}`;
    }

    const prompt = `Extract the recipe from this webpage content. Return ONLY a JSON object:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "servings": 4,
  "cookingTime": 30,
  "difficulty": "Easy"
}

Webpage URL: ${url}

Content:
${pageContent}`;

    const response = await fetch(
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen3.5-flash",
          messages: [
            { role: "system", content: "Extract recipes from webpages. Return only valid JSON." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1500
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const data = await response.json();
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Qwen API error: ${status} - ${data.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recipe from response");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!result.title || !result.ingredients || !result.instructions) {
      throw new Error("Recipe is missing required fields");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("import-recipe error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
