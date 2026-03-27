"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/contexts/chatbot-context";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatbotWidget = () => {
  const {
    messages,
    isOpen,
    isLoading,
    addMessage,
    setIsOpen,
    setIsLoading,
    clearMessages,
  } = useChatbot();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcut: Ctrl/Cmd + K to toggle chatbot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim().toLowerCase();
    
    // Check if user is confirming navigation
    const confirmWords = ["yes", "sure", "ok", "okay", "yeah", "yep", "take me", "go", "navigate"];
    const isConfirming = confirmWords.some(word => userInput.includes(word));
    
    // Get last assistant message with suggested route
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant" && m.suggestedRoute);
    
    if (isConfirming && lastAssistantMsg?.suggestedRoute) {
      // User is confirming navigation
      handleNavigation(lastAssistantMsg.suggestedRoute);
      setInput("");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      // Include last suggested route in context for better AI understanding
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: { 
            path: pathname,
            lastSuggestedRoute: lastAssistantMsg?.suggestedRoute,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Extract suggested route if present
        const navigateMatch = data.reply.match(/\[NAVIGATE:(\/[^\]]+)\]/);
        const suggestedRoute = navigateMatch ? navigateMatch[1] : undefined;

        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
          suggestedRoute,
        });
      } else {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNavigation = (route: string) => {
    router.push(route);
    addMessage({
      id: Date.now().toString(),
      role: "assistant",
      content: `✅ Taking you to ${route}...`,
      timestamp: new Date(),
    });
  };

  // Parse message for navigation links
  const parseMessage = (content: string) => {
    const navigatePattern = /\[NAVIGATE:(\/[^\]]+)\]/g;
    const parts: Array<{ type: "text" | "navigate"; content: string; route?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = navigatePattern.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }
      // Add navigation button
      parts.push({
        type: "navigate",
        content: "Go there",
        route: match[1],
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text" as const, content }];
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-all duration-200 animate-in fade-in"
          size="icon"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 w-96 h-[600px] max-h-[calc(100vh-3rem)] shadow-2xl z-50 flex flex-col",
            "max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:rounded-none",
            "animate-in slide-in-from-bottom-5 duration-300"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Smart Assistant 🤖</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const messageParts = msg.role === "assistant" ? parseMessage(msg.content) : [{ type: "text" as const, content: msg.content }];
              
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm space-y-2">
                      {messageParts.map((part, idx) => (
                        <React.Fragment key={idx}>
                          {part.type === "text" ? (
                            <p className="whitespace-pre-wrap">{part.content}</p>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleNavigation(part.route!)}
                              className="mt-2 gap-2"
                            >
                              {part.content}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
