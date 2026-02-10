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

/* Chat Button - Enhanced */
#raven-chat-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
  border: none;
  cursor: pointer;
  box-shadow: var(--raven-shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

#raven-chat-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

#raven-chat-button:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--raven-shadow-xl);
}

#raven-chat-button:hover::before {
  opacity: 1;
}

#raven-chat-button:active {
  transform: scale(0.95);
}

#raven-chat-button svg {
  width: 30px;
  height: 30px;
  fill: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

#raven-chat-button.hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.5);
}

/* Chat Window - Enhanced */
#raven-chat-window {
  position: absolute;
  bottom: 88px;
  right: 0;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 600px;
  max-height: calc(100vh - 140px);
  background: white;
  border-radius: 20px;
  box-shadow: var(--raven-shadow-xl);
  display: none;
  flex-direction: column;
  overflow: hidden;
  animation: raven-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
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

/* Chat Header - Enhanced */
#raven-chat-header {
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

#raven-chat-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
}

#raven-chat-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

#raven-close-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

#raven-close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Messages Container - Enhanced scrollbar */
#raven-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 10%);
  scroll-behavior: smooth;
}

/* Custom Scrollbar */
#raven-messages::-webkit-scrollbar {
  width: 6px;
}

#raven-messages::-webkit-scrollbar-track {
  background: transparent;
}

#raven-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
  transition: background 0.2s;
}

#raven-messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Message Bubbles - Enhanced */
.raven-message {
  max-width: 80%;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14.5px;
  line-height: 1.5;
  word-wrap: break-word;
  animation: raven-message-appear 0.3s ease-out;
  position: relative;
  box-shadow: var(--raven-shadow-sm);
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
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.raven-message.assistant {
  background: white;
  color: #1f2937;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* Typing Indicator - Enhanced */
.raven-typing {
  display: flex;
  gap: 6px;
  padding: 14px 18px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  box-shadow: var(--raven-shadow-sm);
  animation: raven-message-appear 0.3s ease-out;
}

.raven-typing span {
  width: 9px;
  height: 9px;
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
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

/* Input Area - Enhanced */
#raven-input-container {
  padding: 16px 20px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  align-items: center;
  background: white;
}

#raven-image-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

#raven-image-button:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

#raven-image-button:active {
  transform: scale(0.95);
}

#raven-image-button svg {
  width: 20px;
  height: 20px;
  fill: #6b7280;
}

#raven-file-input {
  display: none;
}

#raven-input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14.5px;
  outline: none;
  transition: all 0.2s;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  line-height: 1.5;
  overflow-y: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;
}

#raven-input:focus {
  border-color: var(--raven-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

#raven-input::placeholder {
  color: #9ca3af;
}

#raven-send-button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

#raven-send-button:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
}

#raven-send-button:active {
  transform: scale(0.95);
}

#raven-send-button:disabled {
  background: #e5e7eb;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

#raven-send-button svg {
  width: 20px;
  height: 20px;
  fill: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
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

/* Quick Actions - Enhanced */
.raven-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 0;
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
  gap: 8px;
  padding: 12px 18px;
  background: white;
  border: 2px solid var(--raven-primary);
  border-radius: 24px;
  color: var(--raven-primary);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
  position: relative;
  overflow: hidden;
}

.raven-quick-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--raven-primary) 0%, var(--raven-primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.raven-quick-action-btn:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
  border-color: transparent;
}

.raven-quick-action-btn:hover::before {
  opacity: 1;
}

.raven-quick-action-btn:active {
  transform: translateY(0);
}

.raven-quick-action-btn span {
  position: relative;
  z-index: 1;
}

.raven-quick-action-btn .icon {
  font-size: 18px;
  line-height: 1;
  position: relative;
  z-index: 1;
}

/* Powered by - Enhanced */
#raven-powered-by {
  text-align: center;
  padding: 10px;
  font-size: 11px;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  font-weight: 500;
}

#raven-powered-by a {
  color: var(--raven-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

#raven-powered-by a:hover {
  color: var(--raven-primary-dark);
  text-decoration: underline;
}

/* Mobile Responsive - Full screen on small devices */
@media (max-width: 480px) {
  #raven-widget-container {
    bottom: 16px;
    right: 16px;
  }

  #raven-widget-container.position-left {
    left: 16px;
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
    animation: raven-slide-up-mobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #raven-widget-container.position-left #raven-chat-window {
    left: 0;
    right: 0;
  }

  #raven-chat-header {
    padding: 16px 20px;
    padding-top: max(16px, env(safe-area-inset-top));
    border-radius: 0;
  }

  #raven-messages {
    padding: 16px;
    gap: 12px;
  }

  .raven-message {
    max-width: 85%;
    font-size: 14px;
    padding: 12px 16px;
  }

  #raven-input-container {
    padding: 12px 16px;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    gap: 8px;
  }

  #raven-input {
    font-size: 16px; /* Prevents iOS zoom */
    padding: 10px 16px;
    min-height: 42px;
  }

  #raven-send-button {
    width: 42px;
    height: 42px;
  }

  #raven-image-button {
    width: 36px;
    height: 36px;
  }

  .raven-quick-actions {
    gap: 8px;
  }

  .raven-quick-action-btn {
    font-size: 13px;
    padding: 10px 14px;
  }

  #raven-powered-by {
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }

  .raven-slot-buttons {
    padding: 8px 12px !important;
  }

  .raven-slot-buttons button {
    font-size: 12px !important;
    padding: 6px 10px !important;
  }

  #raven-image-preview {
    padding: 10px 16px;
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
    width: 380px;
    height: 550px;
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
  background: #fef3c7;
  color: #92400e;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.4;
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
