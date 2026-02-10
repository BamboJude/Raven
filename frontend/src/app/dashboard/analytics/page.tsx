"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnalyticsData {
  period_days: number;
  summary: {
    total_conversations: number;
    recent_conversations: number;
    total_messages: number;
    user_messages: number;
    assistant_messages: number;
    avg_messages_per_conversation: number;
  };
  satisfaction: {
    total_rated: number;
    positive: number;
    negative: number;
    satisfaction_percent: number | null;
  };
  channels: {
    total: { widget: number; whatsapp: number };
    recent: { widget: number; whatsapp: number };
  };
  chart_data: Array<{ date: string; widget: number; whatsapp: number }>;
  recent_activity: Array<{
    id: string;
    channel: string;
    visitor_id: string;
    started_at: string;
    last_message_at: string;
    message_count: number;
    last_message_preview: string;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [period, setPeriod] = useState(30);

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
        // Fetch analytics
        const response = await fetch(`${API_URL}/api/analytics/${businessId}?days=${period}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }

        // Fetch business name
        const bizResponse = await fetch(`${API_URL}/api/businesses/${businessId}`, {
          headers: { Authorization: `Bearer ${session.user.id}` }
        });
        if (bizResponse.ok) {
          const bizData = await bizResponse.json();
          setBusinessName(bizData.name);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId, period]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
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

  const maxChartValue = analytics
    ? Math.max(...analytics.chart_data.map(d => d.widget + d.whatsapp), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raven</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-primary-600 hover:underline text-sm mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">{businessName}</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="input w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.summary.total_conversations}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.summary.recent_conversations} in last {period} days
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.summary.total_messages}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {analytics.summary.avg_messages_per_conversation} per conversation
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Widget Chats</p>
                <p className="text-3xl font-bold text-primary-600">{analytics.channels.total.widget}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.channels.recent.widget} in last {period} days
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">WhatsApp Chats</p>
                <p className="text-3xl font-bold text-green-600">{analytics.channels.total.whatsapp}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.channels.recent.whatsapp} in last {period} days
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Satisfaction</p>
                <p className="text-3xl font-bold text-amber-500">
                  {analytics.satisfaction.satisfaction_percent !== null
                    ? `${analytics.satisfaction.satisfaction_percent}%`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.satisfaction.total_rated > 0
                    ? `👍 ${analytics.satisfaction.positive}  👎 ${analytics.satisfaction.negative}`
                    : "No ratings yet"}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversations Over Time</h2>
              <div className="h-64 flex items-end gap-1">
                {analytics.chart_data.slice(-14).map((day, index) => {
                  const total = day.widget + day.whatsapp;
                  const height = total > 0 ? (total / maxChartValue) * 100 : 0;
                  const widgetHeight = day.widget > 0 ? (day.widget / total) * height : 0;
                  const whatsappHeight = day.whatsapp > 0 ? (day.whatsapp / total) * height : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col justify-end h-48">
                        {total > 0 ? (
                          <>
                            <div
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: `${whatsappHeight}%` }}
                              title={`WhatsApp: ${day.whatsapp}`}
                            />
                            <div
                              className="w-full bg-primary-500"
                              style={{ height: `${widgetHeight}%` }}
                              title={`Widget: ${day.widget}`}
                            />
                          </>
                        ) : (
                          <div className="w-full bg-gray-200 h-1 rounded" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-500 rounded" />
                  <span className="text-sm text-gray-600">Widget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm text-gray-600">WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {analytics.recent_activity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No conversations yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.recent_activity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/conversations?id=${businessId}&conv=${activity.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.channel === "whatsapp" ? "bg-green-100" : "bg-primary-100"
                      }`}>
                        {activity.channel === "whatsapp" ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {activity.visitor_id.substring(0, 12)}...
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            activity.channel === "whatsapp"
                              ? "bg-green-100 text-green-700"
                              : "bg-primary-100 text-primary-700"
                          }`}>
                            {activity.channel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.last_message_preview || "No messages"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{activity.message_count} msgs</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(activity.last_message_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
