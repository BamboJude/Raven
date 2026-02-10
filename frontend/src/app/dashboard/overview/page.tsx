"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  dashboardAPI,
  businessAPI,
  type DashboardStats,
  type ActivityItem,
  type ChartDataPoint,
  type UpcomingAppointment,
  type Business
} from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function OverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const businessId = searchParams.get("id");

  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!businessId) {
        router.push("/dashboard");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      try {
        // Load all dashboard data in parallel
        const [businessData, statsData, activityData, chartDataResult, appointmentsData] = await Promise.all([
          businessAPI.get(businessId, session.user.id),
          dashboardAPI.getStats(businessId, session.user.id),
          dashboardAPI.getActivity(businessId, session.user.id, 10),
          dashboardAPI.getChartData(businessId, session.user.id, 7),
          dashboardAPI.getUpcomingAppointments(businessId, session.user.id, 3),
        ]);

        setBusiness(businessData);
        setStats(statsData);
        setActivity(activityData);
        setChartData(chartDataResult);
        setUpcomingAppointments(appointmentsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setError(error instanceof Error ? error.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [businessId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            {lang === "fr" ? "Réessayer" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (!business || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
                ← {lang === "fr" ? "Retour au tableau de bord" : "Back to Dashboard"}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-600">{lang === "fr" ? "Vue d'ensemble" : "Overview"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Conversations */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {lang === "fr" ? "Conversations aujourd'hui" : "Conversations Today"}
              </h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.conversations_today}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total_conversations} {lang === "fr" ? "au total" : "total"}
            </p>
          </div>

          {/* Active Conversations */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {lang === "fr" ? "Conversations actives" : "Active Now"}
              </h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active_conversations}</p>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "fr" ? "Dernière heure" : "Last hour"}
            </p>
          </div>

          {/* Today's Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {lang === "fr" ? "Rendez-vous aujourd'hui" : "Appointments Today"}
              </h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.appointments_today}</p>
            <p className="text-sm text-gray-500 mt-1">
              {upcomingAppointments.length} {lang === "fr" ? "à venir" : "upcoming"}
            </p>
          </div>

          {/* Satisfaction Rate */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {lang === "fr" ? "Satisfaction" : "Satisfaction"}
              </h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.satisfaction_rate !== null ? `${stats.satisfaction_rate}%` : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "fr" ? "30 derniers jours" : "Last 30 days"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart + Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversations Chart */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {lang === "fr" ? "Conversations (7 derniers jours)" : "Conversations (Last 7 Days)"}
              </h2>
              <div className="h-64">
                <SimpleLineChart data={chartData} />
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {lang === "fr" ? "Activité récente" : "Recent Activity"}
              </h2>
              {activity.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  {lang === "fr" ? "Aucune activité récente" : "No recent activity"}
                </p>
              ) : (
                <div className="space-y-3">
                  {activity.map((item, idx) => (
                    <ActivityFeedItem key={idx} item={item} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Upcoming Appointments */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {lang === "fr" ? "Rendez-vous à venir" : "Upcoming Appointments"}
                </h2>
                <Link
                  href={`/dashboard/appointments?id=${businessId}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {lang === "fr" ? "Voir tout" : "View all"} →
                </Link>
              </div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  {lang === "fr" ? "Aucun rendez-vous à venir" : "No upcoming appointments"}
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appt) => (
                    <AppointmentCard key={appt.id} appointment={appt} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href={`/dashboard/live?id=${businessId}`} className="quick-access-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {lang === "fr" ? "Conversations en direct" : "Live Conversations"}
                </h3>
                <p className="text-sm text-gray-600">
                  {lang === "fr" ? "Reprendre le contrôle" : "Take over chats"}
                </p>
              </div>
            </div>
          </Link>

          <Link href={`/dashboard/setup?id=${businessId}`} className="quick-access-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {lang === "fr" ? "Configuration" : "Settings"}
                </h3>
                <p className="text-sm text-gray-600">
                  {lang === "fr" ? "FAQs, produits, IA" : "FAQs, products, AI"}
                </p>
              </div>
            </div>
          </Link>

          <Link href={`/dashboard/analytics?id=${businessId}`} className="quick-access-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">
                  {lang === "fr" ? "Statistiques détaillées" : "Detailed insights"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

// Simple SVG Line Chart Component
function SimpleLineChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 100;
  const height = 100;
  const padding = 10;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="#e5e7eb"
            strokeWidth="0.3"
          />
        ))}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
          const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="#0ea5e9"
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function ActivityFeedItem({ item, lang }: { item: ActivityItem; lang: string }) {
  const getIcon = () => {
    switch (item.type) {
      case "conversation":
        return "💬";
      case "appointment":
        return "📅";
      case "rating":
        return item.rating === "positive" ? "👍" : "👎";
      default:
        return "•";
    }
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return lang === "fr" ? "À l'instant" : "Just now";
    if (diffMins < 60) return `${diffMins}${lang === "fr" ? "min" : "m"}`;
    if (diffHours < 24) return `${diffHours}${lang === "fr" ? "h" : "h"}`;
    return past.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-xl">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{item.message}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo(item.timestamp)}</p>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, lang }: { appointment: UpcomingAppointment; lang: string }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{appointment.customer_name}</p>
          <p className="text-xs text-gray-600">{appointment.customer_email}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          appointment.status === "confirmed"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {appointment.status}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(appointment.appointment_date)}</span>
        <span>•</span>
        <span>{formatTime(appointment.appointment_time)}</span>
      </div>
      {appointment.service_type && (
        <p className="text-xs text-gray-500 mt-2">🛎️ {appointment.service_type}</p>
      )}
    </div>
  );
}
