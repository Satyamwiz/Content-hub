"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedRoute?: string; // Track suggested navigation
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your Smart Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm your Smart Assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        addMessage,
        setIsOpen,
        setIsLoading,
        clearMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
};
