import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ingredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a creative chef and nutritionist. Generate exactly 4 unique recipe suggestions with estimated nutrition info. No preamble."
          },
          {
            role: "user",
            content: `I have these ingredients: ${ingredients.join(", ")}. Suggest 4 recipes I can make.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_recipes",
            description: "Return 4 recipe suggestions with nutrition info.",
            parameters: {
              type: "object",
              properties: {
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Recipe name" },
                      ingredients: { type: "array", items: { type: "string" }, description: "Full ingredient list with quantities" },
                      instructions: { type: "array", items: { type: "string" }, description: "Step-by-step cooking instructions" },
                      servings: { type: "number", description: "Number of servings" },
                      nutrition: {
                        type: "object",
                        description: "Estimated nutrition per serving",
                        properties: {
                          calories: { type: "number" },
                          protein: { type: "number" },
                          carbs: { type: "number" },
                          fat: { type: "number" },
                        },
                        required: ["calories", "protein", "carbs", "fat"],
                        additionalProperties: false,
                      },
                    },
                    required: ["title", "ingredients", "instructions", "servings", "nutrition"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recipes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_recipes" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No recipe data returned from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
