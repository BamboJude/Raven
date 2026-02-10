"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";

// Demo business ID for the landing page widget
const DEMO_BUSINESS_ID = "72faa6e6-c4cf-4cb1-8108-780424d23b65";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Set RAVEN_CONFIG before widget loads
    (window as unknown as { RAVEN_CONFIG: { businessId: string; apiUrl: string } }).RAVEN_CONFIG = {
      businessId: DEMO_BUSINESS_ID,
      apiUrl: API_URL,
    };
    setWidgetReady(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">R</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">Raven Support</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2">
                {t.nav.dashboard}
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="link text-sm sm:text-base">
                  {t.nav.login}
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap">
                  {t.nav.signup}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {t.landing.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            {t.landing.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/auth/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto">
              {t.landing.tryFree}
            </Link>
            <Link
              href="#features"
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              {t.landing.learnMore}
            </Link>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-16 sm:mt-24 md:mt-32">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-4">
            {t.landing.whyChoose}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-primary-600"
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
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.landing.feature1Title}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.landing.feature1Desc}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.landing.feature2Title}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.landing.feature2Desc}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-primary-600"
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
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.landing.feature3Title}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.landing.feature3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mt-16 sm:mt-24 md:mt-32 text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t.landing.pricing}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            {t.landing.priceFrom} <span className="font-bold text-primary-600">10,000 CFA/mois</span>
          </p>
          <Link href="/auth/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 inline-block">
            {t.landing.startNow}
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900">Raven Support</span>
          </div>
          <p className="text-gray-600 text-sm">
            2024 Raven Support. {t.landing.footer}
          </p>
        </div>
      </footer>

      {/* Raven Chat Widget */}
      {widgetReady && (
        <Script
          src={`${API_URL}/static/raven-widget.js`}
          strategy="afterInteractive"
        />
      )}
    </div>
  );
}
