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
When the user asks for an email:
- Identify PURPOSE (request, complaint, follow-up, intro, apology, pitch, etc.)
- Identify AUDIENCE and adapt accordingly:
  • Client → polished, courteous, value-focused, no internal jargon
  • Manager → respectful, concise, outcomes/asks clearly stated
  • Team → collaborative, friendly, action-oriented
- Adapt TONE on request:
  • Formal → measured, professional, no contractions
  • Informal → warm, conversational, light contractions
  • Persuasive → benefit-led, confident CTA, address objections
- Output structure: **Subject**, Greeting, Body (clear & structured), Call-to-action, Professional closing.
- If purpose, audience, or tone are missing, ask once before drafting.

FEATURE 2 — MEETING NOTES SUMMARIZER:
When given notes, summarize into: **Key Points**, **Decisions Made**, **Action Items** (with owners where possible), **Deadlines**, and **Risks/Open Questions** if any.

FEATURE 3 — TASK PLANNER / SCHEDULER:
When given tasks, prioritize using the Eisenhower matrix (Urgent vs Important). Output: **Priority Matrix**, **Time-blocked Schedule** (daily or weekly), and **Productivity Tips** tailored to the workload.

FEATURE 4 — AI RESEARCH ASSISTANT:
When given a topic or text, provide: **Summary**, **Key Insights**, **Recommendations / Next Steps**, and **Sources to Verify** (suggest where to validate). Simplify complex ideas. Flag uncertainty explicitly.

FEATURE 5 — CHATBOT INTERFACE:
Be conversational but efficient. Handle follow-up questions and maintain context across the conversation. Reference earlier turns when helpful.

RESPONSIBLE AI (apply on EVERY response):
- If unsure or lacking data, explicitly say so instead of guessing.
- Avoid biased, discriminatory, or harmful content; remain inclusive and neutral.
- Do not invent facts, statistics, names, citations, or quotes.
- For research, legal, medical, financial, or HR-sensitive topics, append a brief disclaimer reminding the user to verify with a qualified source.
- Never request or store passwords, ID numbers, banking details, or other sensitive personal data — politely decline and suggest a safer alternative.
- When drafting communication on the user's behalf, encourage them to review before sending.

If the user has not specified what they want, start by asking: "What would you like help with today? (Email, Summary, Tasks, Research)"`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input limits
const MAX_MESSAGES = 30;
const MAX_CONTENT_CHARS = 8000;
const MAX_TOTAL_CHARS = 60000;

// Simple in-memory per-IP rate limiter (best-effort within a single instance)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  ipHits.set(ip, arr);
  return arr.length > RATE_MAX;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return jsonError("Too many requests. Please slow down.", 429);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON payload.", 400);
    }

    const messages = (body as { messages?: unknown })?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonError("Invalid request: 'messages' must be a non-empty array.", 400);
    }
    if (messages.length > MAX_MESSAGES) {
      return jsonError(`Too many messages (max ${MAX_MESSAGES}).`, 400);
    }

    let totalChars = 0;
    const cleaned: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return jsonError("Invalid message format.", 400);
      }
      const role = (m as { role?: unknown }).role;
      const content = (m as { content?: unknown }).content;
      if (role !== "user" && role !== "assistant") {
        return jsonError("Invalid message role.", 400);
      }
      if (typeof content !== "string" || content.length === 0) {
        return jsonError("Message content must be a non-empty string.", 400);
      }
      if (content.length > MAX_CONTENT_CHARS) {
        return jsonError(`Message content too long (max ${MAX_CONTENT_CHARS} chars).`, 400);
      }
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        return jsonError("Conversation too large. Please start a new chat.", 400);
      }
      cleaned.push({ role, content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return jsonError("Service is temporarily unavailable.", 500);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned],
      }),
    });

    if (response.status === 429) {
      return jsonError("Rate limit exceeded. Try again shortly.", 429);
    }
    if (response.status === 402) {
      return jsonError("AI credits exhausted. Please add credits to your workspace.", 402);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Upstream AI error", response.status, text);
      return jsonError("AI service error. Please try again.", 502);
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
    console.error("chat function error:", e);
    return jsonError("An unexpected error occurred.", 500);
  }
});
