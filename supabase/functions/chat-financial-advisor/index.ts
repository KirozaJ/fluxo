import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userMessage, context } = await req.json();

    // Prioritize Google, fallback to OpenAI if not set
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    let reply = "";

    const systemPromptText = `
You are Fluxo AI, a helpful and friendly financial advisor.
Your goal is to help the user manage their money, stay within budget, and understand their spending habits.

Here is the user's current financial context:
${context}

Instructions:
1. Be concise and encouraging.
2. Use the context provided to give specific answers.
3. If the user asks about something not in the context, refer to general financial advice but mention you only explicitly see the data provided.
4. Format your response in Markdown if needed.
    `.trim();

    if (GOOGLE_API_KEY) {
      // --- GOOGLE GEMINI LOGIC ---
      // Dynamically find a supported model to avoid "model not found" errors
      let MODEL = 'gemini-1.5-flash';
      let availableModelsList = '';

      try {
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`);
        const listData = await listResp.json();

        if (listData.models) {
          // Find first model that supports 'generateContent' and prefers 'flash' or 'pro'
          const candidate = listData.models.find((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            (m.name.includes('flash') || m.name.includes('pro') || m.name.includes('gemini'))
          );

          if (candidate) {
            // m.name is usually 'models/gemini-1.5-flash'
            MODEL = candidate.name.replace('models/', '');
          }

          // Keep list for debug
          availableModelsList = listData.models.map((m: any) => m.name).join(', ');
        }
      } catch (e) {
        console.error("Failed to list models, defaulting to hardcoded.", e);
      }

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

      const combinedPrompt = `${systemPromptText}\n\nUser Question: ${userMessage}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: combinedPrompt }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`Gemini Error (${MODEL}): ${data.error.message}. Available: ${availableModelsList}`);
      }

      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

    } else if (OPENAI_API_KEY) {
      // --- OPENAI LOGIC ---
      const API_URL = Deno.env.get('LLM_API_URL') || 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPromptText },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

    } else {
      // --- MOCK LOGIC ---
      console.log("No API Key found, using mock response.");
      if (userMessage.toLowerCase().includes('spend') || userMessage.toLowerCase().includes('spent')) {
        reply = "Based on your recent transactions, you've been spending mostly on Food and Transport. Check your budget progress to see if you can slow down.";
      } else if (userMessage.toLowerCase().includes('budget')) {
        reply = "Your budgets look healthy! Keep an eye on your 'Entertainment' category as it is nearing the limit.";
      } else {
        reply = "I'm in 'Offline Mode' because my brain (API Key) isn't connected yet. But I see your financial data is safe! Once connected, I'll give you smarter insights.";
      }
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
