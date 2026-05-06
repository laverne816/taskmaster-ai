import { Mail, FileText, CalendarCheck2, Search, MessageSquare } from "lucide-react";

const actions = [
  {
    icon: Mail,
    label: "Write an email",
    sublabel: "Formal · Informal · Persuasive",
    prompt:
      "Help me write a professional email. Ask me about: (1) recipient & audience (client, manager, or team), (2) purpose, (3) preferred tone (formal, informal, or persuasive), and (4) any key points to include.",
  },
  {
    icon: FileText,
    label: "Summarize notes",
    sublabel: "Key points · Decisions · Action items",
    prompt:
      "Summarize meeting notes for me. Paste the notes and I'll extract Key Points, Decisions Made, Action Items (with owners), and Deadlines.",
  },
  {
    icon: CalendarCheck2,
    label: "Plan my day",
    sublabel: "Prioritized · Time-blocked",
    prompt:
      "Help me plan my day. List your tasks and I'll prioritize them using Urgent vs Important, then build a time-blocked schedule with productivity tips.",
  },
  {
    icon: Search,
    label: "Research a topic",
    sublabel: "Summary · Insights · Recommendations",
    prompt:
      "Research a topic for me. Tell me the topic and I'll provide a Summary, Key Insights, and Recommendations — simplified for quick understanding.",
  },
  {
    icon: MessageSquare,
    label: "Just chat",
    sublabel: "Ask me anything workplace-related",
    prompt:
      "I'd like to chat about a workplace challenge. I'll describe the situation and you help me think it through.",
  },
];

interface QuickActionsProps {
  onPick: (prompt: string) => void;
}

export const QuickActions = ({ onPick }: QuickActionsProps) => (
  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
    {actions.map(({ icon: Icon, label, sublabel, prompt }) => (
      <button
        key={label}
        onClick={() => onPick(prompt)}
        className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/30 hover:shadow-elevated"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-hero group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        </span>
      </button>
    ))}
  </div>
);
