import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage, type ChatRole } from "@/components/ChatMessage";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: ChatRole;
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        toast.error(err.error || `Error ${res.status}`);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Connection error. Please try again.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-screen flex-col gradient-subtle">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl gradient-hero shadow-glow">
              <Sparkles className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-xl">Flow</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">· Workplace Productivity Assistant</span>
          </div>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {empty ? (
            <div className="flex flex-col items-center gap-8 pt-12 text-center animate-fade-up">
              <div className="flex size-16 items-center justify-center rounded-3xl gradient-hero shadow-elevated">
                <Sparkles className="size-7 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-5xl leading-tight sm:text-6xl">
                  What would you like <span className="text-gradient">help with</span> today?
                </h1>
                <p className="mx-auto max-w-md text-muted-foreground">
                  Draft emails, summarize notes, plan tasks, or research any topic — in seconds.
                </p>
              </div>
              <div className="w-full pt-4">
                <QuickActions onPick={send} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-6">
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content || (streaming && i === messages.length - 1 ? "..." : "")} />
              ))}
              {streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
                <div className="ml-13 flex gap-1.5 pl-13">
                  <span className="size-2 rounded-full bg-primary animate-pulse-dot" />
                  <span className="size-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="size-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-soft transition-shadow focus-within:shadow-elevated">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything — email, summary, task plan, research..."
              rows={1}
              className="min-h-[44px] max-h-40 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] shadow-none focus-visible:ring-0"
            />
            {streaming ? (
              <Button onClick={stop} size="icon" variant="secondary" className="size-10 shrink-0 rounded-2xl">
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={() => send(input)}
                disabled={!input.trim()}
                size="icon"
                className="size-10 shrink-0 rounded-2xl gradient-hero shadow-soft transition-transform hover:scale-105 disabled:opacity-40"
              >
                <ArrowUp className="size-5" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Flow can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
