"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, type Business } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { ChatToggle } from "@/components/ChatToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      setUserEmail(session.user.email || "");

      try {
        const data = await businessAPI.list(session.user.id);
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to load businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDelete = async (businessId: string, businessName: string) => {
    const confirmMessage = lang === "fr"
      ? `Êtes-vous sûr de vouloir supprimer "${businessName}" ? Cette action est irréversible et supprimera toutes les données associées.`
      : `Are you sure you want to delete "${businessName}"? This action cannot be undone and will delete all associated data.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingId(businessId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await businessAPI.delete(businessId, session.user.id);
      setBusinesses(businesses.filter(b => b.id !== businessId));
    } catch (err) {
      console.error("Failed to delete business:", err);
      const errorMessage = lang === "fr"
        ? "Échec de la suppression. Veuillez réessayer."
        : "Failed to delete. Please try again.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const isAdmin = userEmail === "bambojude@gmail.com";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raven Support</span>
          </div>

          <div className="flex items-center gap-4">
            {businesses.filter(b => !b.is_system).length > 0 && (
              <ChatToggle businessId={businesses.find(b => !b.is_system)!.id} apiUrl={API_URL} />
            )}
            <LanguageToggle />
            <span className="text-sm text-gray-600">
              {userEmail}
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                  Admin
                </span>
              )}
            </span>
            <button onClick={handleSignOut} className="btn-secondary text-sm">
              {t.nav.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <Link href="/dashboard/setup" className="btn-primary">
            {t.dashboard.newBusiness}
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t.dashboard.noBusiness}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.dashboard.noBusinessDesc}
            </p>
            <Link href="/dashboard/setup" className="btn-primary">
              {t.dashboard.setupBusiness}
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className={`card ${business.is_system ? "border-2 border-primary-500 bg-primary-50" : ""}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {business.is_system && (
                    <svg className="w-5 h-5 inline mr-1 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                  {business.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {business.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  {business.is_system && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                      {lang === "fr" ? "Support Officiel" : "Official Support"}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      business.language === "fr"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {business.language === "fr" ? t.dashboard.french : t.dashboard.english}
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  <Link
                    href={`/dashboard/overview?id=${business.id}`}
                    className="btn-primary text-sm flex-1 text-center"
                  >
                    {lang === "fr" ? "Vue d'ensemble" : "Overview"}
                  </Link>
                  {(!business.is_system || isAdmin) && (
                    <Link
                      href={`/dashboard/setup?id=${business.id}`}
                      className="btn-secondary text-sm flex-1 text-center"
                    >
                      {t.dashboard.modify}
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/widget?id=${business.id}`}
                    className="btn-secondary text-sm flex-1 text-center"
                  >
                    {t.dashboard.widget}
                  </Link>
                  {!business.is_system && (
                    <button
                      onClick={() => handleDelete(business.id, business.name)}
                      disabled={deletingId === business.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title={lang === "fr" ? "Supprimer" : "Delete"}
                    >
                      {deletingId === business.id ? (
                        <div className="spinner h-4 w-4"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs justify-center">
                  <Link
                    href={`/dashboard/conversations?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {t.dashboard.conversations}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/appointments?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {lang === "fr" ? "Rendez-vous" : "Appointments"}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/analytics?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    Analytics
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/team?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {t.dashboard.team}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/availability?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {lang === "fr" ? "Disponibilités" : "Availability"}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/notifications?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {lang === "fr" ? "Notifications" : "Notifications"}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/dashboard/live?id=${business.id}`}
                    className="text-primary-600 hover:underline whitespace-nowrap"
                  >
                    {lang === "fr" ? "Conversations en direct" : "Live"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {businesses.filter(b => !b.is_system).length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Link
              href={`/dashboard/conversations?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t.dashboard.conversations}</h3>
                  <p className="text-sm text-gray-600">
                    {t.dashboard.conversationsDesc}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/analytics?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    View conversation metrics and statistics
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/widget?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t.dashboard.widget}</h3>
                  <p className="text-sm text-gray-600">
                    {t.dashboard.widgetDesc}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/appointments?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{lang === "fr" ? "Rendez-vous" : "Appointments"}</h3>
                  <p className="text-sm text-gray-600">
                    {lang === "fr"
                      ? "Gérer les rendez-vous pris via le chatbot"
                      : "Manage appointments made through the chatbot"}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/team?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t.dashboard.team}</h3>
                  <p className="text-sm text-gray-600">
                    {t.dashboard.teamDesc}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/availability?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{lang === "fr" ? "Disponibilités" : "Availability"}</h3>
                  <p className="text-sm text-gray-600">
                    {lang === "fr"
                      ? "Configurer les horaires et disponibilités"
                      : "Configure hours and availability"}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/notifications?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lang === "fr" ? "Notifications" : "Notifications"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === "fr"
                      ? "Configurer les emails et SMS pour les rendez-vous"
                      : "Configure email and SMS for appointments"}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/live?id=${businesses.find(b => !b.is_system)!.id}`}
              className="quick-access-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lang === "fr" ? "Conversations en direct" : "Live Conversations"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === "fr"
                      ? "Surveiller et reprendre les conversations en cours"
                      : "Monitor and take over active conversations"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
