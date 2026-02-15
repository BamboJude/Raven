/**
 * API client for communicating with the Raven backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface Business {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: "fr" | "en";
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  name: string;
  description: string;
  price?: string;
}

export interface WidgetSettings {
  primary_color: string;
  position: "bottom-right" | "bottom-left";
  welcome_message_language: "auto" | "fr" | "en";
}

export interface LeadCaptureField {
  name: string;
  label_fr: string;
  label_en: string;
  required: boolean;
  enabled: boolean;
}

export interface LeadCaptureConfig {
  enabled: boolean;
  fields: LeadCaptureField[];
}

export interface BusinessConfig {
  welcome_message: string;
  welcome_message_en?: string;
  faqs: FAQ[];
  products: Product[];
  custom_instructions?: string;
  widget_settings?: WidgetSettings;
  lead_capture_config?: LeadCaptureConfig;
  manual_away?: boolean;
  away_message?: string;
  away_message_en?: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  visitor_id: string;
  channel: "widget" | "whatsapp";
  started_at: string;
  last_message_at: string;
  message_count?: number;
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  rating?: "positive" | "negative";
  rating_comment?: string;
  rated_at?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// API helper with auth
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Business API
export const businessAPI = {
  create: (data: { name: string; description: string; language: string }, token: string) =>
    fetchAPI("/api/businesses", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  list: (token: string): Promise<Business[]> =>
    fetchAPI("/api/businesses", {}, token),

  get: (id: string, token: string): Promise<Business & { config?: BusinessConfig }> =>
    fetchAPI(`/api/businesses/${id}`, {}, token),

  update: (id: string, data: Partial<Business>, token: string) =>
    fetchAPI(`/api/businesses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  updateConfig: (id: string, config: Partial<BusinessConfig>, token: string) =>
    fetchAPI(`/api/businesses/${id}/config`, {
      method: "PUT",
      body: JSON.stringify(config),
    }, token),

  delete: (id: string, token: string) =>
    fetchAPI(`/api/businesses/${id}`, {
      method: "DELETE",
    }, token),

  getConversations: (id: string, token: string): Promise<Conversation[]> =>
    fetchAPI(`/api/businesses/${id}/conversations`, {}, token),

  toggleAway: (id: string, manual_away: boolean, token: string) =>
    fetchAPI(`/api/businesses/${id}/config`, {
      method: "PUT",
      body: JSON.stringify({ manual_away }),
    }, token),
};

// Chat API (no auth required - used by widget)
export const chatAPI = {
  getBusinessInfo: (businessId: string) =>
    fetchAPI(`/api/chat/business/${businessId}/public`),

  sendMessage: (data: {
    business_id: string;
    visitor_id: string;
    message: string;
    conversation_id?: string;
  }) =>
    fetchAPI("/api/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getConversation: (conversationId: string) =>
    fetchAPI(`/api/chat/conversation/${conversationId}`),
};

// Team Member types
export interface TeamMember {
  id: string;
  business_id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "active";
  user_id?: string | null;
  full_name?: string | null;
  phone?: string | null;
  job_title?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberAccount {
  email: string;
  full_name: string;
  phone?: string;
  job_title?: string;
  role: "admin" | "member";
}

export interface TeamMemberCredentials {
  email: string;
  password: string;
  member: TeamMember;
  message: string;
}

// Team API
export const teamAPI = {
  list: (businessId: string, token: string): Promise<{ members: TeamMember[] }> =>
    fetchAPI(`/api/team/${businessId}/members`, {}, token),

  invite: (businessId: string, data: { email: string; role: string }, token: string) =>
    fetchAPI(`/api/team/${businessId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  createAccount: (
    businessId: string,
    data: CreateTeamMemberAccount,
    token: string
  ): Promise<TeamMemberCredentials> =>
    fetchAPI(`/api/team/${businessId}/members/create-account`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (
    businessId: string,
    memberId: string,
    data: {
      role?: string;
      avatar_url?: string;
      full_name?: string;
      phone?: string;
      job_title?: string;
    },
    token: string
  ) =>
    fetchAPI(`/api/team/${businessId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  remove: (businessId: string, memberId: string, token: string) =>
    fetchAPI(`/api/team/${businessId}/members/${memberId}`, {
      method: "DELETE",
    }, token),
};

// Dashboard API types
export interface DashboardStats {
  conversations_today: number;
  active_conversations: number;
  appointments_today: number;
  satisfaction_rate: number | null;
  total_conversations: number;
}

export interface ActivityItem {
  type: "conversation" | "appointment" | "rating";
  message: string;
  timestamp: string;
  channel?: string;
  rating?: string;
}

export interface ChartDataPoint {
  date: string;
  count: number;
  label: string;
}

export interface UpcomingAppointment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  service_type: string | null;
  status: string;
}

// Dashboard API
export const dashboardAPI = {
  getStats: (businessId: string, token: string): Promise<DashboardStats> =>
    fetchAPI(`/api/dashboard/businesses/${businessId}/dashboard/stats`, {}, token),

  getActivity: (businessId: string, token: string, limit = 10): Promise<ActivityItem[]> =>
    fetchAPI(`/api/dashboard/businesses/${businessId}/dashboard/activity?limit=${limit}`, {}, token),

  getChartData: (businessId: string, token: string, days = 7): Promise<ChartDataPoint[]> =>
    fetchAPI(`/api/dashboard/businesses/${businessId}/dashboard/chart-data?days=${days}`, {}, token),

  getUpcomingAppointments: (businessId: string, token: string, days = 3): Promise<UpcomingAppointment[]> =>
    fetchAPI(`/api/dashboard/businesses/${businessId}/dashboard/upcoming-appointments?days=${days}`, {}, token),

  // Analytics API
  getAnalytics: (businessId: string, days: number = 30) =>
    fetchAPI(`/api/analytics/${businessId}?days=${days}`),
};

// Appointment types
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

export interface Appointment {
  id: string;
  business_id: string;
  conversation_id?: string;
  customer_name: string;
  customer_email: string; // Required after migration 007
  customer_phone?: string; // Optional after migration 007
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  service_type?: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface BusinessAvailability {
  id: string;
  business_id: string;
  weekly_schedule: WeeklySchedule;
  default_duration_minutes: number;
  buffer_minutes: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  duration_minutes: number;
}

// Appointments API
export const appointmentsAPI = {
  // Create appointment (public - no auth required)
  create: (data: {
    business_id: string;
    customer_name: string;
    customer_email: string; // Required after migration 007
    customer_phone?: string; // Optional after migration 007
    appointment_date: string;
    appointment_time: string;
    duration_minutes?: number;
    service_type?: string;
    notes?: string;
    conversation_id?: string;
  }): Promise<Appointment> =>
    fetchAPI("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // List appointments (requires auth)
  list: (
    businessId: string,
    token: string,
    filters?: {
      status?: AppointmentStatus;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Appointment[]> => {
    const params = new URLSearchParams({ business_id: businessId });
    if (filters?.status) params.append("status", filters.status);
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    return fetchAPI(`/api/appointments?${params}`, {}, token);
  },

  // Get single appointment (requires auth)
  get: (id: string, token: string): Promise<Appointment> =>
    fetchAPI(`/api/appointments/${id}`, {}, token),

  // Update appointment (requires auth)
  update: (
    id: string,
    data: {
      status?: AppointmentStatus;
      appointment_date?: string;
      appointment_time?: string;
      notes?: string;
    },
    token: string
  ): Promise<Appointment> =>
    fetchAPI(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  // Delete appointment (requires auth)
  delete: (id: string, token: string) =>
    fetchAPI(`/api/appointments/${id}`, {
      method: "DELETE",
    }, token),

  // Get business availability (public)
  getAvailability: (businessId: string): Promise<BusinessAvailability> =>
    fetchAPI(`/api/appointments/availability/${businessId}`),

  // Update business availability (requires auth)
  updateAvailability: (
    businessId: string,
    data: {
      weekly_schedule?: WeeklySchedule;
      default_duration_minutes?: number;
      buffer_minutes?: number;
      timezone?: string;
    },
    token: string
  ): Promise<BusinessAvailability> =>
    fetchAPI(`/api/appointments/availability/${businessId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  // Get available slots (public)
  getAvailableSlots: (
    businessId: string,
    startDate: string,
    days: number = 7
  ): Promise<AvailableSlot[]> =>
    fetchAPI(
      `/api/appointments/availability/${businessId}/slots?start_date=${startDate}&days=${days}`
    ),

  // Get customer appointments by phone (public)
  getByPhone: (businessId: string, phone: string): Promise<Appointment[]> =>
    fetchAPI(`/api/appointments/customer/${businessId}/phone/${phone}`),
};

// Notification types
export interface NotificationSettings {
  id?: string;
  business_id: string;
  user_id?: string;
  email_enabled: boolean;
  email_from_name?: string;
  email_from_address?: string;
  sms_enabled: boolean;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  send_confirmation: boolean;
  send_reminder_24h: boolean;
  send_reminder_1h: boolean;
  send_cancellation: boolean;
  send_update: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationLog {
  id: string;
  appointment_id: string;
  business_id: string;
  type: "confirmation" | "reminder_24h" | "reminder_1h" | "cancellation" | "update";
  channel: "email" | "sms";
  recipient: string;
  status: "pending" | "sent" | "failed";
  error_message?: string;
  provider_id?: string;
  sent_at?: string;
  created_at: string;
}

// Notifications API
export const notificationsAPI = {
  // Get notification settings (requires auth)
  getSettings: (businessId: string, token: string): Promise<NotificationSettings> =>
    fetchAPI(`/api/notifications/${businessId}`, {}, token),

  // Update notification settings (requires auth)
  updateSettings: (
    businessId: string,
    data: Partial<NotificationSettings>,
    token: string
  ): Promise<NotificationSettings> =>
    fetchAPI(`/api/notifications/${businessId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  // Get notification logs (requires auth)
  getLogs: (
    businessId: string,
    token: string,
    appointmentId?: string
  ): Promise<{ logs: NotificationLog[]; count: number }> => {
    const params = appointmentId ? `?appointment_id=${appointmentId}` : "";
    return fetchAPI(`/api/notifications/${businessId}/logs${params}`, {}, token);
  },
};

// Live Conversation types
export interface LiveConversation extends Conversation {
  is_human_takeover?: boolean;
  taken_over_by?: string;
  taken_over_at?: string;
  team_member?: {
    email: string;
    avatar_url?: string;
  };
  last_message?: string;
  last_message_role?: string;
  message_count?: number;
  messages?: Message[];
}

// Live Conversations API (for agent takeover)
export const liveAPI = {
  // Get active conversations (last 24 hours)
  getConversations: (businessId: string, token: string): Promise<LiveConversation[]> =>
    fetchAPI(`/api/live/${businessId}/conversations?user_id=${token}`, {}),

  // Get single conversation with messages
  getConversation: (businessId: string, conversationId: string, token: string): Promise<LiveConversation> =>
    fetchAPI(`/api/live/${businessId}/conversation/${conversationId}?user_id=${token}`, {}),

  // Take over a conversation
  takeover: (businessId: string, conversationId: string, token: string): Promise<{ success: boolean; conversation: LiveConversation }> =>
    fetchAPI(`/api/live/${businessId}/conversation/${conversationId}/takeover`, {
      method: "POST",
      body: JSON.stringify({ user_id: token }),
    }),

  // Release conversation back to AI
  release: (businessId: string, conversationId: string, token: string): Promise<{ success: boolean; conversation: LiveConversation }> =>
    fetchAPI(`/api/live/${businessId}/conversation/${conversationId}/release`, {
      method: "POST",
      body: JSON.stringify({ user_id: token }),
    }),

  // Send message as agent
  sendMessage: (businessId: string, conversationId: string, content: string, token: string): Promise<{ success: boolean; message: Message }> =>
    fetchAPI(`/api/live/${businessId}/conversation/${conversationId}/message`, {
      method: "POST",
      body: JSON.stringify({ user_id: token, content }),
    }),
};
