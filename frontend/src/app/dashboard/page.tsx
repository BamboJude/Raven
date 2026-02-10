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

      </main>
    </div>
  );
}
