# Flow — AI Workplace Productivity Assistant

**Flow** is an AI-powered chatbot designed to help professionals automate daily workplace tasks efficiently. It provides a clean, streaming chat interface for drafting emails, summarizing meeting notes, planning tasks, and conducting quick research.

---

## Features

| Feature | Description |
|---------|-------------|
| **Smart Email Generator** | Draft professional emails tailored by audience (client, manager, team) and tone (formal, informal, persuasive). |
| **Meeting Notes Summarizer** | Extract key points, decisions, action items with owners, deadlines, and risks from raw notes. |
| **Task Planner & Scheduler** | Prioritize tasks using the Eisenhower Matrix (Urgent vs. Important) and build time-blocked daily/weekly schedules. |
| **AI Research Assistant** | Summarize topics into insights, recommendations, and suggested sources to verify. |
| **General Workplace Chat** | Ask follow-ups, brainstorm, or get advice on workplace challenges with conversational context memory. |

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix-based)
- **Backend**: Lovable Cloud Edge Functions (Deno)
- **AI Model**: google/gemini-2.5-flash via Lovable AI Gateway
- **Streaming**: Server-Sent Events (SSE) for real-time response streaming
- **Icons**: Lucide React

---

## Project Structure

```
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx    # Message bubble rendering with markdown
│   │   ├── QuickActions.tsx   # Feature shortcut cards (Email, Summary, etc.)
│   │   └── ui/                # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx          # Main chat interface
│   │   └── NotFound.tsx       # 404 page
│   ├── index.css              # Global styles, design tokens, animations
│   ├── main.tsx               # App entry point
│   └── App.tsx                # Root component
├── supabase/
│   └── functions/
│       └── chat/
│           └── index.ts       # Edge function: AI chat orchestration
├── tailwind.config.ts         # Tailwind theme configuration
├── index.html                 # HTML entry with Google Fonts
└── README.md                  # This file
```

---

## Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Run the dev server**
   ```bash
   bun run dev
   ```

3. **Open in browser**
   Navigate to `http://localhost:5173`

> The app connects to the Lovable AI Gateway for streaming responses. Ensure `LOVABLE_API_KEY` is configured in your environment for local edge function testing.

---

## Design System

- **Typography**: Instrument Serif (headings) + Inter (body)
- **Color Palette**: Slate-based dark theme with semantic tokens (`--primary`, `--background`, `--muted`, etc.)
- **Effects**: Subtle gradient hero backgrounds, soft shadows, backdrop blur, and smooth fade-in animations
- **Layout**: Responsive, mobile-first with a centered chat experience

---

## Responsible AI

Flow is built with safety guardrails:

- Flags uncertainty instead of guessing
- Avoids biased, discriminatory, or harmful content
- Does not invent facts, statistics, or citations
- Appends disclaimers for legal, medical, financial, or HR-sensitive topics
- Refuses to collect passwords, IDs, banking details, or other sensitive personal data
- Encourages users to review AI-drafted communication before sending

---

## Roadmap

- [ ] Save conversation history to database
- [ ] Export emails and summaries to clipboard or file
- [ ] Voice input support
- [ ] Multi-language responses

---

Built with ❤️ using Lovable.
