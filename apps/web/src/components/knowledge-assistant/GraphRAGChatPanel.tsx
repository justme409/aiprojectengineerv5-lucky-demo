"use client"

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, Database } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";

type Message = {
  role: "user" | "assistant";
  content: string;
  thinking_steps?: ThinkingStep[];
  retrieval_context?: any;
};

type ThinkingStep = {
  step_number: number;
  step_type: string;
  action: string;
  cypher_query?: string;
  results_count?: number;
  reasoning?: string;
  completion?: string;
};

export function GraphRAGChatPanel() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const currentMessagesLength = messages.length;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      {
        role: "assistant",
        content: "",
        thinking_steps: [],
        retrieval_context: {},
      },
    ]);
    
    const assistantMessageIndex = currentMessagesLength + 1;

    try {
      const response = await fetch("/api/graphrag/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages,
          mode: "agent",
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "thinking_step") {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  if (newMessages[assistantMessageIndex]?.role === "assistant") {
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      thinking_steps: [
                        ...(newMessages[assistantMessageIndex].thinking_steps || []),
                        data.data,
                      ],
                    };
                  }
                  return newMessages;
                });
              } else if (data.type === "response") {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  if (newMessages[assistantMessageIndex]?.role === "assistant") {
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      content: data.data.response,
                      retrieval_context: data.data.retrieval_context,
                    };
                  }
                  return newMessages;
                });
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const assistantMsg = newMessages[assistantMessageIndex];
        if (assistantMsg && assistantMsg.role === "assistant") {
          assistantMsg.content = "Sorry, I encountered an error processing your request.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const isDark = theme === "dark";

  const containerClass = clsx(
    "flex h-full flex-col",
    isDark ? "bg-[#343541] text-[#ECECF1]" : "bg-white text-[#353740]"
  );

  const messageClass = (role: string) =>
    clsx(
      "rounded-2xl px-4 py-3 max-w-[85%]",
      role === "user"
        ? isDark
          ? "bg-[#343541] text-[#ECECF1] ml-auto border border-[#565869]"
          : "bg-[#F7F7F8] text-[#353740] ml-auto"
        : isDark
        ? "bg-[#444654] text-[#ECECF1]"
        : "bg-white text-[#353740]"
    );

  const inputClass = clsx(
    "flex-1 resize-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2",
    isDark
      ? "bg-[#40414F] text-[#ECECF1] placeholder-[#8E8EA0] focus:ring-[#10A37F]"
      : "bg-[#F7F7F8] text-[#353740] placeholder-[#8E8EA0] focus:ring-[#10A37F]"
  );

  const buttonClass = clsx(
    "rounded-full p-3 transition-colors disabled:opacity-50",
    isDark
      ? "bg-[#10A37F] hover:bg-[#1A7F64] text-white"
      : "bg-[#10A37F] hover:bg-[#1A7F64] text-white"
  );

  return (
    <div className={containerClass}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <Database className={clsx("mx-auto h-16 w-16 opacity-50", isDark ? "text-[#10A37F]" : "text-[#10A37F]")} />
              <h2 className="text-2xl font-semibold">Main Roads GraphRAG Assistant</h2>
              <p className={isDark ? "text-[#C5C5D2]" : "text-[#6E6E80]"}>
                Ask questions about Main Roads specifications and standards
              </p>
              <div className="space-y-2 mt-6">
                <button
                  onClick={() => setInput("What are the key requirements for road construction?")}
                  className={clsx(
                    "block w-full rounded-xl px-4 py-3 text-left transition-colors",
                    isDark
                      ? "bg-[#40414F] hover:bg-[#4D4E5F] text-[#ECECF1]"
                      : "bg-[#F7F7F8] hover:bg-[#ECECF1] text-[#353740]"
                  )}
                >
                  What are the key requirements for road construction?
                </button>
                <button
                  onClick={() => setInput("Tell me about pavement design standards")}
                  className={clsx(
                    "block w-full rounded-xl px-4 py-3 text-left transition-colors",
                    isDark
                      ? "bg-[#40414F] hover:bg-[#4D4E5F] text-[#ECECF1]"
                      : "bg-[#F7F7F8] hover:bg-[#ECECF1] text-[#353740]"
                  )}
                >
                  Tell me about pavement design standards
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div key={idx} className="flex flex-col">
            {message.role === "user" && (
              <div className={messageClass(message.role)}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}

            {message.role === "assistant" && (
              <>
                {message.thinking_steps && message.thinking_steps.length > 0 && (
                  <div
                    className={clsx(
                      "rounded-xl overflow-hidden border cursor-pointer",
                      isDark 
                        ? "bg-[#444654]/30 border-[#565869] hover:border-[#6E6E80]" 
                        : "bg-[#F7F7F8] border-[#ECECF1] hover:border-[#D1D5DB]"
                    )}
                    onClick={() => {
                      setExpandedSteps((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(idx)) {
                          newSet.delete(idx);
                        } else {
                          newSet.add(idx);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className={clsx("h-4 w-4", expandedSteps.has(idx) ? "text-[#10A37F]" : isDark ? "text-[#8E8EA0]" : "text-[#6E6E80]")} />
                        <span className={clsx("text-sm font-medium", isDark ? "text-[#ECECF1]" : "text-[#353740]")}>
                          Reasoning ({message.thinking_steps.length} steps)
                        </span>
                        {isLoading && expandedSteps.has(idx) && (
                          <Loader2 className="h-3 w-3 animate-spin text-[#10A37F]" />
                        )}
                      </div>
                      <span className={clsx("text-xs", isDark ? "text-[#8E8EA0]" : "text-[#6E6E80]")}>
                        {expandedSteps.has(idx) ? "▼" : "▶"}
                      </span>
                    </div>

                    {expandedSteps.has(idx) && (
                      <div className={clsx(
                        "px-4 py-3 border-t space-y-3 max-h-96 overflow-y-auto text-sm",
                        isDark ? "border-[#565869] text-[#ECECF1]" : "border-[#ECECF1] text-[#353740]"
                      )}>
                        {message.thinking_steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="leading-relaxed">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">{step.step_type}:</span> 
                              <span>{step.action}</span>
                              {isLoading && stepIdx === message.thinking_steps!.length - 1 && (
                                <Loader2 className="h-3 w-3 animate-spin text-[#10A37F] flex-shrink-0" />
                              )}
                            </p>
                            {step.cypher_query && (
                              <pre
                                className={clsx(
                                  "mt-1 p-2 rounded text-xs overflow-x-auto font-mono",
                                  isDark
                                    ? "bg-[#2B2B2B] text-[#10A37F]"
                                    : "bg-[#F7F7F8] text-[#10A37F]"
                                )}
                              >
                                {step.cypher_query}
                              </pre>
                            )}
                            {step.results_count !== undefined && (
                              <p className={clsx("mt-1 text-xs", isDark ? "text-[#8E8EA0]" : "text-[#6E6E80]")}>
                                → Found {step.results_count} results
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {message.content && (
                  <div className={clsx(messageClass(message.role), message.thinking_steps && message.thinking_steps.length > 0 ? "mt-2" : "")}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className={clsx(
          "border-t p-4",
          isDark ? "border-slate-700" : "border-slate-200"
        )}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about Main Roads standards..."
            className={inputClass}
            rows={1}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className={buttonClass}>
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

