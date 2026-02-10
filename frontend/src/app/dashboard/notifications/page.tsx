"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, notificationsAPI, type NotificationSettings } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { lang } = useLanguage();

  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
    email_enabled: true,
    email_from_name: "",
    email_from_address: "",
    sms_enabled: false,
    twilio_account_sid: "",
    twilio_auth_token: "",
    twilio_phone_number: "",
    send_confirmation: true,
    send_reminder_24h: true,
    send_reminder_1h: false,
    send_cancellation: true,
    send_update: true,
  });

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

        // Load notification settings
        try {
          const notifSettings = await notificationsAPI.getSettings(businessId, session.user.id);
          setSettings(notifSettings);
        } catch (err) {
          // No settings yet, use defaults
          console.log("No notification settings, using defaults");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !businessId) return;

    setSaving(true);
    setSaved(false);

    try {
      await notificationsAPI.updateSettings(businessId, settings, session.user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert(lang === "fr" ? "Erreur lors de l'enregistrement" : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-zinc-600">
            {lang === "fr" ? "Chargement..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/dashboard" className="hover:text-sky-500">
            {lang === "fr" ? "Tableau de bord" : "Dashboard"}
          </Link>
          <span>/</span>
          <span>{businessName}</span>
          <span>/</span>
          <span className="text-zinc-900 font-medium">
            {lang === "fr" ? "Notifications" : "Notifications"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">
          {lang === "fr" ? "Paramètres de notification" : "Notification Settings"}
        </h1>
        <p className="text-zinc-600 mt-2">
          {lang === "fr"
            ? "Configurez les notifications par email et SMS pour vos rendez-vous"
            : "Configure email and SMS notifications for your appointments"}
        </p>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              <span>📧</span>
              {lang === "fr" ? "Notifications par email" : "Email Notifications"}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              {lang === "fr"
                ? "Envoyez des emails de confirmation et rappels via Resend"
                : "Send confirmation and reminder emails via Resend"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_enabled}
              onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </div>

        {settings.email_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                {lang === "fr" ? "Nom de l'expéditeur" : "From Name"}
              </label>
              <input
                type="text"
                value={settings.email_from_name || ""}
                onChange={(e) => setSettings({ ...settings, email_from_name: e.target.value })}
                placeholder={businessName}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                {lang === "fr"
                  ? "Laissez vide pour utiliser le nom de votre entreprise"
                  : "Leave empty to use your business name"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                {lang === "fr" ? "Email de l'expéditeur" : "From Email"}
              </label>
              <input
                type="email"
                value={settings.email_from_address || ""}
                onChange={(e) => setSettings({ ...settings, email_from_address: e.target.value })}
                placeholder="appointments@raven.app"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                {lang === "fr"
                  ? "Laissez vide pour utiliser appointments@raven.app"
                  : "Leave empty to use appointments@raven.app"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SMS Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              <span>📱</span>
              {lang === "fr" ? "Notifications par SMS" : "SMS Notifications"}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              {lang === "fr"
                ? "Envoyez des SMS via Twilio (nécessite un compte Twilio)"
                : "Send SMS via Twilio (requires Twilio account)"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sms_enabled}
              onChange={(e) => setSettings({ ...settings, sms_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </div>

        {settings.sms_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Twilio Account SID
              </label>
              <input
                type="text"
                value={settings.twilio_account_sid || ""}
                onChange={(e) => setSettings({ ...settings, twilio_account_sid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Twilio Auth Token
              </label>
              <input
                type="password"
                value={settings.twilio_auth_token || ""}
                onChange={(e) => setSettings({ ...settings, twilio_auth_token: e.target.value })}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                {lang === "fr" ? "Numéro Twilio" : "Twilio Phone Number"}
              </label>
              <input
                type="tel"
                value={settings.twilio_phone_number || ""}
                onChange={(e) => setSettings({ ...settings, twilio_phone_number: e.target.value })}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <p className="text-amber-800">
                {lang === "fr"
                  ? "⚠️ Les SMS Twilio sont facturés séparément. Consultez les tarifs Twilio."
                  : "⚠️ Twilio SMS are billed separately. Check Twilio pricing."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          {lang === "fr" ? "Types de notifications" : "Notification Types"}
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          {lang === "fr"
            ? "Choisissez quelles notifications envoyer automatiquement"
            : "Choose which notifications to send automatically"}
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer">
            <div>
              <div className="font-medium text-zinc-900">
                {lang === "fr" ? "Confirmation de rendez-vous" : "Appointment Confirmation"}
              </div>
              <div className="text-sm text-zinc-600">
                {lang === "fr"
                  ? "Envoyé immédiatement après la réservation"
                  : "Sent immediately after booking"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.send_confirmation}
              onChange={(e) => setSettings({ ...settings, send_confirmation: e.target.checked })}
              className="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer">
            <div>
              <div className="font-medium text-zinc-900">
                {lang === "fr" ? "Rappel 24h avant" : "24h Reminder"}
              </div>
              <div className="text-sm text-zinc-600">
                {lang === "fr"
                  ? "Rappel envoyé la veille du rendez-vous"
                  : "Reminder sent the day before"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.send_reminder_24h}
              onChange={(e) => setSettings({ ...settings, send_reminder_24h: e.target.checked })}
              className="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer">
            <div>
              <div className="font-medium text-zinc-900">
                {lang === "fr" ? "Rappel 1h avant" : "1h Reminder"}
              </div>
              <div className="text-sm text-zinc-600">
                {lang === "fr"
                  ? "Rappel envoyé une heure avant"
                  : "Reminder sent one hour before"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.send_reminder_1h}
              onChange={(e) => setSettings({ ...settings, send_reminder_1h: e.target.checked })}
              className="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer">
            <div>
              <div className="font-medium text-zinc-900">
                {lang === "fr" ? "Annulation" : "Cancellation"}
              </div>
              <div className="text-sm text-zinc-600">
                {lang === "fr"
                  ? "Envoyé quand un rendez-vous est annulé"
                  : "Sent when appointment is cancelled"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.send_cancellation}
              onChange={(e) => setSettings({ ...settings, send_cancellation: e.target.checked })}
              className="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? lang === "fr"
              ? "Enregistrement..."
              : "Saving..."
            : saved
            ? "✓ " + (lang === "fr" ? "Enregistré" : "Saved")
            : lang === "fr"
            ? "Enregistrer les paramètres"
            : "Save Settings"}
        </button>

        <Link
          href={`/dashboard?id=${businessId}`}
          className="px-6 py-3 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors font-medium text-zinc-700"
        >
          {lang === "fr" ? "Retour" : "Back"}
        </Link>
      </div>
    </div>
  );
}
