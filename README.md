# Flow — AI Workplace Productivity Assistant

A fully functional AI chatbot built to automate daily professional tasks. I designed and developed this project from scratch using React, TypeScript, and Lovable Cloud — transforming a set of workplace productivity requirements into a streaming, real-time assistant.

---

## What I Built

I created **Flow**, an AI-powered workplace assistant with five core capabilities, delivered through a polished chat interface with streaming responses.

### 1. Smart Email Generator
I implemented intelligent email drafting that adapts to both **audience** (client, manager, team) and **tone** (formal, informal, persuasive). The system identifies missing context (purpose, recipient, tone) and asks clarifying questions before generating a structured output: Subject, Greeting, Body, Call-to-Action, and Professional Closing.

### 2. Meeting Notes Summarizer
I built a summarization pipeline that extracts **Key Points**, **Decisions Made**, **Action Items** (with owners), **Deadlines**, and **Risks/Open Questions** from unstructured meeting notes — turning raw text into actionable summaries.

### 3. Task Planner & Scheduler
I integrated the **Eisenhower Matrix** (Urgent vs. Important) into the task planning flow. The assistant prioritizes tasks, builds a **time-blocked schedule** (daily or weekly), and provides **productivity tips** tailored to the user's workload.

### 4. AI Research Assistant
I designed a research module that delivers **Summaries**, **Key Insights**, **Recommendations/Next Steps**, and **Sources to Verify**. Complex ideas are simplified, and uncertainty is explicitly flagged.

### 5. Conversational Chat Interface
I built a full streaming chat experience with **Server-Sent Events (SSE)**, real-time message rendering with `react-markdown`, a typing indicator, and an **AbortController** for stopping mid-generation. The interface maintains conversational context across turns.

---

## Technical Decisions

### Frontend Architecture
- **React 18 + TypeScript + Vite 5**: For fast development, type safety, and optimal build performance.
- **Tailwind CSS v3 + shadcn/ui**: I configured a custom design system with semantic tokens (`--primary`, `--background`, `--muted`, etc.) and used shadcn/ui components for consistent, accessible UI primitives.
- **Instrument Serif + Inter**: I chose a distinctive font pairing to avoid generic AI-tool aesthetics — editorial headings paired with clean body text.

### Backend & AI Integration
- **Lovable Cloud Edge Functions (Deno)**: I wrote a single Edge Function (`supabase/functions/chat/index.ts`) that acts as the orchestration layer.
- **Lovable AI Gateway**: I connected to `google/gemini-2.5-flash` via the gateway, handling streaming responses, rate limits (429), and credit exhaustion (402) gracefully.
- **System Prompt Engineering**: I crafted a detailed system prompt with strict guardrails — tone adaptation, audience awareness, responsible AI rules, and mandatory disclaimers for sensitive topics.

### Streaming & Real-Time UX
- I implemented a **ReadableStream** parser in the frontend that processes SSE chunks in real time, updating the UI word-by-word as the AI generates text.
- I added a **stop generation** button (using `AbortController`) so users can interrupt long responses.
- I built a **pulsing dot loading state** for when the assistant is "thinking."

### Design System
- I defined custom CSS variables in `index.css` for a cohesive, themeable look.
- I added custom animations (`animate-fade-up`, `animate-pulse-dot`) for polish.
- I used gradient hero backgrounds and soft shadows to create depth without clutter.

---

## Project Structure

```
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx    # Message bubble rendering with markdown support
│   │   ├── QuickActions.tsx   # Feature shortcut cards (Email, Summary, Tasks, Research, Chat)
│   │   └── ui/                # shadcn/ui components (Button, Textarea, Dialog, etc.)
│   ├── pages/
│   │   ├── Index.tsx          # Main chat interface with streaming logic
│   │   └── NotFound.tsx       # 404 page
│   ├── index.css              # Global styles, design tokens, custom animations
│   ├── main.tsx               # App entry point
│   └── App.tsx                # Root component with routing
├── supabase/
│   └── functions/
│       └── chat/
│           └── index.ts       # Edge function: AI orchestration + system prompt
├── tailwind.config.ts         # Tailwind theme with custom colors and fonts
├── index.html                 # HTML entry with Google Fonts preloaded
└── README.md                  # This file
```

---

## Challenges I Solved

| Challenge | Solution |
|-----------|----------|
| **Streaming Markdown** | Parsed SSE chunks incrementally and used `react-markdown` to render formatted output in real time without breaking layout. |
| **Missing Context in Emails** | Built logic into the system prompt to detect missing purpose/audience/tone and ask one clarifying question before drafting. |
| **Rate Limiting & Errors** | Added specific HTTP status handling (429, 402, 500) in the Edge Function with user-friendly error messages via `toast` notifications. |
| **Responsive Chat Layout** | Designed a sticky input bar with backdrop blur and a scrollable message area that auto-scrolls to the latest message. |
| **Responsible AI** | Hard-coded safety rules into the system prompt: no invented facts, no sensitive data collection, mandatory disclaimers for sensitive topics. |

---

## What I Learned

- **Prompt Engineering**: Writing a system prompt that enforces structure, tone, and safety guardrails while remaining conversational.
- **Streaming Architecture**: Building a frontend that consumes SSE streams and renders partial responses smoothly.
- **Edge Functions**: Deploying serverless functions with Deno and handling CORS, auth headers, and error states.
- **Design Tokens**: Creating a scalable theming system with CSS variables and Tailwind config instead of hardcoded values.

---

## Roadmap (Next Steps)

- [ ] Persist conversation history to a database
- [ ] Add copy-to-clipboard and export features for emails/summaries
- [ ] Implement voice input for hands-free task creation
- [ ] Add multi-language support for global teams

---

Built with ❤️ by me, using Lovable.
