"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, teamAPI, type Business } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { ChatToggle } from "@/components/ChatToggle";
import { RavenIcon } from "@/components/shared/RavenIcon";
import { ProfileMenu } from "@/components/shared/ProfileMenu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Team member state
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberBusiness, setTeamMemberBusiness] = useState<Business | null>(null);
  const [teamMemberRole, setTeamMemberRole] = useState<string>("");

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
      setUserName(session.user.user_metadata?.full_name || null);

      try {
        const data = await businessAPI.list(session.user.id);
        setBusinesses(data);

        // If user has no businesses, check if they're a team member
        if (data.length === 0) {
          console.log("🔍 No businesses found, checking if user is a team member...");
          console.log("User ID:", session.user.id);

          try {
            console.log("📡 Calling teamAPI.getCurrentMember...");
            const { member } = await teamAPI.getCurrentMember(session.user.id);
            console.log("✅ Team member found:", member);

            // User is a team member - load their business info
            setIsTeamMember(true);
            setTeamMemberRole(member.role);

            // Fetch business details
            console.log("📡 Fetching business details for business_id:", member.business_id);
            const business = await businessAPI.get(member.business_id, session.user.id);
            console.log("✅ Business loaded:", business);
            setTeamMemberBusiness(business);
          } catch (err) {
            // User is neither a business owner nor a team member
            // Show the "Set Up My Business" page
            console.error("❌ Team member check failed:", err);
            console.error("Error details:", {
              message: err instanceof Error ? err.message : "Unknown error",
              response: (err as any)?.response,
              status: (err as any)?.status
            });
            console.log("User is not a team member, showing setup page");
          }
        }
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

  // Team Member Dashboard View
  if (isTeamMember && teamMemberBusiness) {
    const business = teamMemberBusiness;
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RavenIcon size={40} className="text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Raven</span>
            </div>

            <div className="flex items-center gap-4">
              <ChatToggle businessId={business.id} apiUrl={API_URL} />
              <LanguageToggle />
              <ProfileMenu userEmail={userEmail} userName={userName} lang={lang} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${
                teamMemberRole === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {teamMemberRole === 'admin'
                  ? (lang === 'fr' ? 'Administrateur' : 'Admin')
                  : (lang === 'fr' ? 'Membre' : 'Member')}
              </span>
            </div>
            <p className="text-gray-600">{business.description}</p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Conversations */}
            <Link href={`/dashboard/live?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Conversations en direct' : 'Live Conversations'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Gérer les conversations en temps réel' : 'Manage real-time conversations'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Appointments */}
            <Link href={`/dashboard/appointments?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Rendez-vous' : 'Appointments'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Voir et gérer les rendez-vous' : 'View and manage appointments'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href={`/dashboard/analytics?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Analyses' : 'Analytics'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Statistiques et rapports' : 'Statistics and reports'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Conversations History */}
            <Link href={`/dashboard/conversations?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Historique' : 'Conversations'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Voir toutes les conversations' : 'View all conversations'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Team */}
            <Link href={`/dashboard/team?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Équipe' : 'Team'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Voir les membres de l\'équipe' : 'View team members'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Availability */}
            <Link href={`/dashboard/availability?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Disponibilités' : 'Availability'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Gérer les horaires' : 'Manage schedules'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Notifications */}
            <Link href={`/dashboard/notifications?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === 'fr' ? 'Notifications' : 'Notifications'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lang === 'fr' ? 'Paramètres de notification' : 'Notification settings'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Widget (Admin/Owner only) */}
            {teamMemberRole === 'admin' && (
              <Link href={`/dashboard/widget?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Widget
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lang === 'fr' ? 'Code d\'intégration' : 'Integration code'}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Business Settings (Admin only) */}
            {teamMemberRole === 'admin' && (
              <Link href={`/dashboard/setup?id=${business.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {lang === 'fr' ? 'Paramètres' : 'Settings'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lang === 'fr' ? 'Configuration de l\'entreprise' : 'Business configuration'}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Business Owner Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RavenIcon size={40} className="text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Raven</span>
          </div>

          <div className="flex items-center gap-4">
            {businesses.filter(b => !b.is_system).length > 0 && (
              <ChatToggle businessId={businesses.find(b => !b.is_system)!.id} apiUrl={API_URL} />
            )}
            <LanguageToggle />
            {isAdmin && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                Admin
              </span>
            )}
            <ProfileMenu userEmail={userEmail} userName={userName} lang={lang} />
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
