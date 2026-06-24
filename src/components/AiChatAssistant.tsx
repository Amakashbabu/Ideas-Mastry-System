import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  Sparkles, 
  MessageCircle, 
  CornerDownLeft, 
  Flame, 
  Compass, 
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatAssistantProps {
  currentIdea: string;
  backendBusiness: string;
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ currentIdea, backendBusiness }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey human! I am your **Ideas Mastery AI Coach** 🚀\n\nI am fully integrated into this live workspace. I can help you **brainstorm new angles**, fine-tune your script hooks, explain your psychology rating, or write compelling titles in professional English.\n\nWould you like to upgrade one of your current ideas or map out a brand new content strategy? Let me know!"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Handle send message
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput("");
    }
    setErrorText(null);

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages,
          currentIdea: currentIdea || "No idea loaded yet",
          backendBusiness: backendBusiness || "SaaS"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI Coach.");
      }

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error("No payload response received.");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorText(err.message || "Something went wrong. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  // Helper dynamic templates/pre-fill prompts that adapt to the active loaded idea
  const getDynamicStarterPrompts = () => {
    const formattedIdea = currentIdea && currentIdea.trim() !== "" ? currentIdea : null;
    const truncated = formattedIdea 
      ? (formattedIdea.length > 40 ? formattedIdea.substring(0, 37) + "..." : formattedIdea)
      : "My Content Idea";

    return [
      {
        label: formattedIdea ? `💡 Viral Hooks: "${truncated}"` : "💡 Generate high curiosity hooks",
        prompt: formattedIdea 
          ? `Specific idea: "${formattedIdea}"\n\nGenerate 3 highly engaging curiosity-driven viral hooks for this idea that can grab attention on LinkedIn/X.`
          : "Generate 3 high-converting curiosity hooks for our current idea that can go viral on LinkedIn/X."
      },
      {
        label: formattedIdea ? `🎯 Outline Script for: "${truncated}"` : "🎯 Help me write a great outline",
        prompt: formattedIdea
          ? `Specific idea: "${formattedIdea}"\n\nPrepare a structured 60-second content script outline for this idea, including hooks, value injection, and a compelling call-to-action targeting a ${backendBusiness || "SaaS/Agency"} business.`
          : "Prepare a structured 60-second content script outline for this idea."
      },
      {
        label: formattedIdea ? `🔥 Multiplier Angles: "${truncated}"` : "🔥 Make it more curiosity-driven",
        prompt: formattedIdea
          ? `Specific idea: "${formattedIdea}"\n\nSuggest 3 unique pricing or creative angles to increase the psychological impact (curiosity triggers and audience stakes) of this idea by 10x.`
          : "Suggest 3 unique angles to increase the psychological impact (Curiosity and Stakes pillars) of my strategy/idea."
      }
    ];
  };

  const starterPrompts = getDynamicStarterPrompts();

  // Simple clean message content formatting (bolds, bullet lines, line breaks)
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      // Bold text formatting matching **bold**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const lineContent = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIdx} className="font-extrabold text-slate-900 drop-shadow-3xs">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Render bullet list items
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        const cleanedLine = line.trim().replace(/^[-•]\s*/, "");
        const formattedLineParts = cleanedLine.split(/(\*\*[^*]+\*\*)/g).map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-extrabold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={lineIdx} className="flex items-start gap-1.5 pl-3 py-1 text-slate-800">
            <span className="text-[#0F172A] mt-1.5 shrink-0 block h-1.5 w-1.5 rounded-full bg-slate-900" />
            <span className="text-xs leading-relaxed text-slate-750 font-sans">{formattedLineParts}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="text-xs md:text-sm text-slate-800 min-h-[0.5rem] leading-relaxed font-sans mt-1">
          {lineContent}
        </p>
      );
    });
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none border border-slate-700/50"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-wider font-mono uppercase hidden md:inline">
            Ideas AI Coach
          </span>
        </button>
      </div>

      {/* CHAT CONTAINER PANEL */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] bg-white border border-[#E2E8F0] rounded-2xl shadow-3xl flex flex-col overflow-hidden animate-fade-in">
          
          {/* HEADER BAR */}
          <div className="bg-[#0F172A] text-white px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1 px-2 bg-slate-800 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                  Coaching Sparring Engine
                </h3>
                <h4 className="text-sm font-semibold font-display tracking-tight">
                  Ideas Mastery AI Coach
                </h4>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all focus:outline-none"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIVE CONTEXT CARD */}
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="truncate max-w-[220px]">
              <span className="font-bold text-slate-600">Idea:</span>{" "}
              {currentIdea ? `"${currentIdea}"` : "No active idea yet"}
            </div>
            <div className="shrink-0 bg-slate-200/85 px-2 py-0.5 rounded text-[9px] font-bold text-slate-700">
              {backendBusiness} Business
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => {
              const chatbot = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex ${chatbot ? "justify-start" : "justify-end"} items-start gap-2.5`}
                >
                  {chatbot && (
                    <div className="h-7 w-7 bg-slate-900 flex items-center justify-center rounded-lg shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs md:text-sm ${
                      chatbot
                        ? "bg-white border border-[#E2E8F0] rounded-tl-none shadow-3xs"
                        : "bg-slate-900 text-white rounded-tr-none shadow-2xs"
                    }`}
                  >
                    {!chatbot && (
                      <span className="block text-[8px] uppercase tracking-wider font-mono text-slate-400 pb-1">
                        YOUR PROMPT
                      </span>
                    )}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {chatbot ? renderMessageContent(m.content) : m.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* TYPING STATUS INDICATOR */}
            {loading && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="h-7 w-7 bg-slate-900 flex items-center justify-center rounded-lg shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce delay-100" />
                  <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce delay-200" />
                  <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce delay-300" />
                </div>
              </div>
            )}

            {/* ERROR FLAG */}
            {errorText && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
                {errorText}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* DYNAMIC STARTER RECOMMENDATIONS */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-2 bg-white border-t border-[#E2E8F0] space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Dynamic Starters:
              </span>
              <div className="flex flex-col gap-1">
                {starterPrompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.prompt)}
                    className="w-full text-left bg-slate-50 hover:bg-[#F1F5F9] border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] p-2 rounded-lg font-medium transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGE INPUT TAB */}
          <div className="p-3 bg-white border-t border-[#E2E8F0]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask advice on hooks, score metrics or headlines..."
                className="flex-1 text-xs md:text-sm bg-[#F8FAFC] border border-[#E2E8F0] focus:border-slate-900 focus:outline-none p-2.5 rounded-xl text-slate-800"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-slate-900 hover:bg-black text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-1.5 px-1">
              <span>Always in professional English style</span>
              <span className="flex items-center gap-1">
                Press Enter <CornerDownLeft className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
