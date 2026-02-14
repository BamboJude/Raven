"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import {
  MessageCircle,
  Clock,
  Globe,
  Zap,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  Star,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Raven
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
                Pricing
              </a>
              <a href="#demo" className="text-gray-600 hover:text-primary-600 transition-colors">
                Demo
              </a>
            </div>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                >
                  {t.nav.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-primary-600 transition-colors hidden sm:block"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                  >
                    {t.nav.signup}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Customer Support</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              {t.landing.title || "Transform Your Customer Support with AI"}
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              {t.landing.subtitle || "Automate conversations, book appointments, and delight your customers 24/7 with intelligent AI chatbot"}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400">
              <Link
                href="/auth/signup"
                className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105"
              >
                {t.landing.tryFree || "Start Free Trial"}
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-300 transition-all shadow-lg hover:shadow-xl"
              >
                {t.landing.learnMore || "See Demo"}
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 animate-fade-in-up animation-delay-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Demo Preview */}
          <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up animation-delay-800">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
              {/* Dashboard Mockup */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6">
                {/* Dashboard Header */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">R</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Raven Dashboard</h3>
                        <p className="text-xs text-gray-500">Live Conversations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Online</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-primary-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-primary-600" />
                      <p className="text-xs text-gray-600 font-medium">Conversations</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">142</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% this week</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <p className="text-xs text-gray-600 font-medium">Avg Response</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1.2s</p>
                    <p className="text-xs text-green-600 mt-1">↓ 30% faster</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-gray-600 font-medium">Satisfaction</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-xs text-green-600 mt-1">↑ 5% improvement</p>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">S</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Sarah Johnson</p>
                        <p className="text-primary-100 text-xs">Active now</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-[280px]">
                    {/* AI Message */}
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">R</span>
                      </div>
                      <div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-md">
                          <p className="text-sm text-gray-800">
                            Hello! 👋 Welcome to Raven Support. How can I help you today?
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-2">10:23 AM</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 items-start justify-end">
                      <div>
                        <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl rounded-tr-sm px-4 py-3 shadow-md max-w-md">
                          <p className="text-sm text-white">
                            I'd like to book an appointment for next week
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 mr-2 text-right">10:24 AM</p>
                      </div>
                    </div>

                    {/* AI Response with Slots */}
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">R</span>
                      </div>
                      <div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-md">
                          <p className="text-sm text-gray-800 mb-3">
                            Perfect! I have several available time slots. Please choose one:
                          </p>
                          <div className="space-y-2">
                            <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-900 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-primary-200 text-left">
                              📅 Monday, Feb 19 at 10:00 AM
                            </button>
                            <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-900 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-primary-200 text-left">
                              📅 Tuesday, Feb 20 at 2:30 PM
                            </button>
                            <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-900 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-primary-200 text-left">
                              📅 Wednesday, Feb 21 at 11:00 AM
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-2">10:24 AM • Read ✓✓</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-3 bg-white">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                        disabled
                      />
                      <button className="text-primary-600 p-1.5 hover:bg-primary-50 rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stats badge */}
              <div className="absolute top-6 right-6 bg-white rounded-xl shadow-xl p-4 animate-float border-2 border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Response Rate</p>
                    <p className="text-xl font-bold text-gray-900">98.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.landing.whyChoose || "Everything you need to delight customers"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for African businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t.landing.feature1Title || "AI-Powered Conversations"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t.landing.feature1Desc || "Intelligent chatbot that understands French and English, answers questions, and engages customers naturally."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t.landing.feature3Title || "24/7 Availability"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t.landing.feature3Desc || "Never miss a customer inquiry. Your AI assistant works round the clock, even when you sleep."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t.landing.feature2Title || "Bilingual Support"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t.landing.feature2Desc || "Seamlessly communicate in both French and English to serve all your customers."}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Appointment Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Let customers book appointments directly through chat. AI handles scheduling, reminders, and confirmations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Analytics & Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track conversations, measure satisfaction, and understand your customers better with detailed analytics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Human Takeover
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly take over conversations when needed. Perfect balance between automation and personal touch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600">
                Click the chat button in the bottom-right to try our AI assistant
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Simple. Powerful. Effective.
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Add the widget to your website</h4>
                      <p className="text-gray-600">Just one line of code - works with any website</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Configure your AI assistant</h4>
                      <p className="text-gray-600">Add your business info, FAQs, and availability</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Start helping customers</h4>
                      <p className="text-gray-600">Watch as conversations and appointments roll in</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-bold text-sm">R</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800">Hello! How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                        <p className="text-sm text-white">I'd like to book an appointment</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-bold text-sm">R</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800">Great! I have these available times...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.landing.pricing || "Simple, Transparent Pricing"}
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl shadow-2xl border-2 border-primary-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-primary-100">Perfect for growing businesses</p>
              </div>
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900">10,000</span>
                    <div className="text-left">
                      <div className="text-xl font-semibold text-gray-900">CFA</div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                  <p className="text-gray-600">Billed monthly</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited conversations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">AI-powered responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Appointment booking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Human takeover</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Email & WhatsApp notifications</span>
                  </li>
                </ul>

                <Link
                  href="/auth/signup"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                >
                  {t.landing.startNow || "Start Free Trial"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
                <p className="text-gray-600 text-sm">Your data is encrypted and protected</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Top Rated</h4>
                <p className="text-gray-600 text-sm">4.9/5 stars from happy customers</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Fast Setup</h4>
                <p className="text-gray-600 text-sm">Get started in just 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Customer Support?
            </h2>
            <p className="text-xl text-primary-50 mb-10">
              Join hundreds of African businesses using Raven to delight their customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="bg-primary-700/50 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/20 hover:border-white/40 transition-all"
              >
                See Demo First
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <div className="font-bold text-white text-lg">Raven</div>
                <div className="text-xs text-gray-400">AI Customer Support</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            </div>

            <p className="text-sm text-gray-400">
              © 2024 Raven. {t.landing.footer || "All rights reserved."}
            </p>
          </div>
        </div>
      </footer>

      {/* Raven Chat Widget */}
      {widgetReady && (
        <Script
          src={`${API_URL}/static/raven-widget.js`}
          strategy="afterInteractive"
        />
      )}

      {/* Add animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
          animation-fill-mode: both;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
