"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Omlouvám se, nastala chyba. Zkuste to prosím znovu." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-[#36227e22] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#36227e] flex items-center justify-center text-white font-bold text-lg select-none">
          A
        </div>
        <div>
          <h1 className="text-[#36227e] font-semibold text-base leading-tight">
            Analise Funnelova
          </h1>
          <p className="text-[#7c6ab5] text-xs">AI Funnel Agent</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#7c6ab5] text-xs">Online</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4 bg-[#faf9ff]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-[#36227e] flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <h2 className="text-[#36227e] text-xl font-semibold">
              Ahoj, jsem Analise Funnelova
            </h2>
            <p className="text-[#7c6ab5] text-sm max-w-sm">
              Jsem váš AI agent specializovaný na analýzu funnelů a optimalizaci konverzí. Jak vám mohu pomoci?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full max-w-sm">
              {[
                "Analyzuj můj sales funnel",
                "Jak zlepšit konverzní poměr?",
                "Pomoz mi s lead generation",
                "Optimalizace checkout procesu",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="px-3 py-2 rounded-lg border border-[#36227e33] text-[#36227e] text-xs hover:bg-[#36227e0d] transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#36227e] flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                A
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#36227e] text-white rounded-tr-sm"
                  : "bg-white text-[#1a1340] rounded-tl-sm border border-[#36227e22] shadow-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && msg.content === "" && loading && (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#7c6ab5] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7c6ab5] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7c6ab5] rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[#36227e22] bg-white">
        <div className="flex items-end gap-2 bg-[#faf9ff] border border-[#36227e33] rounded-2xl px-4 py-3 focus-within:border-[#36227e] transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Napište zprávu…"
            className="flex-1 bg-transparent text-[#1a1340] text-sm placeholder-[#a99fd4] resize-none outline-none leading-relaxed"
            style={{ maxHeight: "160px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-[#36227e] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#4a30a8] transition-colors shrink-0"
            aria-label="Odeslat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[#b0a8d4] text-[10px] mt-2">
          Analise může dělat chyby. Důležité informace ověřte.
        </p>
      </div>
    </div>
  );
}
