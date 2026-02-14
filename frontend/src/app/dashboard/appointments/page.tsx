"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, appointmentsAPI, type Appointment, type AppointmentStatus } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { lang } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

        const appts = await appointmentsAPI.list(businessId, session.user.id);
        // Sort by created_at descending (newest first)
        const sortedAppts = appts.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAppointments(sortedAppts);
        setFilteredAppointments(sortedAppts);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(a => a.status === statusFilter));
    }
  }, [statusFilter, appointments]);

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const updated = await appointmentsAPI.update(id, { status }, session.user.id);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setShowStatusModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("Failed to update appointment");
    }
  };

  const deleteAppointment = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setDeletingId(id);
    try {
      await appointmentsAPI.delete(id, session.user.id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setShowDeleteModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      alert(lang === "fr" ? "Échec de la suppression" : "Failed to delete appointment");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    // Handle both HH:MM and HH:MM:SS formats
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "no_show": return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    if (lang === "fr") {
      switch (status) {
        case "pending": return "En attente";
        case "confirmed": return "Confirmé";
        case "cancelled": return "Annulé";
        case "completed": return "Terminé";
        case "no_show": return "Absent";
      }
    } else {
      switch (status) {
        case "pending": return "Pending";
        case "confirmed": return "Confirmed";
        case "cancelled": return "Cancelled";
        case "completed": return "Completed";
        case "no_show": return "No Show";
      }
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

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="back-btn">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {lang === "fr" ? "Rendez-vous" : "Appointments"} - {businessName}
            </h1>
          </div>
          {appointments.length > 0 && (
            <a
              href={`${API_URL}/api/export/${businessId}/appointments?format=csv`}
              download
              className="export-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {lang === "fr" ? "Exporter" : "Export"}
            </a>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "filter-btn-active" : "filter-btn-inactive"}
          >
            {lang === "fr" ? "Tous" : "All"} ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={statusFilter === "pending" ? "filter-btn-active" : "filter-btn-inactive"}
          >
            {getStatusLabel("pending")} ({appointments.filter(a => a.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={statusFilter === "confirmed" ? "filter-btn-active" : "filter-btn-inactive"}
          >
            {getStatusLabel("confirmed")} ({appointments.filter(a => a.status === "confirmed").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={statusFilter === "completed" ? "filter-btn-active" : "filter-btn-inactive"}
          >
            {getStatusLabel("completed")} ({appointments.filter(a => a.status === "completed").length})
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "all"
                ? (lang === "fr" ? "Aucun rendez-vous" : "No appointments")
                : `${lang === "fr" ? "Aucun rendez-vous" : "No"} ${getStatusLabel(statusFilter as AppointmentStatus).toLowerCase()} ${lang === "fr" ? "" : "appointments"}`}
            </h2>
            <p className="text-gray-600">
              {lang === "fr"
                ? "Les rendez-vous pris via le chatbot apparaîtront ici"
                : "Appointments made through the chatbot will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.customer_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(appointment.appointment_time)} ({appointment.duration_minutes} min)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{appointment.customer_email}</span>
                        </div>
                        {appointment.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{appointment.customer_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.service_type && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Service: </span>
                        <span className="text-sm font-medium text-gray-900">{appointment.service_type}</span>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowStatusModal(true);
                      }}
                      className="btn-secondary text-sm"
                    >
                      {lang === "fr" ? "Modifier" : "Edit"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDeleteModal(true);
                      }}
                      className="btn-danger text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {lang === "fr" ? "Modifier le statut" : "Update Status"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {lang === "fr" ? "Rendez-vous avec" : "Appointment with"} <strong>{selectedAppointment.customer_name}</strong>
            </p>

            <div className="space-y-2 mb-6">
              {(["pending", "confirmed", "completed", "cancelled", "no_show"] as AppointmentStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, status)}
                  className={
                    selectedAppointment.status === status
                      ? "status-option-selected"
                      : "status-option-unselected"
                  }
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedAppointment(null);
              }}
              className="w-full btn-secondary"
            >
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {lang === "fr" ? "Supprimer le rendez-vous" : "Delete Appointment"}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {lang === "fr"
                ? `Êtes-vous sûr de vouloir supprimer le rendez-vous de ${selectedAppointment.customer_name} ? Cette action est irréversible.`
                : `Are you sure you want to delete the appointment with ${selectedAppointment.customer_name}? This action cannot be undone.`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAppointment(null);
                }}
                className="flex-1 btn-secondary"
              >
                {lang === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={() => deleteAppointment(selectedAppointment.id)}
                disabled={deletingId === selectedAppointment.id}
                className="flex-1 btn-danger"
              >
                {deletingId === selectedAppointment.id
                  ? (lang === "fr" ? "Suppression..." : "Deleting...")
                  : (lang === "fr" ? "Supprimer" : "Delete")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
