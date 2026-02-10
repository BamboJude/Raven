"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

interface ChatToggleProps {
  businessId: string;
  apiUrl?: string;
}

export function ChatToggle({ businessId, apiUrl = "http://localhost:8000" }: ChatToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Set RAVEN_CONFIG
    (window as unknown as { RAVEN_CONFIG: { businessId: string; apiUrl: string } }).RAVEN_CONFIG = {
      businessId,
      apiUrl,
    };
  }, [businessId, apiUrl]);

  const toggleChat = () => {
    if (!scriptLoaded) {
      setScriptLoaded(true);
    }

    // Give the script time to initialize, then toggle
    setTimeout(() => {
      const chatWindow = document.getElementById("raven-chat-window");
      const container = document.getElementById("raven-widget-container");

      if (chatWindow && container) {
        if (isOpen) {
          chatWindow.classList.remove("open");
          container.style.display = "none";
        } else {
          container.style.display = "block";
          chatWindow.classList.add("open");
        }
        setIsOpen(!isOpen);
      }
    }, scriptLoaded ? 0 : 500);
  };

  // Hide the floating button when widget loads (we use header button instead)
  useEffect(() => {
    if (scriptLoaded) {
      const interval = setInterval(() => {
        const chatButton = document.getElementById("raven-chat-button");
        const container = document.getElementById("raven-widget-container");
        if (chatButton && container) {
          chatButton.style.display = "none";
          if (!isOpen) {
            container.style.display = "none";
          }
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scriptLoaded, isOpen]);

  return (
    <>
      <button
        onClick={toggleChat}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        title="Chat"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{isOpen ? "Close" : "Chat"}</span>
      </button>

      {scriptLoaded && (
        <Script
          src={`${apiUrl}/static/raven-widget.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
