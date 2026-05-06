import { Mail, FileText, CalendarCheck2, Search } from "lucide-react";

const actions = [
  { icon: Mail, label: "Write an email", prompt: "Help me write a professional email. Ask me about the recipient, purpose, and tone." },
  { icon: FileText, label: "Summarize notes", prompt: "Summarize meeting notes for me. Paste the notes and I'll extract key points, decisions, action items, and deadlines." },
  { icon: CalendarCheck2, label: "Plan my day", prompt: "Help me plan my day. List your tasks and I'll prioritize them with a time-blocked schedule." },
  { icon: Search, label: "Research a topic", prompt: "Research a topic for me. Tell me the topic and I'll provide a summary, key insights, and recommendations." },
];

interface QuickActionsProps {
  onPick: (prompt: string) => void;
}

export const QuickActions = ({ onPick }: QuickActionsProps) => (
  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
    {actions.map(({ icon: Icon, label, prompt }) => (
      <button
        key={label}
        onClick={() => onPick(prompt)}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/30 hover:shadow-elevated"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-hero group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </button>
    ))}
  </div>
);
