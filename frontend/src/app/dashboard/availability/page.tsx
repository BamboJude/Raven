"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, appointmentsAPI, type WeeklySchedule, type DaySchedule, type TimeSlot } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export default function AvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { lang } = useLanguage();

  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });
  const [duration, setDuration] = useState(60);
  const [buffer, setBuffer] = useState(15);

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

        // Try to load existing availability
        try {
          const availability = await appointmentsAPI.getAvailability(businessId);
          setSchedule(availability.weekly_schedule as WeeklySchedule);
          setDuration(availability.default_duration_minutes);
          setBuffer(availability.buffer_minutes);
        } catch (err) {
          // No availability set yet, use defaults
          console.log("No availability set, using defaults");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const toggleDay = (day: keyof WeeklySchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0
          ? [{ start: "09:00", end: "17:00" }]
          : prev[day].slots,
      },
    }));
  };

  const updateSlot = (day: keyof WeeklySchedule, index: number, field: "start" | "end", value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const addSlot = (day: keyof WeeklySchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeSlot = (day: keyof WeeklySchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !businessId) return;

    setSaving(true);
    try {
      await appointmentsAPI.updateAvailability(
        businessId,
        {
          weekly_schedule: schedule,
          default_duration_minutes: duration,
          buffer_minutes: buffer,
        },
        session.user.id
      );
      alert(lang === "fr" ? "Disponibilités enregistrées !" : "Availability saved!");
    } catch (err) {
      console.error("Failed to save availability:", err);
      alert(lang === "fr" ? "Erreur lors de l'enregistrement" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getDayLabel = (day: string) => {
    if (lang === "fr") {
      const frDays: Record<string, string> = {
        monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
        thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche"
      };
      return frDays[day];
    } else {
      return day.charAt(0).toUpperCase() + day.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="back-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {lang === "fr" ? "Disponibilités" : "Availability"} - {businessName}
          </h1>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {lang === "fr" ? "Paramètres généraux" : "General Settings"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === "fr" ? "Durée par défaut (minutes)" : "Default Duration (minutes)"}
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                min="15"
                max="480"
                step="15"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === "fr" ? "Temps tampon (minutes)" : "Buffer Time (minutes)"}
              </label>
              <input
                type="number"
                value={buffer}
                onChange={(e) => setBuffer(parseInt(e.target.value) || 15)}
                min="0"
                max="120"
                step="5"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                {lang === "fr"
                  ? "Temps entre chaque rendez-vous"
                  : "Time between appointments"}
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {lang === "fr" ? "Horaires de la semaine" : "Weekly Schedule"}
          </h2>

          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className={schedule[day].enabled ? "schedule-day" : "schedule-day-disabled"}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule[day].enabled}
                      onChange={() => toggleDay(day)}
                    />
                    <span className="font-medium text-gray-900">{getDayLabel(day)}</span>
                  </label>
                  {schedule[day].enabled && (
                    <button
                      onClick={() => addSlot(day)}
                      className="add-slot-btn"
                    >
                      + {lang === "fr" ? "Ajouter plage" : "Add slot"}
                    </button>
                  )}
                </div>

                {schedule[day].enabled && (
                  <div className="space-y-2 ml-6">
                    {schedule[day].slots.map((slot, index) => (
                      <div key={index} className="time-slot">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlot(day, index, "start", e.target.value)}
                          className="text-sm flex-1"
                        />
                        <span className="text-gray-500 font-medium">→</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlot(day, index, "end", e.target.value)}
                          className="text-sm flex-1"
                        />
                        {schedule[day].slots.length > 1 && (
                          <button
                            onClick={() => removeSlot(day, index)}
                            className="icon-btn-danger"
                            title={lang === "fr" ? "Supprimer" : "Remove"}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving
              ? (lang === "fr" ? "Enregistrement..." : "Saving...")
              : (lang === "fr" ? "Enregistrer" : "Save")}
          </button>
          <Link href="/dashboard" className="btn-secondary">
            {lang === "fr" ? "Annuler" : "Cancel"}
          </Link>
        </div>
      </main>
    </div>
  );
}
