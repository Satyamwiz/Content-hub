"use client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { ChatbotProvider } from "@/contexts/chatbot-context";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useDarkMode();
  return (
    <ClerkProvider appearance={isDarkMode ? { baseTheme: dark } : undefined}>
      <ThemeProvider
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ChatbotProvider>
          {children}
          <ChatbotWidget />
        </ChatbotProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};
