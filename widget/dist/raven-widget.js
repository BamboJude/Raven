var A=Object.defineProperty;var F=(u,m,v)=>m in u?A(u,m,{enumerable:!0,configurable:!0,writable:!0,value:v}):u[m]=v;var o=(u,m,v)=>F(u,typeof m!="symbol"?m+"":m,v);(function(){"use strict";const u=`
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
`;class m{constructor(e,t){o(this,"businessId");o(this,"apiUrl");o(this,"conversationId",null);o(this,"visitorId");o(this,"messages",[]);o(this,"visitorName",null);o(this,"visitorEmail",null);o(this,"visitorPhone",null);this.businessId=e,this.apiUrl=t,this.visitorId=this.getOrCreateVisitorId()}getOrCreateVisitorId(){const e=`raven_visitor_${this.businessId}`;let t=localStorage.getItem(e);return t||(t=`v_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,localStorage.setItem(e,t)),t}getSavedConversationId(){const e=`raven_convo_${this.businessId}_${this.visitorId}`;return localStorage.getItem(e)}saveConversationId(e){const t=`raven_convo_${this.businessId}_${this.visitorId}`;localStorage.setItem(t,e)}async getBusinessInfo(){const e=await fetch(`${this.apiUrl}/api/chat/business/${this.businessId}/public`);if(!e.ok)throw new Error("Failed to fetch business info");return e.json()}async uploadImage(e){const t=new FormData;t.append("file",e);const n=await fetch(`${this.apiUrl}/api/uploads/image`,{method:"POST",body:t});if(!n.ok)throw new Error("Failed to upload image");const i=await n.json();return{type:"image",url:`${this.apiUrl}${i.url}`,filename:e.name,content_type:i.content_type}}async sendMessage(e,t){this.messages.push({role:"user",content:e,media:t}),this.conversationId||(this.conversationId=this.getSavedConversationId());const n=new AbortController,i=setTimeout(()=>n.abort(),3e4);try{const a=await fetch(`${this.apiUrl}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_id:this.businessId,visitor_id:this.visitorId,message:e,conversation_id:this.conversationId,media:t,...this.visitorName&&!this.conversationId?{visitor_name:this.visitorName}:{},...this.visitorEmail&&!this.conversationId?{visitor_email:this.visitorEmail}:{},...this.visitorPhone&&!this.conversationId?{visitor_phone:this.visitorPhone}:{}}),signal:n.signal});if(clearTimeout(i),!a.ok)throw new Error("Failed to send message");const s=await a.json();return this.conversationId=s.conversation_id,this.saveConversationId(s.conversation_id),this.messages.push({role:"assistant",content:s.message}),{message:s.message,isHumanTakeover:s.is_human_takeover||!1,availableSlots:s.available_slots,shouldClose:s.should_close||!1}}catch(a){throw clearTimeout(i),a instanceof Error&&a.name==="AbortError"?new Error("Request timed out - please try again"):a}}getMessages(){return this.messages}setVisitorInfo(e,t,n){this.visitorName=e,this.visitorEmail=t,this.visitorPhone=n}getVisitorEmail(){return this.visitorEmail}getConversationId(){return this.conversationId}async rateConversation(e,t){this.conversationId&&await fetch(`${this.apiUrl}/api/chat/conversation/${this.conversationId}/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rating:e,comment:t})})}async emailTranscript(e){return this.conversationId?(await fetch(`${this.apiUrl}/api/chat/conversation/${this.conversationId}/transcript`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})})).ok:!1}clearConversation(){this.conversationId=null,this.messages=[],this.visitorName=null,this.visitorEmail=null,this.visitorPhone=null;const e=`raven_convo_${this.businessId}_${this.visitorId}`;localStorage.removeItem(e)}}const v='<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',y='<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',E='<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',C='<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',k='<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',I='<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',S='<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',M={fr:{placeholder:"Ecrivez votre message...",send:"Envoyer",close:"Fermer",open:"Ouvrir le chat",poweredBy:"Propulsé par",error:"Désolé, je rencontre un problème technique. Veuillez réessayer.",newChat:"Nouvelle conversation",longConversation:"La conversation devient longue. Cliquez sur + pour démarrer une nouvelle conversation.",humanAgent:"Conseiller en ligne",aiAssistant:"Assistant IA",offline:"Hors ligne",startChat:"Démarrer le chat",rateTitle:"Comment était votre expérience?",rateComment:"Un commentaire? (optionnel)",rateSubmit:"Envoyer",rateSkip:"Passer",rateThanks:"Merci pour votre retour!",transcriptTitle:"Recevoir la transcription par email",transcriptSend:"Envoyer",transcriptSent:"Email envoyé!",transcriptError:"Erreur d'envoi"},en:{placeholder:"Type your message...",send:"Send",close:"Close",open:"Open chat",poweredBy:"Powered by",error:"Sorry, I'm having a technical issue. Please try again.",newChat:"New conversation",longConversation:"Conversation is getting long. Click + to start a fresh chat.",humanAgent:"Live Agent",aiAssistant:"AI Assistant",offline:"Offline",startChat:"Start Chat",rateTitle:"How was your experience?",rateComment:"Any comments? (optional)",rateSubmit:"Submit",rateSkip:"Skip",rateThanks:"Thanks for your feedback!",transcriptTitle:"Get transcript via email",transcriptSend:"Send",transcriptSent:"Email sent!",transcriptError:"Send failed"}};class w{constructor(e){o(this,"chat");o(this,"container",null);o(this,"messagesContainer",null);o(this,"input",null);o(this,"fileInput",null);o(this,"imagePreview",null);o(this,"isOpen",!1);o(this,"businessName","Chat");o(this,"welcomeMessage","Bonjour! Comment puis-je vous aider?");o(this,"welcomeMessageEn","Hello! How can I help you?");o(this,"language","fr");o(this,"pendingImage",null);o(this,"widgetSettings",{primary_color:"#0ea5e9",position:"bottom-right",welcome_message_language:"auto"});o(this,"quickActionsShown",!1);o(this,"messageCount",0);o(this,"longConversationWarningShown",!1);o(this,"MAX_MESSAGES_BEFORE_WARNING",15);o(this,"isBusinessOnline",!0);o(this,"awayMessage","");o(this,"awayMessageEn","");o(this,"leadCaptureConfig",null);o(this,"leadCaptureCompleted",!1);this.chat=new m(e.businessId,e.apiUrl)}get t(){return M[this.language]}detectLanguage(){return navigator.language.toLowerCase().startsWith("fr")?"fr":"en"}darkenColor(e,t){const n=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),a=Math.max(0,(n>>16)-i),s=Math.max(0,(n>>8&255)-i),r=Math.max(0,(n&255)-i);return`#${((1<<24)+(a<<16)+(s<<8)+r).toString(16).slice(1)}`}async init(){this.injectStyles();try{const t=await this.chat.getBusinessInfo();this.businessName=t.name,this.welcomeMessage=t.welcome_message,this.welcomeMessageEn=t.welcome_message_en||t.welcome_message,this.widgetSettings=t.widget_settings||this.widgetSettings,this.isBusinessOnline=t.is_online!==!1,this.awayMessage=t.away_message||"",this.awayMessageEn=t.away_message_en||"",this.leadCaptureConfig=t.lead_capture_config||null,this.widgetSettings.welcome_message_language==="auto"?this.language=this.detectLanguage():this.widgetSettings.welcome_message_language==="en"?this.language="en":this.language="fr"}catch(t){console.error("Raven: Failed to load business info",t)}this.createWidget(),this.applySettings(),this.isBusinessOnline||this.showAwayBanner();const e=this.language==="en"?this.welcomeMessageEn:this.welcomeMessage;this.addMessage("assistant",e),this.showQuickActions()}applySettings(){if(!this.container)return;const e=this.widgetSettings.primary_color||"#0ea5e9",t=this.darkenColor(e,15);this.container.style.setProperty("--raven-primary",e),this.container.style.setProperty("--raven-primary-dark",t),this.widgetSettings.position==="bottom-left"&&this.container.classList.add("position-left")}injectStyles(){const e=document.createElement("style");e.id="raven-widget-styles",e.textContent=u,document.head.appendChild(e)}createWidget(){this.container=document.createElement("div"),this.container.id="raven-widget-container";const e=document.createElement("div");e.id="raven-chat-window";const t=document.createElement("div");t.id="raven-chat-header",t.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <div id="raven-agent-status">
          <span id="raven-status-dot" style="background: ${this.isBusinessOnline?"#34C759":"#8E8E93"};"></span>
          <span id="raven-status-text">${this.isBusinessOnline?this.t.aiAssistant:this.t.offline}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button id="raven-new-chat-button" aria-label="${this.t.newChat}" title="${this.t.newChat}">${I}</button>
        <button id="raven-close-button" aria-label="${this.t.close}">${y}</button>
      </div>
    `,this.messagesContainer=document.createElement("div"),this.messagesContainer.id="raven-messages",this.imagePreview=document.createElement("div"),this.imagePreview.id="raven-image-preview";const n=document.createElement("div");n.id="raven-input-container",n.innerHTML=`
      <input type="file" id="raven-file-input" accept="image/*" />
      <div id="raven-input-wrapper">
        <button id="raven-attachment-button" aria-label="Add attachment" title="Add file or screenshot">${C}</button>
        <textarea id="raven-input" placeholder="${this.t.placeholder}" rows="1"></textarea>
        <button id="raven-emoji-button" aria-label="Add emoji" title="Add emoji">😊</button>
      </div>
      <button id="raven-send-button" aria-label="${this.t.send}">${E}</button>
    `;const i=document.createElement("div");i.id="raven-powered-by",i.innerHTML=`${this.t.poweredBy} <a href="https://raven-bjxkx3nc2-bambo-judes-projects.vercel.app" target="_blank">Raven</a>`,e.appendChild(t),e.appendChild(this.messagesContainer),e.appendChild(this.imagePreview),e.appendChild(n),e.appendChild(i);const a=document.createElement("button");a.id="raven-chat-button",a.innerHTML=v,a.setAttribute("aria-label",this.t.open),this.container.appendChild(e),this.container.appendChild(a),document.body.appendChild(this.container),this.input=document.getElementById("raven-input"),this.fileInput=document.getElementById("raven-file-input"),this.addEventListeners()}addEventListeners(){var r,l,p;const e=document.getElementById("raven-chat-button");e==null||e.addEventListener("click",()=>this.toggle());const t=document.getElementById("raven-close-button");t==null||t.addEventListener("click",()=>this.close());const n=document.getElementById("raven-new-chat-button");n==null||n.addEventListener("click",()=>this.startNewChat());const i=document.getElementById("raven-send-button");i==null||i.addEventListener("click",()=>this.sendMessage()),(r=this.input)==null||r.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&(d.preventDefault(),this.sendMessage())}),(l=this.input)==null||l.addEventListener("input",()=>this.autoResizeInput());const a=document.getElementById("raven-attachment-button");a==null||a.addEventListener("click",()=>{var d;return(d=this.fileInput)==null?void 0:d.click()});const s=document.getElementById("raven-emoji-button");s==null||s.addEventListener("click",()=>this.showEmojiPicker()),(p=this.fileInput)==null||p.addEventListener("change",d=>this.handleFileSelect(d))}showEmojiPicker(){const e=["😊","😂","❤️","👍","🙏","😍","🎉","🔥","✨","💯","👏","🤔","😅","😎","🥰","💪","🙌","✅","📅","📞","✉️","💼","🏠","🚀"],t=document.getElementById("raven-emoji-picker");if(t){t.remove();return}const n=document.createElement("div");n.id="raven-emoji-picker",n.className="raven-emoji-picker",e.forEach(a=>{const s=document.createElement("button");s.textContent=a,s.className="raven-emoji-btn",s.onclick=()=>{if(this.input){const r=this.input.selectionStart||0,l=this.input.selectionEnd||0,p=this.input.value;this.input.value=p.substring(0,r)+a+p.substring(l),this.input.focus(),this.input.selectionStart=this.input.selectionEnd=r+a.length}n.remove()},n.appendChild(s)});const i=document.getElementById("raven-input-container");i&&i.appendChild(n),setTimeout(()=>{document.addEventListener("click",function a(s){!n.contains(s.target)&&s.target!==document.getElementById("raven-emoji-button")&&(n.remove(),document.removeEventListener("click",a))})},0)}handleFileSelect(e){var a;const n=(a=e.target.files)==null?void 0:a[0];if(!n)return;if(!n.type.startsWith("image/")){alert("Please select an image file");return}if(n.size>10*1024*1024){alert("Image too large. Max size: 10MB");return}const i=new FileReader;i.onload=s=>{var l;const r=(l=s.target)==null?void 0:l.result;this.pendingImage={file:n,previewUrl:r},this.showImagePreview(r,n.name)},i.readAsDataURL(n)}showImagePreview(e,t){if(!this.imagePreview)return;const i=t.toLowerCase().includes("screen")||t.toLowerCase().includes("shot")||t.toLowerCase().startsWith("screenshot")?"Screenshot":"Image";this.imagePreview.innerHTML=`
      <img src="${e}" alt="Preview" />
      <span>${i}</span>
      <button id="raven-remove-image" aria-label="Remove">${k}</button>
    `,this.imagePreview.classList.add("has-image");const a=document.getElementById("raven-remove-image");a==null||a.addEventListener("click",()=>this.clearPendingImage())}clearPendingImage(){this.pendingImage=null,this.fileInput&&(this.fileInput.value=""),this.imagePreview&&(this.imagePreview.innerHTML="",this.imagePreview.classList.remove("has-image"))}toggle(){this.isOpen?this.close():this.open()}open(){var n,i;const e=document.getElementById("raven-chat-window"),t=document.getElementById("raven-chat-button");e==null||e.classList.add("open"),t==null||t.classList.add("hidden"),this.isOpen=!0,(n=this.leadCaptureConfig)!=null&&n.enabled&&!this.leadCaptureCompleted?this.showLeadCaptureForm():(i=this.input)==null||i.focus()}close(){var n,i,a;const e=document.getElementById("raven-chat-window"),t=document.getElementById("raven-chat-button");e==null||e.classList.remove("open"),t==null||t.classList.remove("hidden"),this.isOpen=!1,this.chat.clearConversation(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.messageCount=0,this.quickActionsShown=!1,this.longConversationWarningShown=!1,this.leadCaptureCompleted=!1,(n=document.getElementById("raven-lead-capture-overlay"))==null||n.remove(),(i=document.getElementById("raven-end-overlay"))==null||i.remove(),(a=document.getElementById("raven-away-banner"))==null||a.remove()}startNewChat(){var t,n;this.chat.clearConversation(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),(t=document.getElementById("raven-lead-capture-overlay"))==null||t.remove(),(n=document.getElementById("raven-end-overlay"))==null||n.remove(),this.messageCount=0,this.longConversationWarningShown=!1,this.quickActionsShown=!1,this.updateAgentStatus(!1);const e=this.language==="en"?this.welcomeMessageEn:this.welcomeMessage;this.addMessage("assistant",e),this.showQuickActions()}addMessage(e,t,n,i=!1){if(!this.messagesContainer)return;this.messageCount++;const a=document.createElement("div");a.className=`raven-message-wrapper ${e}`;const s=document.createElement("div");s.className=`raven-message ${e}`;const r=document.createElement("span");if(r.innerHTML=this.formatMessageText(t),s.appendChild(r),n&&n.length>0){for(const l of n)if(l.type==="image"){const p=document.createElement("img");p.src=l.url,p.alt=l.filename||"Image",p.onclick=()=>window.open(l.url,"_blank"),s.appendChild(p)}}if(a.appendChild(s),e==="user"&&i){const l=document.createElement("div");l.className="raven-read-receipt",l.textContent="Read",a.appendChild(l)}this.messagesContainer.appendChild(a),this.scrollToBottom(),this.messageCount>=this.MAX_MESSAGES_BEFORE_WARNING&&!this.longConversationWarningShown&&this.showLongConversationWarning()}formatMessageText(e){let t=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");t=t.replace(/__(.*?)__/g,"<strong>$1</strong>");const n=document.createElement("div");return n.innerHTML=t,t}showLongConversationWarning(){if(!this.messagesContainer||this.longConversationWarningShown)return;const e=document.createElement("div");e.className="raven-warning-message",e.style.cssText="background: #FFF3CD; color: #856404; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin: 8px 0; text-align: center; border: 1px solid #FFE69C;",e.textContent=this.t.longConversation,this.messagesContainer.appendChild(e),this.scrollToBottom(),this.longConversationWarningShown=!0}showTyping(){if(!this.messagesContainer)return document.createElement("div");const e=document.createElement("div");return e.className="raven-typing",e.innerHTML="<span></span><span></span><span></span>",this.messagesContainer.appendChild(e),this.scrollToBottom(),e}removeTyping(e){e.remove()}scrollToBottom(){this.messagesContainer&&(this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight)}async sendMessage(){var d;if(!this.input)return;const e=this.input.value.trim(),t=!!this.pendingImage;if(!e&&!t)return;this.input.value="",this.input.style.height="auto";let n,i;this.pendingImage&&(i=this.pendingImage.previewUrl);let a=null;if(i?this.addMessage("user",e||"📷",[{type:"image",url:i,filename:(d=this.pendingImage)==null?void 0:d.file.name}],!1):this.addMessage("user",e,void 0,!1),this.messagesContainer){const c=this.messagesContainer.querySelectorAll(".raven-message-wrapper.user");a=c[c.length-1]}const s=this.showTyping(),r=document.getElementById("raven-send-button"),l=document.getElementById("raven-attachment-button"),p=document.getElementById("raven-emoji-button");this.input.disabled=!0,r&&(r.disabled=!0),l&&(l.disabled=!0),p&&(p.disabled=!0);try{this.pendingImage&&(n=[await this.chat.uploadImage(this.pendingImage.file)],this.clearPendingImage());const c=await this.chat.sendMessage(e||"📷 Image",n);if(this.removeTyping(s),a){const h=document.createElement("div");h.className="raven-read-receipt",h.textContent="Read",a.appendChild(h)}this.updateAgentStatus(c.isHumanTakeover),this.addMessage("assistant",c.message),c.availableSlots&&c.availableSlots.length>0&&this.showSlotButtons(c.availableSlots),c.shouldClose&&setTimeout(()=>{this.showEndOfConversationOverlay()},1500)}catch(c){console.error("Raven: Failed to send message",c),this.removeTyping(s),this.addMessage("assistant",this.t.error)}finally{this.input.disabled=!1,r&&(r.disabled=!1),l&&(l.disabled=!1),p&&(p.disabled=!1),this.input.focus()}}autoResizeInput(){if(!this.input)return;this.input.style.height="auto";const t=Math.min(this.input.scrollHeight,120);this.input.style.height=`${t}px`}showQuickActions(){if(this.quickActionsShown||!this.messagesContainer)return;const e=document.createElement("div");e.className="raven-quick-actions",(this.language==="en"?[{icon:"❓",label:"View FAQ",message:"Can you show me your frequently asked questions?"},{icon:"📅",label:"Book Appointment",message:"I would like to book an appointment"}]:[{icon:"❓",label:"Voir FAQ",message:"Pouvez-vous me montrer les questions fréquentes?"},{icon:"📅",label:"Prendre RDV",message:"Je voudrais prendre un rendez-vous"}]).forEach(n=>{const i=document.createElement("button");i.className="raven-quick-action-btn",i.innerHTML=`<span class="icon">${n.icon}</span><span>${this.escapeHtml(n.label)}</span>`,i.onclick=()=>{this.input&&(this.input.value=n.message,this.sendMessage()),e.remove(),this.quickActionsShown=!1},e.appendChild(i)}),this.messagesContainer.appendChild(e),this.scrollToBottom(),this.quickActionsShown=!0}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}updateAgentStatus(e){const t=document.getElementById("raven-status-dot"),n=document.getElementById("raven-status-text");t&&n&&(e?(t.style.background="#FF9500",n.innerHTML=`${S} ${this.t.humanAgent}`):this.isBusinessOnline?(t.style.background="#34C759",n.textContent=this.t.aiAssistant):(t.style.background="#8E8E93",n.textContent=this.t.offline))}showSlotButtons(e){if(!this.messagesContainer)return;const t=this.messagesContainer.querySelector(".raven-slot-buttons");t&&t.remove();const n=document.createElement("div");n.className="raven-slot-buttons",e.forEach(i=>{const a=document.createElement("button");a.textContent=i.display,a.onclick=()=>{this.input&&(this.input.value=i.display,n.remove(),this.sendMessage())},n.appendChild(a)}),this.messagesContainer.appendChild(n),this.scrollToBottom()}showLeadCaptureForm(){if(!this.leadCaptureConfig||!this.container)return;const e=document.createElement("div");e.id="raven-lead-capture-overlay",e.className="raven-lead-capture-overlay";const t=this.leadCaptureConfig.fields.filter(r=>r.enabled),n=this.widgetSettings.primary_color||"#0ea5e9";let i="";for(const r of t){const l=this.language==="en"?r.label_en:r.label_fr,p=r.name==="email"?"email":r.name==="phone"?"tel":"text";i+=`
        <div class="raven-field">
          <label>${this.escapeHtml(l)}${r.required?" *":""}</label>
          <input type="${p}" data-field="${r.name}" ${r.required?"required":""} placeholder="${this.escapeHtml(l)}" />
        </div>
      `}e.innerHTML=`
      <div class="raven-lead-capture-content">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <p>${this.language==="en"?"Please introduce yourself to start chatting":"Présentez-vous pour démarrer le chat"}</p>
        <form id="raven-lead-form">
          ${i}
          <button type="submit" style="background: ${n};">${this.t.startChat}</button>
        </form>
      </div>
    `;const a=document.getElementById("raven-chat-window");a==null||a.appendChild(e);const s=document.getElementById("raven-lead-form");s==null||s.addEventListener("submit",r=>{var h;r.preventDefault();const l=e.querySelectorAll("input[data-field]");let p=null,d=null,c=null;l.forEach(b=>{const f=b,x=f.getAttribute("data-field");x==="name"&&(p=f.value.trim()||null),x==="email"&&(d=f.value.trim()||null),x==="phone"&&(c=f.value.trim()||null)}),this.chat.setVisitorInfo(p,d,c),this.leadCaptureCompleted=!0,e.remove(),(h=this.input)==null||h.focus()})}showEndOfConversationOverlay(){var p;if(!this.container)return;(p=document.getElementById("raven-end-overlay"))==null||p.remove();const e=document.createElement("div");e.id="raven-end-overlay",e.className="raven-end-overlay";const t=this.widgetSettings.primary_color||"#0ea5e9",n=this.chat.getVisitorEmail()||"";e.innerHTML=`
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
            <input type="email" id="raven-transcript-email" placeholder="email@example.com" value="${this.escapeHtml(n)}" />
            <button id="raven-transcript-send" style="background: ${t};">${this.t.transcriptSend}</button>
          </div>
          <span id="raven-transcript-status"></span>
        </div>

        <div class="raven-end-actions">
          <button id="raven-rate-submit" style="background: ${t};">${this.t.rateSubmit}</button>
          <button id="raven-rate-skip">${this.t.rateSkip}</button>
        </div>
      </div>
    `;const i=document.getElementById("raven-chat-window");i==null||i.appendChild(e);let a=null;e.querySelectorAll(".raven-rate-btn").forEach(d=>{d.addEventListener("click",()=>{e.querySelectorAll(".raven-rate-btn").forEach(c=>c.classList.remove("selected")),d.classList.add("selected"),a=d.getAttribute("data-rating")})});const s=document.getElementById("raven-transcript-send");s==null||s.addEventListener("click",async()=>{const d=document.getElementById("raven-transcript-email"),c=document.getElementById("raven-transcript-status"),h=d==null?void 0:d.value.trim();if(h)try{const b=await this.chat.emailTranscript(h);c&&(c.textContent=b?this.t.transcriptSent:this.t.transcriptError,c.style.color=b?"#22c55e":"#ef4444")}catch{c&&(c.textContent=this.t.transcriptError,c.style.color="#ef4444")}});const r=document.getElementById("raven-rate-submit");r==null||r.addEventListener("click",async()=>{var d;if(a){const c=(d=document.getElementById("raven-rate-comment"))==null?void 0:d.value.trim();await this.chat.rateConversation(a,c||void 0)}e.remove(),this.close()});const l=document.getElementById("raven-rate-skip");l==null||l.addEventListener("click",()=>{e.remove(),this.close()})}showAwayBanner(){if(!this.messagesContainer)return;const e=document.createElement("div");e.id="raven-away-banner",e.className="raven-away-banner";const t=this.language==="en"?this.awayMessageEn:this.awayMessage;e.textContent=t||(this.language==="en"?"We are currently unavailable. Leave us a message and we will get back to you.":"Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons."),this.messagesContainer.insertBefore(e,this.messagesContainer.firstChild)}}(function(){const g=window.RAVEN_CONFIG;if(!g){console.error("Raven: Missing RAVEN_CONFIG. Please set window.RAVEN_CONFIG before loading the widget.");return}if(!g.businessId){console.error("Raven: Missing businessId in RAVEN_CONFIG");return}if(!g.apiUrl){console.error("Raven: Missing apiUrl in RAVEN_CONFIG");return}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new w(g).init()}):new w(g).init()})()})();
