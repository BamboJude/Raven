"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";
import { ChatToggle } from "@/components/ChatToggle";

export default function WidgetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const widgetUrl = `${apiUrl}/static/raven-widget.js`;

  const embedCode = `<!-- Raven Chat Widget -->
<script>
  window.RAVEN_CONFIG = {
    businessId: "${businessId}",
    apiUrl: "${apiUrl}"
  };
</script>
<script src="${widgetUrl}"></script>`;

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
      } catch (err) {
        console.error("Failed to load business:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex items-center gap-4">
            {businessId && <ChatToggle businessId={businessId} apiUrl={apiUrl} />}
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {t.widgetPage.title} - {businessName}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.widgetPage.howToIntegrate}</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>{t.widgetPage.step1}</li>
              <li>{t.widgetPage.step2}</li>
              <li>{t.widgetPage.step3}</li>
              <li>{t.widgetPage.step4}</li>
            </ol>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{t.widgetPage.embedCode}</h2>
              <button
                onClick={copyToClipboard}
                className={`btn ${copied ? "btn-secondary" : "btn-primary"}`}
              >
                {copied ? t.widgetPage.copied : t.widgetPage.copy}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.widgetPage.testWidget}</h2>
            <p className="text-gray-600 mb-4">{t.widgetPage.testDesc}</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
              <li>
                Start backend:{" "}
                <code className="bg-gray-100 px-1 rounded">cd backend && uvicorn app.main:app --reload</code>
              </li>
              <li>
                Start widget:{" "}
                <code className="bg-gray-100 px-1 rounded">cd widget && npm run dev</code>
              </li>
              <li>
                Open{" "}
                <code className="bg-gray-100 px-1 rounded">widget/test.html</code>{" "}
                in your browser
              </li>
            </ol>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 text-sm">
                <strong>Note:</strong> {t.widgetPage.productionNote}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.widgetPage.preview}</h2>
            <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>{t.widgetPage.previewDesc}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Integration</h2>
                <p className="text-gray-600 mb-4">
                  Your chatbot also works on WhatsApp! Customers can message your business directly.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">WhatsApp Sandbox Number (for testing):</p>
                  <p className="text-lg font-mono font-semibold text-green-700">+1 415 523 8886</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: This is a test number. For production, you&apos;ll need your own WhatsApp Business number.
                  </p>
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Share with your customers:</p>
                  <a
                    href="https://wa.me/14155238886"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
