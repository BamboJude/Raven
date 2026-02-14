/**
 * Widget CSS styles - Modern, polished design
 * All styles are scoped to avoid conflicts with the host website.
 * Uses CSS variables for customizable colors.
 */

export const styles = `
/* Widget Container */
#raven-widget-container {
  --raven-primary: #0ea5e9;
  --raven-primary-dark: #0284c7;
  --raven-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --raven-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --raven-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --raven-shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#raven-widget-container.position-left {
  right: auto;
  left: 24px;
}

#raven-widget-container.position-left #raven-chat-window {
  right: auto;
  left: 0;
}

/* Chat Button - Enhanced Modern Design */
#raven-chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007AFF;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

#raven-chat-button:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(0, 122, 255, 0.4);
  background: #0051D5;
}

#raven-chat-button:active {
  transform: scale(0.95);
}

#raven-chat-button svg {
  width: 28px;
  height: 28px;
  fill: white;
}

#raven-chat-button.hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.5);
}

/* Chat Window - Enhanced Modern Design */
#raven-chat-window {
  position: absolute;
  bottom: 76px;
  right: 0;
  width: 380px;
  max-width: calc(100vw - 48px);
  height: 680px;
  max-height: calc(100vh - 140px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  display: none;
  flex-direction: column;
  overflow: hidden;
  animation: raven-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #E5E5EA;
}

#raven-chat-window.open {
  display: flex;
}

@keyframes raven-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Chat Header - Enhanced Modern Design */
#raven-chat-header {
  background: white;
  color: #000000;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  position: relative;
}

#raven-chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #000000;
}

#raven-close-button {
  background: #F2F2F7;
  border: none;
  border-radius: 8px;
  color: #000000;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
}

#raven-close-button:hover {
  background: #E5E5EA;
  transform: scale(1.05);
}

#raven-close-button:active {
  transform: scale(0.95);
}

/* Messages Container - Enhanced scrollbar */
#raven-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  scroll-behavior: smooth;
}

/* Agent Status Indicator */
#raven-agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8E8E93;
  margin-top: 2px;
}

#raven-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* New Chat Button */
#raven-new-chat-button {
  background: #F2F2F7;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  transition: all 0.2s;
}

#raven-new-chat-button:hover {
  background: #E5E5EA;
  transform: scale(1.05);
}

#raven-new-chat-button:active {
  transform: scale(0.95);
}

#raven-new-chat-button svg {
  fill: #000000;
}

/* Custom Scrollbar */
#raven-messages::-webkit-scrollbar {
  width: 4px;
}

#raven-messages::-webkit-scrollbar-track {
  background: transparent;
}

#raven-messages::-webkit-scrollbar-thumb {
  background: #D1D1D6;
  border-radius: 10px;
  transition: background 0.2s;
}

#raven-messages::-webkit-scrollbar-thumb:hover {
  background: #8E8E93;
}

/* Message Bubbles - Enhanced with Read Receipts */
.raven-message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: raven-message-appear 0.3s ease-out;
}

.raven-message-wrapper.user {
  align-self: flex-end;
  align-items: flex-end;
}

.raven-message-wrapper.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.raven-message {
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14.5px;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  max-width: 100%;
}

@keyframes raven-message-appear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.raven-message.user {
  background: #007AFF;
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 122, 255, 0.2);
}

.raven-message.assistant {
  background: #F2F2F7;
  color: #000000;
  border-bottom-left-radius: 4px;
  box-shadow: none;
}

/* Read Receipt */
.raven-read-receipt {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 4px;
  padding-right: 2px;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Bold text support in messages */
.raven-message strong,
.raven-message b {
  font-weight: 700;
}

/* Typing Indicator - Enhanced */
.raven-typing {
  display: flex;
  gap: 6px;
  padding: 14px 18px;
  background: #F2F2F7;
  border-radius: 18px;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  box-shadow: none;
  animation: raven-message-appear 0.3s ease-out;
}

.raven-typing span {
  width: 8px;
  height: 8px;
  background: #8E8E93;
  border-radius: 50%;
  animation: raven-bounce 1.4s infinite ease-in-out;
}

.raven-typing span:nth-child(1) { animation-delay: 0s; }
.raven-typing span:nth-child(2) { animation-delay: 0.2s; }
.raven-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes raven-bounce {
  0%, 80%, 100% {
    transform: translateY(0) scale(0.7);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-10px) scale(1);
    opacity: 1;
  }
}

/* Message Images - Enhanced */
.raven-message img {
  max-width: 100%;
  border-radius: 12px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.raven-message img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Input Area - Enhanced Modern Design */
#raven-input-container {
  padding: 12px 16px;
  border-top: 1px solid #E5E5EA;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: white;
  position: relative;
}

#raven-file-input {
  display: none;
}

/* Input Wrapper - Contains textarea and buttons */
#raven-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #D1D1D6;
  border-radius: 20px;
  background: white;
  transition: all 0.2s;
}

#raven-input-wrapper:focus-within {
  border-color: #007AFF;
  box-shadow: 0 0 0 1px #007AFF;
}

#raven-attachment-button,
#raven-emoji-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 18px;
  color: #8E8E93;
}

#raven-attachment-button:hover,
#raven-emoji-button:hover {
  background: #F2F2F7;
  transform: scale(1.05);
}

#raven-attachment-button:active,
#raven-emoji-button:active {
  transform: scale(0.95);
  background: #E5E5EA;
}

#raven-attachment-button svg {
  width: 18px;
  height: 18px;
  fill: #007AFF;
}

#raven-input {
  flex: 1;
  padding: 4px 8px;
  border: none;
  font-size: 15px;
  outline: none;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  resize: none;
  min-height: 24px;
  max-height: 100px;
  line-height: 1.4;
  overflow-y: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;
  color: #000000;
}

#raven-input::placeholder {
  color: #8E8E93;
}

#raven-send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #007AFF;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: none;
  margin-bottom: 2px;
}

#raven-send-button:hover {
  background: #0051D5;
  transform: scale(1.05);
}

#raven-send-button:active {
  transform: scale(0.95);
  background: #004FC1;
}

#raven-send-button:disabled {
  background: #E5E5EA;
  cursor: not-allowed;
  transform: none;
}

#raven-send-button:disabled svg {
  fill: #8E8E93;
}

#raven-send-button svg {
  width: 18px;
  height: 18px;
  fill: white;
}

/* Image Preview - Enhanced */
#raven-image-preview {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: none;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  animation: raven-slide-down 0.2s ease-out;
}

@keyframes raven-slide-down {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 100px;
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

#raven-image-preview.has-image {
  display: flex;
}

#raven-image-preview img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: var(--raven-shadow-sm);
}

#raven-image-preview span {
  flex: 1;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#raven-remove-image {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  color: #9ca3af;
  border-radius: 6px;
  transition: all 0.2s;
}

#raven-remove-image:hover {
  color: #ef4444;
  background: #fee2e2;
}

/* Quick Actions - Enhanced Modern Design */
.raven-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  align-items: center;
  animation: raven-fade-in 0.4s ease-out 0.2s both;
}

@keyframes raven-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.raven-quick-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #F2F2F7;
  border: none;
  border-radius: 20px;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
}

.raven-quick-action-btn:hover {
  background: #E5E5EA;
  transform: translateY(-1px);
}

.raven-quick-action-btn:active {
  transform: translateY(0);
  background: #D1D1D6;
}

.raven-quick-action-btn .icon {
  font-size: 16px;
  line-height: 1;
}

/* Powered by - Enhanced */
#raven-powered-by {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #8E8E93;
  border-top: 1px solid #E5E5EA;
  background: white;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

#raven-powered-by a {
  color: #000000;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

#raven-powered-by a:hover {
  color: #007AFF;
}

/* Mobile Responsive - Full screen on small devices */
@media (max-width: 480px) {
  #raven-widget-container {
    bottom: 20px;
    right: 20px;
  }

  #raven-widget-container.position-left {
    left: 20px;
  }

  #raven-chat-button {
    width: 56px;
    height: 56px;
  }

  #raven-chat-button svg {
    width: 26px;
    height: 26px;
  }

  #raven-chat-window {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
    animation: raven-slide-up-mobile 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #raven-widget-container.position-left #raven-chat-window {
    left: 0;
    right: 0;
  }

  #raven-chat-header {
    padding: 14px 16px;
    padding-top: max(14px, env(safe-area-inset-top, 14px));
    border-radius: 0;
  }

  #raven-chat-header h3 {
    font-size: 17px;
  }

  #raven-messages {
    padding: 16px;
    gap: 10px;
  }

  .raven-message-wrapper {
    max-width: 85%;
  }

  .raven-message {
    font-size: 15px;
    padding: 12px 16px;
  }

  .raven-read-receipt {
    font-size: 11px;
    margin-top: 3px;
  }

  #raven-input-container {
    padding: 10px 12px;
    padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
    gap: 6px;
  }

  #raven-input-wrapper {
    padding: 6px 10px;
  }

  #raven-input {
    font-size: 16px; /* Prevents iOS zoom */
    min-height: 24px;
  }

  #raven-send-button {
    width: 36px;
    height: 36px;
    margin-bottom: 0;
  }

  #raven-send-button svg {
    width: 16px;
    height: 16px;
  }

  #raven-attachment-button,
  #raven-emoji-button {
    width: 26px;
    height: 26px;
    font-size: 16px;
  }

  #raven-attachment-button svg {
    width: 16px;
    height: 16px;
  }

  .raven-emoji-picker {
    right: 12px;
    grid-template-columns: repeat(6, 1fr);
    max-width: 240px;
  }

  .raven-emoji-btn {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }

  .raven-quick-actions {
    gap: 6px;
    padding: 6px 0;
  }

  .raven-quick-action-btn {
    font-size: 13px;
    padding: 9px 14px;
  }

  #raven-powered-by {
    padding: 10px;
    padding-bottom: max(10px, env(safe-area-inset-bottom, 10px));
    font-size: 11px;
  }

  .raven-slot-buttons {
    padding: 6px 0;
  }

  .raven-slot-buttons button {
    font-size: 13px;
    padding: 8px 14px;
  }

  #raven-image-preview {
    padding: 10px 12px;
  }

  #raven-new-chat-button,
  #raven-close-button {
    width: 30px;
    height: 30px;
  }

  #raven-agent-status {
    font-size: 11px;
  }

  #raven-status-dot {
    width: 7px;
    height: 7px;
  }
}

@keyframes raven-slide-up-mobile {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tablet Responsive */
@media (min-width: 481px) and (max-width: 768px) {
  #raven-chat-window {
    width: 360px;
    height: 620px;
  }

  .raven-message-wrapper {
    max-width: 82%;
  }

  .raven-message {
    font-size: 14px;
  }
}

/* Large Desktop Responsive */
@media (min-width: 1440px) {
  #raven-chat-window {
    width: 400px;
    height: 700px;
  }
}

/* High DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  #raven-chat-button,
  .raven-message,
  .raven-quick-action-btn {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Lead Capture Overlay */
.raven-lead-capture-overlay {
  position: absolute;
  inset: 0;
  background: white;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  animation: raven-fade-in 0.3s ease-out;
}

.raven-lead-capture-content {
  width: 100%;
  padding: 32px 28px;
  text-align: center;
}

.raven-lead-capture-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.raven-lead-capture-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
}

.raven-field {
  margin-bottom: 16px;
  text-align: left;
}

.raven-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.raven-field input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.raven-field input:focus {
  border-color: var(--raven-primary);
}

#raven-lead-form button[type="submit"] {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}

#raven-lead-form button[type="submit"]:hover {
  opacity: 0.9;
}

/* End of Conversation Overlay */
.raven-end-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.97);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  animation: raven-fade-in 0.3s ease-out;
  backdrop-filter: blur(4px);
}

.raven-end-content {
  width: 100%;
  padding: 32px 28px;
  text-align: center;
}

.raven-end-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
}

.raven-rate-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.raven-rate-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.raven-rate-btn:hover {
  transform: scale(1.1);
}

.raven-rate-btn.positive.selected {
  border-color: #22c55e;
  background: #f0fdf4;
  transform: scale(1.1);
}

.raven-rate-btn.negative.selected {
  border-color: #ef4444;
  background: #fef2f2;
  transform: scale(1.1);
}

#raven-rate-comment {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  margin-bottom: 16px;
}

#raven-rate-comment:focus {
  border-color: var(--raven-primary);
}

.raven-transcript-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.raven-transcript-section p {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 10px;
}

.raven-transcript-section input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.raven-transcript-section input:focus {
  border-color: var(--raven-primary);
}

#raven-transcript-send {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

#raven-transcript-status {
  display: block;
  font-size: 12px;
  margin-top: 6px;
  min-height: 16px;
}

.raven-end-actions {
  display: flex;
  gap: 10px;
}

.raven-end-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

#raven-rate-submit {
  border: none;
  color: white;
}

#raven-rate-skip {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

#raven-rate-skip:hover {
  background: #f9fafb;
}

/* Away Banner */
.raven-away-banner {
  background: #FFF3CD;
  color: #856404;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.4;
  border: 1px solid #FFE69C;
}

/* Emoji Picker */
.raven-emoji-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 60px;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  animation: raven-slide-up 0.2s ease-out;
  z-index: 100;
  max-width: 320px;
}

.raven-emoji-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.raven-emoji-btn:hover {
  background: #F2F2F7;
  transform: scale(1.1);
}

.raven-emoji-btn:active {
  transform: scale(0.95);
}

/* Slot Selection Buttons */
.raven-slot-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
  animation: raven-fade-in 0.3s ease-out;
}

.raven-slot-buttons button {
  background: #F2F2F7;
  border: none;
  color: #000000;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.raven-slot-buttons button:hover {
  background: #007AFF;
  color: white;
  transform: translateY(-1px);
}

.raven-slot-buttons button:active {
  transform: translateY(0);
}

/* Mobile overrides for new features */
@media (max-width: 480px) {
  .raven-lead-capture-overlay,
  .raven-end-overlay {
    border-radius: 0;
  }

  .raven-lead-capture-content,
  .raven-end-content {
    padding: 24px 20px;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
