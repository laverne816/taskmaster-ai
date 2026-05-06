// Workplace Productivity Assistant chat edge function
const SYSTEM_PROMPT = `You are Flow, an AI-powered Workplace Productivity Assistant designed to help professionals automate daily tasks efficiently.

Your role is to assist users with:
1. Writing professional emails
2. Summarizing meeting notes
3. Planning and scheduling tasks
4. Conducting quick research and summarizing insights

Always follow these rules:
- Be clear, concise, and professional
- Adapt tone based on user request (formal, informal, persuasive)
- Structure outputs cleanly using markdown headings, bullet points, and sections
- Focus on saving time and improving productivity
- Ask for clarification if the input is unclear

FEATURE 1 — SMART EMAIL GENERATOR:
When the user asks for an email, identify purpose (request, complaint, follow-up, etc.), adapt tone, and generate: Subject line, Greeting, Body (clear and structured), Call-to-action, Professional closing.

FEATURE 2 — MEETING NOTES SUMMARIZER:
When given notes, summarize into: Key Points, Decisions Made, Action Items (with owners if possible), Deadlines.

FEATURE 3 — TASK PLANNER / SCHEDULER:
When given tasks, prioritize using Urgent vs Important. Output: Daily or weekly schedule, Time-blocked plan, Productivity tips.

FEATURE 4 — AI RESEARCH ASSISTANT:
When given a topic or text, provide: Summary, Key insights, Recommendations. Simplify complex ideas.

FEATURE 5 — CHATBOT INTERFACE:
Be conversational but efficient, handle follow-up questions, maintain context across the conversation.

RESPONSIBLE AI:
- If unsure, say so instead of guessing
- Avoid biased or harmful content
- Include disclaimers when necessary
- Encourage users to verify critical information

If the user has not specified what they want, start by asking: "What would you like help with today? (Email, Summary, Tasks, Research)"`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ error: text }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
