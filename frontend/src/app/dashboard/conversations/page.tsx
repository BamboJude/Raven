"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, chatAPI, type Conversation, type Message } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { t, lang } = useLanguage();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [businessName, setBusinessName] = useState("");

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

      try {
        const business = await businessAPI.get(businessId, session.user.id);
        setBusinessName(business.name);
        const convos = await businessAPI.getConversations(businessId, session.user.id);
        setConversations(convos);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    setSelectedConversation(conversationId);

    try {
      const data = await chatAPI.getConversation(conversationId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
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
          <LanguageToggle />
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
              {t.convos.title} - {businessName}
            </h1>
          </div>
          {conversations.length > 0 && (
            <div className="flex gap-2">
              <a
                href={`${API_URL}/api/export/${businessId}/conversations?format=csv`}
                download
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </a>
              <a
                href={`${API_URL}/api/export/${businessId}/conversations?format=json`}
                download
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON
              </a>
            </div>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.convos.noConversations}</h2>
            <p className="text-gray-600">{t.convos.noConversationsDesc}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => loadMessages(convo.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedConversation === convo.id
                      ? "bg-primary-50 border-primary-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {convo.visitor_name || `${t.convos.visitor} ${convo.visitor_id.slice(0, 8)}...`}
                    </span>
                    <div className="flex items-center gap-1">
                      {convo.rating && (
                        <span title={convo.rating_comment || convo.rating}>
                          {convo.rating === "positive" ? "👍" : "👎"}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        convo.channel === "widget" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {convo.channel}
                      </span>
                    </div>
                  </div>
                  {convo.visitor_email && (
                    <p className="text-xs text-gray-500 mb-0.5">{convo.visitor_email}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatDate(convo.last_message_at)}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="card h-[600px] flex flex-col">
                  <h3 className="font-semibold text-gray-900 pb-4 border-b">{t.convos.messages}</h3>
                  {loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card h-[600px] flex items-center justify-center text-gray-500">
                  {t.convos.selectConversation}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
