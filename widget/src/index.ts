/**
 * Raven Chat Widget
 *
 * An embeddable chat widget for businesses.
 * Usage: Add this script to any website with RAVEN_CONFIG set.
 */

import { styles } from "./styles";
import { RavenChat, MediaAttachment, SlotOption } from "./chat";

// Icons as SVG strings
const CHAT_ICON = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;
const CLOSE_ICON = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
const SEND_ICON = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const PLUS_ICON = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
const REMOVE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

// New chat icon
const NEW_CHAT_ICON = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;

// Human agent icon
const AGENT_ICON = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

// Translations
const translations = {
  fr: {
    placeholder: "Ecrivez votre message...",
    send: "Envoyer",
    close: "Fermer",
    open: "Ouvrir le chat",
    poweredBy: "Propulsé par",
    error: "Désolé, je rencontre un problème technique. Veuillez réessayer.",
    newChat: "Nouvelle conversation",
    longConversation: "La conversation devient longue. Cliquez sur + pour démarrer une nouvelle conversation.",
    humanAgent: "Conseiller en ligne",
    aiAssistant: "Assistant IA",
    offline: "Hors ligne",
    startChat: "Démarrer le chat",
    rateTitle: "Comment était votre expérience?",
    rateComment: "Un commentaire? (optionnel)",
    rateSubmit: "Envoyer",
    rateSkip: "Passer",
    rateThanks: "Merci pour votre retour!",
    transcriptTitle: "Recevoir la transcription par email",
    transcriptSend: "Envoyer",
    transcriptSent: "Email envoyé!",
    transcriptError: "Erreur d'envoi",
  },
  en: {
    placeholder: "Type your message...",
    send: "Send",
    close: "Close",
    open: "Open chat",
    poweredBy: "Powered by",
    error: "Sorry, I'm having a technical issue. Please try again.",
    newChat: "New conversation",
    longConversation: "Conversation is getting long. Click + to start a fresh chat.",
    humanAgent: "Live Agent",
    aiAssistant: "AI Assistant",
    offline: "Offline",
    startChat: "Start Chat",
    rateTitle: "How was your experience?",
    rateComment: "Any comments? (optional)",
    rateSubmit: "Submit",
    rateSkip: "Skip",
    rateThanks: "Thanks for your feedback!",
    transcriptTitle: "Get transcript via email",
    transcriptSend: "Send",
    transcriptSent: "Email sent!",
    transcriptError: "Send failed",
  },
};

interface RavenConfig {
  businessId: string;
  apiUrl: string;
}

interface WidgetSettings {
  primary_color: string;
  position: string;
  welcome_message_language: string;
}

class RavenWidget {
  private chat: RavenChat;
  private container: HTMLDivElement | null = null;
  private messagesContainer: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private fileInput: HTMLInputElement | null = null;
  private imagePreview: HTMLDivElement | null = null;
  private isOpen = false;
  private businessName = "Chat";
  private welcomeMessage = "Bonjour! Comment puis-je vous aider?";
  private welcomeMessageEn = "Hello! How can I help you?";
  private language: "fr" | "en" = "fr";
  private pendingImage: { file: File; previewUrl: string } | null = null;
  private widgetSettings: WidgetSettings = {
    primary_color: "#0ea5e9",
    position: "bottom-right",
    welcome_message_language: "auto",
  };
  private quickActionsShown = false;
  private messageCount = 0;
  private longConversationWarningShown = false;
  private readonly MAX_MESSAGES_BEFORE_WARNING = 15;
  private isBusinessOnline = true;
  private awayMessage = "";
  private awayMessageEn = "";
  private leadCaptureConfig: { enabled: boolean; fields: Array<{ name: string; label_fr: string; label_en: string; required: boolean; enabled: boolean }> } | null = null;
  private leadCaptureCompleted = false;

  constructor(config: RavenConfig) {
    this.chat = new RavenChat(config.businessId, config.apiUrl);
  }

  /**
   * Get current translations based on language.
   */
  private get t() {
    return translations[this.language];
  }

