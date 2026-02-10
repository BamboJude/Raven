/**
 * Chat functionality for the Raven widget.
 */

export interface MediaAttachment {
  type: string;
  url: string;
  filename?: string;
  content_type?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  media?: MediaAttachment[];
}

export interface SlotOption {
  id: number;
  date: string;
  time: string;
  display: string;
}

interface ChatResponse {
  conversation_id: string;
  message: string;
  created_at: string;
  is_human_takeover?: boolean;
  available_slots?: SlotOption[];
  should_close?: boolean;
}

export interface SendMessageResult {
  message: string;
  isHumanTakeover: boolean;
  availableSlots?: SlotOption[];
  shouldClose: boolean;
}

interface UploadResponse {
  filename: string;
  url: string;
  content_type: string;
  size: number;
}

interface WidgetSettings {
  primary_color: string;
  position: string;
  welcome_message_language: string;
}

interface LeadCaptureField {
  name: string;
  label_fr: string;
  label_en: string;
  required: boolean;
  enabled: boolean;
}

interface LeadCaptureConfig {
  enabled: boolean;
  fields: LeadCaptureField[];
}

interface BusinessInfo {
  business_id: string;
  name: string;
  welcome_message: string;
  welcome_message_en: string;
  language: string;
  widget_settings: WidgetSettings;
  is_online: boolean;
  away_message: string;
  away_message_en: string;
  lead_capture_config: LeadCaptureConfig | null;
}

export class RavenChat {
  private businessId: string;
  private apiUrl: string;
  private conversationId: string | null = null;
  private visitorId: string;
  private messages: Message[] = [];
  private visitorName: string | null = null;
  private visitorEmail: string | null = null;
  private visitorPhone: string | null = null;

  constructor(businessId: string, apiUrl: string) {
    this.businessId = businessId;
    this.apiUrl = apiUrl;
    this.visitorId = this.getOrCreateVisitorId();
  }

  /**
   * Get or create a unique visitor ID stored in localStorage.
   */
  private getOrCreateVisitorId(): string {
    const storageKey = `raven_visitor_${this.businessId}`;
    let visitorId = localStorage.getItem(storageKey);

    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, visitorId);
    }

    return visitorId;
  }

  /**
   * Get the saved conversation ID if it exists.
   */
  private getSavedConversationId(): string | null {
    const storageKey = `raven_convo_${this.businessId}_${this.visitorId}`;
    return localStorage.getItem(storageKey);
  }

  /**
   * Save the conversation ID for continuity.
   */
  private saveConversationId(conversationId: string): void {
    const storageKey = `raven_convo_${this.businessId}_${this.visitorId}`;
    localStorage.setItem(storageKey, conversationId);
  }

  /**
   * Fetch business info (name, welcome message).
   */
  async getBusinessInfo(): Promise<BusinessInfo> {
    const response = await fetch(
      `${this.apiUrl}/api/chat/business/${this.businessId}/public`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch business info");
    }

    return response.json();
  }

  /**
   * Upload an image and return the media attachment.
   */
  async uploadImage(file: File): Promise<MediaAttachment> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.apiUrl}/api/uploads/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data: UploadResponse = await response.json();

    return {
      type: "image",
      url: `${this.apiUrl}${data.url}`,
      filename: file.name,
      content_type: data.content_type,
    };
  }

  /**
   * Send a message and get a response.
   */
  async sendMessage(content: string, media?: MediaAttachment[]): Promise<SendMessageResult> {
    // Add user message to local messages
    this.messages.push({ role: "user", content, media });

    // Check for saved conversation
    if (!this.conversationId) {
      this.conversationId = this.getSavedConversationId();
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: this.businessId,
          visitor_id: this.visitorId,
          message: content,
          conversation_id: this.conversationId,
          media: media,
          ...(this.visitorName && !this.conversationId ? { visitor_name: this.visitorName } : {}),
          ...(this.visitorEmail && !this.conversationId ? { visitor_email: this.visitorEmail } : {}),
          ...(this.visitorPhone && !this.conversationId ? { visitor_phone: this.visitorPhone } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // Save conversation ID for future messages
      this.conversationId = data.conversation_id;
      this.saveConversationId(data.conversation_id);

      // Add assistant message to local messages
      this.messages.push({ role: "assistant", content: data.message });

      return {
        message: data.message,
        isHumanTakeover: data.is_human_takeover || false,
        availableSlots: data.available_slots,
        shouldClose: data.should_close || false,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timed out - please try again");
      }
      throw error;
    }
  }

  /**
   * Get all messages in the current conversation.
   */
  getMessages(): Message[] {
    return this.messages;
  }

  /**
   * Set visitor info from lead capture form.
   */
  setVisitorInfo(name: string | null, email: string | null, phone: string | null): void {
    this.visitorName = name;
    this.visitorEmail = email;
    this.visitorPhone = phone;
  }

  /**
   * Get the visitor email (for transcript pre-fill).
   */
  getVisitorEmail(): string | null {
    return this.visitorEmail;
  }

  /**
   * Get the current conversation ID.
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Rate a conversation.
   */
  async rateConversation(rating: string, comment?: string): Promise<void> {
    if (!this.conversationId) return;

    await fetch(`${this.apiUrl}/api/chat/conversation/${this.conversationId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
  }

  /**
   * Email transcript to the given address.
   */
  async emailTranscript(email: string): Promise<boolean> {
    if (!this.conversationId) return false;

    const response = await fetch(
      `${this.apiUrl}/api/chat/conversation/${this.conversationId}/transcript`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    return response.ok;
  }

  /**
   * Clear the conversation (start fresh).
   */
  clearConversation(): void {
    this.conversationId = null;
    this.messages = [];
    this.visitorName = null;
    this.visitorEmail = null;
    this.visitorPhone = null;
    const storageKey = `raven_convo_${this.businessId}_${this.visitorId}`;
    localStorage.removeItem(storageKey);
  }
}
