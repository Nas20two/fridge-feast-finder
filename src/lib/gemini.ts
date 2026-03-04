// Direct Gemini API calls from frontend
// No edge functions needed

const GEMINI_API_KEY = 'AIzaSyDJLM-PYH6SP1uLW3RLGfuhWaLWMFkq3R4';

export async function analyzeIngredients(text: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Extract ingredients from: "${text}". List each on new line.` }] }]
      })
    }
  );
  
  const data = await response.json();
  const text_response = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text_response.split('\n').map(i => i.replace(/^[-*•]\s*/, '').trim()).filter(i => i);
}

export async function generateRecipes(ingredients: string[]) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Create 3 recipes using: ${ingredients.join(', ')}. Return JSON: {recipes: [{title, ingredients[], instructions[], servings, cookingTime, difficulty}]}` }] }]
      })
    }
  );
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { recipes: [] };
}

export async function importRecipeFromURL(url: string) {
  // Fetch page content first (will need CORS proxy or skip)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Extract recipe from URL: ${url}. Return JSON: {title, ingredients[], instructions[]}` }] }]
      })
    }
  );
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}