  /**
   * Detect user's preferred language from browser.
   */
  private detectLanguage(): "fr" | "en" {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("fr")) return "fr";
    return "en";
  }

  /**
   * Darken a hex color by a percentage.
   */
  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  /**
   * Initialize the widget.
   */
  async init(): Promise<void> {
    // Inject styles
    this.injectStyles();

    // Fetch business info
    try {
      const info = await this.chat.getBusinessInfo();
      this.businessName = info.name;
      this.welcomeMessage = info.welcome_message;
      this.welcomeMessageEn = info.welcome_message_en || info.welcome_message;
      this.widgetSettings = info.widget_settings || this.widgetSettings;
      this.isBusinessOnline = info.is_online !== false;
      this.awayMessage = info.away_message || "";
      this.awayMessageEn = info.away_message_en || "";
      this.leadCaptureConfig = info.lead_capture_config || null;

      // Determine language
      if (this.widgetSettings.welcome_message_language === "auto") {
        this.language = this.detectLanguage();
      } else if (this.widgetSettings.welcome_message_language === "en") {
        this.language = "en";
      } else {
        this.language = "fr";
      }
    } catch (error) {
      console.error("Raven: Failed to load business info", error);
    }

    // Create widget DOM
    this.createWidget();

    // Apply custom settings
    this.applySettings();

    // Show away banner if offline
    if (!this.isBusinessOnline) {
      this.showAwayBanner();
    }

    // Add welcome message
    const welcomeMsg = this.language === "en" ? this.welcomeMessageEn : this.welcomeMessage;
    this.addMessage("assistant", welcomeMsg);

    // Show quick action buttons
    this.showQuickActions();
  }

  /**
   * Apply widget settings (colors, position).
   */
  private applySettings(): void {
    if (!this.container) return;

    // Apply primary color
    const primaryColor = this.widgetSettings.primary_color || "#0ea5e9";
    const primaryDark = this.darkenColor(primaryColor, 15);
    this.container.style.setProperty("--raven-primary", primaryColor);
    this.container.style.setProperty("--raven-primary-dark", primaryDark);

    // Apply position
    if (this.widgetSettings.position === "bottom-left") {
      this.container.classList.add("position-left");
    }
  }

  /**
   * Inject widget styles into the page.
   */
  private injectStyles(): void {
    const styleElement = document.createElement("style");
    styleElement.id = "raven-widget-styles";
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * Create the widget DOM structure.
   */
  private createWidget(): void {
    // Main container
    this.container = document.createElement("div");
    this.container.id = "raven-widget-container";

    // Chat window
    const chatWindow = document.createElement("div");
    chatWindow.id = "raven-chat-window";

    // Header
    const header = document.createElement("div");
    header.id = "raven-chat-header";
    header.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <div id="raven-agent-status">
          <span id="raven-status-dot" style="background: ${this.isBusinessOnline ? '#34C759' : '#8E8E93'};"></span>
          <span id="raven-status-text">${this.isBusinessOnline ? this.t.aiAssistant : this.t.offline}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button id="raven-new-chat-button" aria-label="${this.t.newChat}" title="${this.t.newChat}">${NEW_CHAT_ICON}</button>
        <button id="raven-close-button" aria-label="${this.t.close}">${CLOSE_ICON}</button>
      </div>
    `;

    // Messages container
    this.messagesContainer = document.createElement("div");
    this.messagesContainer.id = "raven-messages";

    // Image preview area
    this.imagePreview = document.createElement("div");
    this.imagePreview.id = "raven-image-preview";

    // Input container
    const inputContainer = document.createElement("div");
    inputContainer.id = "raven-input-container";
    inputContainer.innerHTML = `
      <input type="file" id="raven-file-input" accept="image/*" />
      <div id="raven-input-wrapper">
        <button id="raven-attachment-button" aria-label="Add attachment" title="Add file or screenshot">${PLUS_ICON}</button>
        <textarea id="raven-input" placeholder="${this.t.placeholder}" rows="1"></textarea>
        <button id="raven-emoji-button" aria-label="Add emoji" title="Add emoji">😊</button>
      </div>
      <button id="raven-send-button" aria-label="${this.t.send}">${SEND_ICON}</button>
    `;

    // Powered by
    const poweredBy = document.createElement("div");
    poweredBy.id = "raven-powered-by";
    poweredBy.innerHTML = `${this.t.poweredBy} <a href="https://raven-bjxkx3nc2-bambo-judes-projects.vercel.app" target="_blank">Raven</a>`;

    // Assemble chat window
    chatWindow.appendChild(header);
    chatWindow.appendChild(this.messagesContainer);
    chatWindow.appendChild(this.imagePreview);
    chatWindow.appendChild(inputContainer);
    chatWindow.appendChild(poweredBy);

    // Chat button
    const chatButton = document.createElement("button");
    chatButton.id = "raven-chat-button";
    chatButton.innerHTML = CHAT_ICON;
    chatButton.setAttribute("aria-label", this.t.open);

    // Add to container
    this.container.appendChild(chatWindow);
    this.container.appendChild(chatButton);

    // Add to page
    document.body.appendChild(this.container);

    // Get input references
    this.input = document.getElementById("raven-input") as HTMLInputElement;
    this.fileInput = document.getElementById("raven-file-input") as HTMLInputElement;

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Add event listeners.
   */
  private addEventListeners(): void {
    // Toggle chat
    const chatButton = document.getElementById("raven-chat-button");
    chatButton?.addEventListener("click", () => this.toggle());

    // Close button
    const closeButton = document.getElementById("raven-close-button");
    closeButton?.addEventListener("click", () => this.close());

    // New chat button
    const newChatButton = document.getElementById("raven-new-chat-button");
    newChatButton?.addEventListener("click", () => this.startNewChat());

    // Send button
    const sendButton = document.getElementById("raven-send-button");
    sendButton?.addEventListener("click", () => this.sendMessage());

    // Enter key in input (Shift+Enter for newline, Enter to send)
    this.input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea as user types
    this.input?.addEventListener("input", () => this.autoResizeInput());

    // Attachment button (file/image)
    const attachmentButton = document.getElementById("raven-attachment-button");
    attachmentButton?.addEventListener("click", () => this.fileInput?.click());

    // Emoji button
    const emojiButton = document.getElementById("raven-emoji-button");
    emojiButton?.addEventListener("click", () => this.showEmojiPicker());

    // File input change
    this.fileInput?.addEventListener("change", (e) => this.handleFileSelect(e));
  }

  /**
   * Show emoji picker.
   */
  private showEmojiPicker(): void {
    // Common emojis
    const emojis = [
      '😊', '😂', '❤️', '👍', '🙏', '😍', '🎉', '🔥',
      '✨', '💯', '👏', '🤔', '😅', '😎', '🥰', '💪',
      '🙌', '✅', '📅', '📞', '✉️', '💼', '🏠', '🚀'
    ];

    // Check if picker already exists
    const existingPicker = document.getElementById('raven-emoji-picker');
    if (existingPicker) {
      existingPicker.remove();
      return;
    }

    // Create picker
    const picker = document.createElement('div');
    picker.id = 'raven-emoji-picker';
    picker.className = 'raven-emoji-picker';

    emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.textContent = emoji;
      btn.className = 'raven-emoji-btn';
      btn.onclick = () => {
        if (this.input) {
          const start = this.input.selectionStart || 0;
          const end = this.input.selectionEnd || 0;
          const text = this.input.value;
          this.input.value = text.substring(0, start) + emoji + text.substring(end);
          this.input.focus();
          this.input.selectionStart = this.input.selectionEnd = start + emoji.length;
        }
        picker.remove();
      };
      picker.appendChild(btn);
    });

    // Add to container
    const inputContainer = document.getElementById('raven-input-container');
    if (inputContainer) {
      inputContainer.appendChild(picker);
    }

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closePickerOnOutsideClick(e) {
        if (!picker.contains(e.target as Node) && e.target !== document.getElementById('raven-emoji-button')) {
          picker.remove();
          document.removeEventListener('click', closePickerOnOutsideClick);
        }
      });
    }, 0);
  }

  /**
   * Handle file selection.
   */
  private handleFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large. Max size: 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      this.pendingImage = { file, previewUrl };
      this.showImagePreview(previewUrl, file.name);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Show image preview.
   */
  private showImagePreview(url: string, filename: string): void {
    if (!this.imagePreview) return;

    // Check if it's a screenshot or regular image
    const isScreenshot = filename.toLowerCase().includes('screen') ||
                        filename.toLowerCase().includes('shot') ||
                        filename.toLowerCase().startsWith('screenshot');
    const displayName = isScreenshot ? 'Screenshot' : 'Image';

    this.imagePreview.innerHTML = `
      <img src="${url}" alt="Preview" />
      <span>${displayName}</span>
      <button id="raven-remove-image" aria-label="Remove">${REMOVE_ICON}</button>
    `;
    this.imagePreview.classList.add("has-image");

    // Add remove listener
    const removeBtn = document.getElementById("raven-remove-image");
    removeBtn?.addEventListener("click", () => this.clearPendingImage());
  }

  /**
   * Clear pending image.
   */
  private clearPendingImage(): void {
    this.pendingImage = null;
    if (this.fileInput) this.fileInput.value = "";
    if (this.imagePreview) {
      this.imagePreview.innerHTML = "";
      this.imagePreview.classList.remove("has-image");
    }
  }

  /**
   * Toggle chat window open/closed.
   */
  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  /**
   * Open the chat window.
   */
  open(): void {
    const chatWindow = document.getElementById("raven-chat-window");
    const chatButton = document.getElementById("raven-chat-button");
    chatWindow?.classList.add("open");
    chatButton?.classList.add("hidden"); // Hide button when chat is open
    this.isOpen = true;

    // Show lead capture form if enabled and not already completed
    if (this.leadCaptureConfig?.enabled && !this.leadCaptureCompleted) {
      this.showLeadCaptureForm();
    } else {
      this.input?.focus();
    }
  }

  /**
   * Close the chat window and end the conversation.
   * Next time the widget opens, it will start a fresh chat.
   */
  close(): void {
    const chatWindow = document.getElementById("raven-chat-window");
    const chatButton = document.getElementById("raven-chat-button");
    chatWindow?.classList.remove("open");
    chatButton?.classList.remove("hidden"); // Show button when chat is closed
    this.isOpen = false;

    // End the conversation when closing the widget
    // This ensures the next chat session starts fresh
    this.chat.clearConversation();

    // Clear messages display
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }

    // Reset counters and state
    this.messageCount = 0;
    this.quickActionsShown = false;
    this.longConversationWarningShown = false;
    this.leadCaptureCompleted = false;

    // Remove any overlays
    document.getElementById("raven-lead-capture-overlay")?.remove();
    document.getElementById("raven-end-overlay")?.remove();
    document.getElementById("raven-away-banner")?.remove();
  }

  /**
   * Start a new chat (clear conversation history).
   */
  startNewChat(): void {
    // Clear the chat on the client
    this.chat.clearConversation();

    // Clear messages display
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }

    // Remove any overlays
    document.getElementById("raven-lead-capture-overlay")?.remove();
    document.getElementById("raven-end-overlay")?.remove();

    // Reset counters and state
    this.messageCount = 0;
    this.longConversationWarningShown = false;
    this.quickActionsShown = false;

    // Reset to AI assistant status
    this.updateAgentStatus(false);

    // Add welcome message again
    const welcomeMsg = this.language === "en" ? this.welcomeMessageEn : this.welcomeMessage;
    this.addMessage("assistant", welcomeMsg);

    // Show quick actions again
    this.showQuickActions();
  }

  /**
   * Add a message to the chat with read receipt support.
   */
  private addMessage(role: "user" | "assistant", content: string, media?: MediaAttachment[], showRead = false): void {
    if (!this.messagesContainer) return;

    // Track message count
    this.messageCount++;

    // Create wrapper for message + read receipt
    const wrapperEl = document.createElement("div");
    wrapperEl.className = `raven-message-wrapper ${role}`;

    const messageEl = document.createElement("div");
    messageEl.className = `raven-message ${role}`;

    // Add text content with HTML support for bold text
    const textEl = document.createElement("span");
    textEl.innerHTML = this.formatMessageText(content);
    messageEl.appendChild(textEl);

    // Add images if present
    if (media && media.length > 0) {
      for (const item of media) {
        if (item.type === "image") {
          const img = document.createElement("img");
          img.src = item.url;
          img.alt = item.filename || "Image";
          img.onclick = () => window.open(item.url, "_blank");
          messageEl.appendChild(img);
        }
      }
    }

    wrapperEl.appendChild(messageEl);

    // Add read receipt for user messages
    if (role === "user" && showRead) {
      const readReceipt = document.createElement("div");
      readReceipt.className = "raven-read-receipt";
      readReceipt.textContent = "Read";
      wrapperEl.appendChild(readReceipt);
    }

    this.messagesContainer.appendChild(wrapperEl);
    this.scrollToBottom();

    // Show warning if conversation is getting long
    if (this.messageCount >= this.MAX_MESSAGES_BEFORE_WARNING && !this.longConversationWarningShown) {
      this.showLongConversationWarning();
    }
  }

  /**
   * Format message text to support bold and other formatting.
   */
  private formatMessageText(text: string): string {
    // Convert **bold** to <strong>bold</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Also support __bold__ syntax
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Escape any remaining HTML to prevent XSS
    const temp = document.createElement('div');
    temp.innerHTML = formatted;

    return formatted;
  }

  /**
   * Show a warning that the conversation is getting long.
   */
  private showLongConversationWarning(): void {
    if (!this.messagesContainer || this.longConversationWarningShown) return;

    const warningEl = document.createElement("div");
    warningEl.className = "raven-warning-message";
    warningEl.style.cssText = "background: #FFF3CD; color: #856404; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin: 8px 0; text-align: center; border: 1px solid #FFE69C;";
    warningEl.textContent = this.t.longConversation;

    this.messagesContainer.appendChild(warningEl);
    this.scrollToBottom();
    this.longConversationWarningShown = true;
  }

  /**
   * Show typing indicator.
   */
  private showTyping(): HTMLDivElement {
    if (!this.messagesContainer) return document.createElement("div");

    const typing = document.createElement("div");
    typing.className = "raven-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";

    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();

    return typing;
  }

  /**
   * Remove typing indicator.
   */
  private removeTyping(typing: HTMLDivElement): void {
    typing.remove();
  }

  /**
   * Scroll messages to bottom.
   */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /**
   * Send a message.
   */
  private async sendMessage(): Promise<void> {
    if (!this.input) return;

    const content = this.input.value.trim();
    const hasPendingImage = !!this.pendingImage;

    // Need either text or image
    if (!content && !hasPendingImage) return;

    // Clear input and reset height
    this.input.value = "";
    this.input.style.height = "auto";

    // Prepare media attachment
    let media: MediaAttachment[] | undefined;
    let localPreviewUrl: string | undefined;

    if (this.pendingImage) {
      localPreviewUrl = this.pendingImage.previewUrl;
    }

    // Add user message with local preview (no read receipt initially)
    let userMessageWrapper: HTMLDivElement | null = null;
    if (localPreviewUrl) {
      this.addMessage("user", content || "📷", [
        { type: "image", url: localPreviewUrl, filename: this.pendingImage?.file.name },
      ], false);
    } else {
      this.addMessage("user", content, undefined, false);
    }

    // Get the last message wrapper to add read receipt later
    if (this.messagesContainer) {
      const wrappers = this.messagesContainer.querySelectorAll('.raven-message-wrapper.user');
      userMessageWrapper = wrappers[wrappers.length - 1] as HTMLDivElement;
    }

    // Show typing indicator
    const typing = this.showTyping();

    // Disable input while sending
    const sendButton = document.getElementById(
      "raven-send-button"
    ) as HTMLButtonElement;
    const attachmentButton = document.getElementById(
      "raven-attachment-button"
    ) as HTMLButtonElement;
    const emojiButton = document.getElementById(
      "raven-emoji-button"
    ) as HTMLButtonElement;
    this.input.disabled = true;
    if (sendButton) sendButton.disabled = true;
    if (attachmentButton) attachmentButton.disabled = true;
    if (emojiButton) emojiButton.disabled = true;

    try {
      // Upload image first if present
      if (this.pendingImage) {
        const uploaded = await this.chat.uploadImage(this.pendingImage.file);
        media = [uploaded];
        this.clearPendingImage();
      }

      // Send to API
      const response = await this.chat.sendMessage(content || "📷 Image", media);

      // Remove typing indicator
      this.removeTyping(typing);

      // Add read receipt to user message
      if (userMessageWrapper) {
        const readReceipt = document.createElement("div");
        readReceipt.className = "raven-read-receipt";
        readReceipt.textContent = "Read";
        userMessageWrapper.appendChild(readReceipt);
      }

      // Update agent status based on response
      this.updateAgentStatus(response.isHumanTakeover);

      // Add assistant message
      this.addMessage("assistant", response.message);

      // Show slot selection buttons if available
      if (response.availableSlots && response.availableSlots.length > 0) {
        this.showSlotButtons(response.availableSlots);
      }

      // Show end-of-conversation overlay instead of auto-closing
      if (response.shouldClose) {
        setTimeout(() => {
          this.showEndOfConversationOverlay();
        }, 1500);
      }
    } catch (error) {
      console.error("Raven: Failed to send message", error);

      // Remove typing indicator
      this.removeTyping(typing);

      // Show error message
      this.addMessage("assistant", this.t.error);
    } finally {
      // Re-enable input
      this.input.disabled = false;
      if (sendButton) sendButton.disabled = false;
      if (attachmentButton) attachmentButton.disabled = false;
      if (emojiButton) emojiButton.disabled = false;
      this.input.focus();
    }
  }

  /**
   * Auto-resize textarea based on content.
   */
  private autoResizeInput(): void {
    if (!this.input) return;

    // Reset height to calculate new scroll height
    this.input.style.height = 'auto';

    // Set new height based on content, with max limit
    const maxHeight = 120; // matches max-height in CSS
    const newHeight = Math.min(this.input.scrollHeight, maxHeight);
    this.input.style.height = `${newHeight}px`;
  }

  /**
   * Show quick action buttons.
   */
  private showQuickActions(): void {
    if (this.quickActionsShown || !this.messagesContainer) return;

    const quickActionsContainer = document.createElement("div");
    quickActionsContainer.className = "raven-quick-actions";

    const actions = this.language === "en"
      ? [
          { icon: "❓", label: "View FAQ", message: "Can you show me your frequently asked questions?" },
          { icon: "📅", label: "Book Appointment", message: "I would like to book an appointment" },
        ]
      : [
          { icon: "❓", label: "Voir FAQ", message: "Pouvez-vous me montrer les questions fréquentes?" },
          { icon: "📅", label: "Prendre RDV", message: "Je voudrais prendre un rendez-vous" },
        ];

    actions.forEach(action => {
      const button = document.createElement("button");
      button.className = "raven-quick-action-btn";
      button.innerHTML = `<span class="icon">${action.icon}</span><span>${this.escapeHtml(action.label)}</span>`;
      button.onclick = () => {
        if (this.input) {
          this.input.value = action.message;
          this.sendMessage();
        }
        // Remove quick actions after first use
        quickActionsContainer.remove();
        this.quickActionsShown = false;
      };
      quickActionsContainer.appendChild(button);
    });

    this.messagesContainer.appendChild(quickActionsContainer);
    this.scrollToBottom();
    this.quickActionsShown = true;
  }

  /**
   * Escape HTML to prevent XSS.
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update the agent status indicator.
   */
  private updateAgentStatus(isHuman: boolean): void {
    const statusDot = document.getElementById("raven-status-dot");
    const statusText = document.getElementById("raven-status-text");

    if (statusDot && statusText) {
      if (isHuman) {
        // Human agent - show orange indicator
        statusDot.style.background = "#FF9500";
        statusText.innerHTML = `${AGENT_ICON} ${this.t.humanAgent}`;
      } else {
        // AI assistant - show green indicator
        statusDot.style.background = "#34C759";
        statusText.textContent = this.t.aiAssistant;
      }
    }
  }

  /**
   * Show clickable slot selection buttons.
   */
  private showSlotButtons(slots: SlotOption[]): void {
    if (!this.messagesContainer) return;

    // Remove any existing slot buttons
    const existing = this.messagesContainer.querySelector(".raven-slot-buttons");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.className = "raven-slot-buttons";

    slots.forEach((slot) => {
      const button = document.createElement("button");
      button.textContent = slot.display;
      button.onclick = () => {
        // Send the actual date/time display instead of slot number
        if (this.input) {
          this.input.value = slot.display;  // e.g., "Thursday 05 February at 11:30"
          container.remove();
          this.sendMessage();
        }
      };
      container.appendChild(button);
    });

    this.messagesContainer.appendChild(container);
    this.scrollToBottom();
  }

  /**
   * Show lead capture form overlay.
   */
  private showLeadCaptureForm(): void {
    if (!this.leadCaptureConfig || !this.container) return;

    const overlay = document.createElement("div");
    overlay.id = "raven-lead-capture-overlay";
    overlay.className = "raven-lead-capture-overlay";

    const enabledFields = this.leadCaptureConfig.fields.filter(f => f.enabled);
    const primaryColor = this.widgetSettings.primary_color || "#0ea5e9";

    let fieldsHtml = "";
    for (const field of enabledFields) {
      const label = this.language === "en" ? field.label_en : field.label_fr;
      const inputType = field.name === "email" ? "email" : field.name === "phone" ? "tel" : "text";
      fieldsHtml += `
        <div class="raven-field">
          <label>${this.escapeHtml(label)}${field.required ? " *" : ""}</label>
          <input type="${inputType}" data-field="${field.name}" ${field.required ? "required" : ""} placeholder="${this.escapeHtml(label)}" />
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="raven-lead-capture-content">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <p>${this.language === "en" ? "Please introduce yourself to start chatting" : "Présentez-vous pour démarrer le chat"}</p>
        <form id="raven-lead-form">
          ${fieldsHtml}
          <button type="submit" style="background: ${primaryColor};">${this.t.startChat}</button>
        </form>
      </div>
    `;

    const chatWindow = document.getElementById("raven-chat-window");
    chatWindow?.appendChild(overlay);

    // Handle form submit
    const form = document.getElementById("raven-lead-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = overlay.querySelectorAll("input[data-field]");
      let name: string | null = null;
      let email: string | null = null;
      let phone: string | null = null;

      inputs.forEach((input) => {
        const el = input as HTMLInputElement;
        const field = el.getAttribute("data-field");
        if (field === "name") name = el.value.trim() || null;
        if (field === "email") email = el.value.trim() || null;
        if (field === "phone") phone = el.value.trim() || null;
      });

      this.chat.setVisitorInfo(name, email, phone);
      this.leadCaptureCompleted = true;
      overlay.remove();
      this.input?.focus();
    });
  }

  /**
   * Show end-of-conversation overlay with rating + transcript.
   */
  private showEndOfConversationOverlay(): void {
    if (!this.container) return;

    // Remove any existing overlay
    document.getElementById("raven-end-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "raven-end-overlay";
    overlay.className = "raven-end-overlay";

    const primaryColor = this.widgetSettings.primary_color || "#0ea5e9";
    const visitorEmail = this.chat.getVisitorEmail() || "";

    overlay.innerHTML = `
      <div class="raven-end-content">
        <h3>${this.t.rateTitle}</h3>
        <div class="raven-rate-buttons">
          <button class="raven-rate-btn positive" data-rating="positive" title="Good">👍</button>
          <button class="raven-rate-btn negative" data-rating="negative" title="Bad">👎</button>
        </div>
        <textarea id="raven-rate-comment" placeholder="${this.t.rateComment}" rows="2"></textarea>

        <div class="raven-transcript-section">
          <p>${this.t.transcriptTitle}</p>
          <div style="display: flex; gap: 8px;">
            <input type="email" id="raven-transcript-email" placeholder="email@example.com" value="${this.escapeHtml(visitorEmail)}" />
            <button id="raven-transcript-send" style="background: ${primaryColor};">${this.t.transcriptSend}</button>
          </div>
          <span id="raven-transcript-status"></span>
        </div>

        <div class="raven-end-actions">
          <button id="raven-rate-submit" style="background: ${primaryColor};">${this.t.rateSubmit}</button>
          <button id="raven-rate-skip">${this.t.rateSkip}</button>
        </div>
      </div>
    `;

    const chatWindow = document.getElementById("raven-chat-window");
    chatWindow?.appendChild(overlay);

    let selectedRating: string | null = null;

    // Rating button clicks
    overlay.querySelectorAll(".raven-rate-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        overlay.querySelectorAll(".raven-rate-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedRating = btn.getAttribute("data-rating");
      });
    });

    // Transcript send
    const transcriptSendBtn = document.getElementById("raven-transcript-send");
    transcriptSendBtn?.addEventListener("click", async () => {
      const emailInput = document.getElementById("raven-transcript-email") as HTMLInputElement;
      const statusEl = document.getElementById("raven-transcript-status");
      const email = emailInput?.value.trim();
      if (!email) return;

      try {
        const success = await this.chat.emailTranscript(email);
        if (statusEl) {
          statusEl.textContent = success ? this.t.transcriptSent : this.t.transcriptError;
          statusEl.style.color = success ? "#22c55e" : "#ef4444";
        }
      } catch {
        if (statusEl) {
          statusEl.textContent = this.t.transcriptError;
          statusEl.style.color = "#ef4444";
        }
      }
    });

    // Submit rating
    const submitBtn = document.getElementById("raven-rate-submit");
    submitBtn?.addEventListener("click", async () => {
      if (selectedRating) {
        const comment = (document.getElementById("raven-rate-comment") as HTMLTextAreaElement)?.value.trim();
        await this.chat.rateConversation(selectedRating, comment || undefined);
      }
      overlay.remove();
      this.close();
    });

    // Skip
    const skipBtn = document.getElementById("raven-rate-skip");
    skipBtn?.addEventListener("click", () => {
      overlay.remove();
      this.close();
    });
  }

  /**
   * Show away/offline banner at top of messages.
   */
  private showAwayBanner(): void {
    if (!this.messagesContainer) return;

    const banner = document.createElement("div");
    banner.id = "raven-away-banner";
    banner.className = "raven-away-banner";
    const msg = this.language === "en" ? this.awayMessageEn : this.awayMessage;
    banner.textContent = msg || (this.language === "en"
      ? "We are currently unavailable. Leave us a message and we will get back to you."
      : "Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons.");

    this.messagesContainer.insertBefore(banner, this.messagesContainer.firstChild);
  }
}

// Auto-initialize when script loads
(function () {
  // Get config from window
  const config = (window as unknown as { RAVEN_CONFIG?: RavenConfig })
    .RAVEN_CONFIG;

  if (!config) {
    console.error(
      "Raven: Missing RAVEN_CONFIG. Please set window.RAVEN_CONFIG before loading the widget."
    );
    return;
  }

  if (!config.businessId) {
    console.error("Raven: Missing businessId in RAVEN_CONFIG");
    return;
  }

  if (!config.apiUrl) {
    console.error("Raven: Missing apiUrl in RAVEN_CONFIG");
    return;
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const widget = new RavenWidget(config);
      widget.init();
    });
  } else {
    const widget = new RavenWidget(config);
    widget.init();
  }
})();
