"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, liveAPI, type LiveConversation, type Message } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";

export default function LiveConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { lang } = useLanguage();

  const [userId, setUserId] = useState<string>("");
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-refresh conversations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId && businessId) {
        refreshConversations();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, businessId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      if (!businessId) {
        router.push("/dashboard");
        return;
      }

      setUserId(session.user.id);

      try {
        const business = await businessAPI.get(businessId, session.user.id);
        setBusinessName(business.name);
        const convos = await liveAPI.getConversations(businessId, session.user.id);
        setConversations(convos);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const refreshConversations = async () => {
    if (!businessId || !userId) return;
    try {
      const convos = await liveAPI.getConversations(businessId, userId);
      setConversations(convos);

      // Also refresh selected conversation if it exists
      if (selectedConversation) {
        const updated = await liveAPI.getConversation(businessId, selectedConversation.id, userId);
        setSelectedConversation(updated);
      }
    } catch (err) {
      console.error("Failed to refresh:", err);
    }
  };

  const loadConversation = async (conversationId: string) => {
    if (!businessId || !userId) return;
    setLoadingMessages(true);

    try {
      const data = await liveAPI.getConversation(businessId, conversationId, userId);
      setSelectedConversation(data);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation || !businessId || !userId) return;

    try {
      const result = await liveAPI.takeover(businessId, selectedConversation.id, userId);
      if (result.success) {
        setSelectedConversation({ ...selectedConversation, is_human_takeover: true });
        refreshConversations();
      }
    } catch (err) {
      console.error("Failed to take over:", err);
      alert(lang === "fr" ? "Échec de la prise en charge" : "Failed to take over");
    }
  };

  const handleRelease = async () => {
    if (!selectedConversation || !businessId || !userId) return;

    try {
      const result = await liveAPI.release(businessId, selectedConversation.id, userId);
      if (result.success) {
        setSelectedConversation({ ...selectedConversation, is_human_takeover: false });
        refreshConversations();
      }
    } catch (err) {
      console.error("Failed to release:", err);
      alert(lang === "fr" ? "Échec de la libération" : "Failed to release");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !businessId || !userId || !newMessage.trim()) return;

    setSending(true);
    try {
      await liveAPI.sendMessage(businessId, selectedConversation.id, newMessage.trim(), userId);
      setNewMessage("");
      // Refresh to get the new message
      await loadConversation(selectedConversation.id);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(lang === "fr" ? "Échec de l'envoi" : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <RavenIcon size={40} className="text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Raven</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {lang === "fr" ? "Conversations en direct" : "Live Conversations"} - {businessName}
            </h1>
          </div>
          <button
            onClick={refreshConversations}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {lang === "fr" ? "Actualiser" : "Refresh"}
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {lang === "fr" ? "Aucune conversation active" : "No active conversations"}
            </h2>
            <p className="text-gray-600">
              {lang === "fr"
                ? "Les conversations des dernières 24h apparaîtront ici"
                : "Conversations from the last 24 hours will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => loadConversation(convo.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedConversation?.id === convo.id
                      ? "bg-primary-50 border-primary-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {lang === "fr" ? "Visiteur" : "Visitor"} {convo.visitor_id.slice(0, 8)}...
                    </span>
                    <div className="flex items-center gap-2">
                      {convo.is_human_takeover && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                          {lang === "fr" ? "En charge" : "Taken Over"}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        convo.channel === "widget" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {convo.channel}
                      </span>
                    </div>
                  </div>
                  {convo.last_message && (
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {convo.last_message_role === "user" ? "👤 " : "🤖 "}
                      {convo.last_message}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatDate(convo.last_message_at)}</p>
                    <span className="text-xs text-gray-400">{convo.message_count} msgs</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Conversation Detail */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="card h-[700px] flex flex-col">
                  {/* Header with takeover controls */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {lang === "fr" ? "Visiteur" : "Visitor"} {selectedConversation.visitor_id.slice(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.channel} • {formatTime(selectedConversation.last_message_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConversation.is_human_takeover ? (
                        <>
                          <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {lang === "fr" ? "Vous contrôlez" : "You're in control"}
                          </span>
                          <button
                            onClick={handleRelease}
                            className="btn-secondary text-sm"
                          >
                            {lang === "fr" ? "Rendre à l'IA" : "Release to AI"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleTakeover}
                          className="btn-primary text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {lang === "fr" ? "Prendre en charge" : "Take Over"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  {loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {selectedConversation.messages?.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Message Input (only when taken over) */}
                  {selectedConversation.is_human_takeover && (
                    <form onSubmit={handleSendMessage} className="pt-4 border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={lang === "fr" ? "Écrivez votre réponse..." : "Type your reply..."}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={sending || !newMessage.trim()}
                          className="btn-primary px-6 disabled:opacity-50"
                        >
                          {sending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Prompt to take over */}
                  {!selectedConversation.is_human_takeover && (
                    <div className="pt-4 border-t text-center text-gray-500 text-sm">
                      {lang === "fr"
                        ? "Prenez en charge la conversation pour répondre manuellement"
                        : "Take over the conversation to reply manually"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card h-[700px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>{lang === "fr" ? "Sélectionnez une conversation" : "Select a conversation"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
