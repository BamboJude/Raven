var _=Object.defineProperty;var z=(g,h,u)=>h in g?_(g,h,{enumerable:!0,configurable:!0,writable:!0,value:u}):g[h]=u;var o=(g,h,u)=>z(g,typeof h!="symbol"?h+"":h,u);(function(){"use strict";const g=`
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
`;class h{constructor(e,t){o(this,"businessId");o(this,"apiUrl");o(this,"conversationId",null);o(this,"visitorId");o(this,"messages",[]);o(this,"visitorName",null);o(this,"visitorEmail",null);o(this,"visitorPhone",null);this.businessId=e,this.apiUrl=t,this.visitorId=this.getOrCreateVisitorId()}getOrCreateVisitorId(){const e=`raven_visitor_${this.businessId}`;let t=localStorage.getItem(e);return t||(t=`v_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,localStorage.setItem(e,t)),t}getSavedConversationId(){const e=`raven_convo_${this.businessId}_${this.visitorId}`;return localStorage.getItem(e)}saveConversationId(e){const t=`raven_convo_${this.businessId}_${this.visitorId}`;localStorage.setItem(t,e)}async getBusinessInfo(){const e=await fetch(`${this.apiUrl}/api/chat/business/${this.businessId}/public`);if(!e.ok)throw new Error("Failed to fetch business info");return e.json()}async uploadImage(e){const t=new FormData;t.append("file",e);const n=await fetch(`${this.apiUrl}/api/uploads/image`,{method:"POST",body:t});if(!n.ok)throw new Error("Failed to upload image");const a=await n.json();return{type:"image",url:`${this.apiUrl}${a.url}`,filename:e.name,content_type:a.content_type}}async sendMessage(e,t){this.messages.push({role:"user",content:e,media:t}),this.conversationId||(this.conversationId=this.getSavedConversationId());const n=await fetch(`${this.apiUrl}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_id:this.businessId,visitor_id:this.visitorId,message:e,conversation_id:this.conversationId,media:t,...this.visitorName&&!this.conversationId?{visitor_name:this.visitorName}:{},...this.visitorEmail&&!this.conversationId?{visitor_email:this.visitorEmail}:{},...this.visitorPhone&&!this.conversationId?{visitor_phone:this.visitorPhone}:{}})});if(!n.ok)throw new Error("Failed to send message");const a=await n.json();return this.conversationId=a.conversation_id,this.saveConversationId(a.conversation_id),this.messages.push({role:"assistant",content:a.message}),{message:a.message,isHumanTakeover:a.is_human_takeover||!1,availableSlots:a.available_slots,shouldClose:a.should_close||!1}}getMessages(){return this.messages}setVisitorInfo(e,t,n){this.visitorName=e,this.visitorEmail=t,this.visitorPhone=n}getVisitorEmail(){return this.visitorEmail}getConversationId(){return this.conversationId}async rateConversation(e,t){this.conversationId&&await fetch(`${this.apiUrl}/api/chat/conversation/${this.conversationId}/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rating:e,comment:t})})}async emailTranscript(e){return this.conversationId?(await fetch(`${this.apiUrl}/api/chat/conversation/${this.conversationId}/transcript`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})})).ok:!1}clearConversation(){this.conversationId=null,this.messages=[],this.visitorName=null,this.visitorEmail=null,this.visitorPhone=null;const e=`raven_convo_${this.businessId}_${this.visitorId}`;localStorage.removeItem(e)}}const u='<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',y='<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',C='<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',k='<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',E='<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',I='<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',S='<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',M={fr:{placeholder:"Ecrivez votre message...",send:"Envoyer",close:"Fermer",open:"Ouvrir le chat",poweredBy:"Propulsé par",error:"Désolé, je rencontre un problème technique. Veuillez réessayer.",newChat:"Nouvelle conversation",longConversation:"La conversation devient longue. Cliquez sur + pour démarrer une nouvelle conversation.",humanAgent:"Conseiller en ligne",aiAssistant:"Assistant IA",offline:"Hors ligne",startChat:"Démarrer le chat",rateTitle:"Comment était votre expérience?",rateComment:"Un commentaire? (optionnel)",rateSubmit:"Envoyer",rateSkip:"Passer",rateThanks:"Merci pour votre retour!",transcriptTitle:"Recevoir la transcription par email",transcriptSend:"Envoyer",transcriptSent:"Email envoyé!",transcriptError:"Erreur d'envoi"},en:{placeholder:"Type your message...",send:"Send",close:"Close",open:"Open chat",poweredBy:"Powered by",error:"Sorry, I'm having a technical issue. Please try again.",newChat:"New conversation",longConversation:"Conversation is getting long. Click + to start a fresh chat.",humanAgent:"Live Agent",aiAssistant:"AI Assistant",offline:"Offline",startChat:"Start Chat",rateTitle:"How was your experience?",rateComment:"Any comments? (optional)",rateSubmit:"Submit",rateSkip:"Skip",rateThanks:"Thanks for your feedback!",transcriptTitle:"Get transcript via email",transcriptSend:"Send",transcriptSent:"Email sent!",transcriptError:"Send failed"}};class w{constructor(e){o(this,"chat");o(this,"container",null);o(this,"messagesContainer",null);o(this,"input",null);o(this,"fileInput",null);o(this,"imagePreview",null);o(this,"isOpen",!1);o(this,"businessName","Chat");o(this,"welcomeMessage","Bonjour! Comment puis-je vous aider?");o(this,"welcomeMessageEn","Hello! How can I help you?");o(this,"language","fr");o(this,"pendingImage",null);o(this,"widgetSettings",{primary_color:"#0ea5e9",position:"bottom-right",welcome_message_language:"auto"});o(this,"quickActionsShown",!1);o(this,"messageCount",0);o(this,"longConversationWarningShown",!1);o(this,"MAX_MESSAGES_BEFORE_WARNING",15);o(this,"isBusinessOnline",!0);o(this,"awayMessage","");o(this,"awayMessageEn","");o(this,"leadCaptureConfig",null);o(this,"leadCaptureCompleted",!1);this.chat=new h(e.businessId,e.apiUrl)}get t(){return M[this.language]}detectLanguage(){return navigator.language.toLowerCase().startsWith("fr")?"fr":"en"}darkenColor(e,t){const n=parseInt(e.replace("#",""),16),a=Math.round(2.55*t),r=Math.max(0,(n>>16)-a),i=Math.max(0,(n>>8&255)-a),s=Math.max(0,(n&255)-a);return`#${((1<<24)+(r<<16)+(i<<8)+s).toString(16).slice(1)}`}async init(){this.injectStyles();try{const t=await this.chat.getBusinessInfo();this.businessName=t.name,this.welcomeMessage=t.welcome_message,this.welcomeMessageEn=t.welcome_message_en||t.welcome_message,this.widgetSettings=t.widget_settings||this.widgetSettings,this.isBusinessOnline=t.is_online!==!1,this.awayMessage=t.away_message||"",this.awayMessageEn=t.away_message_en||"",this.leadCaptureConfig=t.lead_capture_config||null,this.widgetSettings.welcome_message_language==="auto"?this.language=this.detectLanguage():this.widgetSettings.welcome_message_language==="en"?this.language="en":this.language="fr"}catch(t){console.error("Raven: Failed to load business info",t)}this.createWidget(),this.applySettings(),this.isBusinessOnline||this.showAwayBanner();const e=this.language==="en"?this.welcomeMessageEn:this.welcomeMessage;this.addMessage("assistant",e),this.showQuickActions()}applySettings(){if(!this.container)return;const e=this.widgetSettings.primary_color||"#0ea5e9",t=this.darkenColor(e,15);this.container.style.setProperty("--raven-primary",e),this.container.style.setProperty("--raven-primary-dark",t),this.widgetSettings.position==="bottom-left"&&this.container.classList.add("position-left")}injectStyles(){const e=document.createElement("style");e.id="raven-widget-styles",e.textContent=g,document.head.appendChild(e)}createWidget(){this.container=document.createElement("div"),this.container.id="raven-widget-container";const e=document.createElement("div");e.id="raven-chat-window";const t=document.createElement("div");t.id="raven-chat-header",t.innerHTML=`
      <div style="display: flex; flex-direction: column;">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <div id="raven-agent-status" style="font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 4px;">
          <span id="raven-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${this.isBusinessOnline?"#22c55e":"#9ca3af"};"></span>
          <span id="raven-status-text">${this.isBusinessOnline?this.t.aiAssistant:this.t.offline}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button id="raven-new-chat-button" aria-label="${this.t.newChat}" title="${this.t.newChat}" style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white;">${I}</button>
        <button id="raven-close-button" aria-label="${this.t.close}">${y}</button>
      </div>
    `,this.messagesContainer=document.createElement("div"),this.messagesContainer.id="raven-messages",this.imagePreview=document.createElement("div"),this.imagePreview.id="raven-image-preview";const n=document.createElement("div");n.id="raven-input-container",n.innerHTML=`
      <input type="file" id="raven-file-input" accept="image/*" />
      <button id="raven-image-button" aria-label="Add image">${k}</button>
      <textarea id="raven-input" placeholder="${this.t.placeholder}" rows="1"></textarea>
      <button id="raven-send-button" aria-label="${this.t.send}">${C}</button>
    `;const a=document.createElement("div");a.id="raven-powered-by",a.innerHTML=`${this.t.poweredBy} <a href="https://raven.cm" target="_blank">Raven</a>`,e.appendChild(t),e.appendChild(this.messagesContainer),e.appendChild(this.imagePreview),e.appendChild(n),e.appendChild(a);const r=document.createElement("button");r.id="raven-chat-button",r.innerHTML=u,r.setAttribute("aria-label",this.t.open),this.container.appendChild(e),this.container.appendChild(r),document.body.appendChild(this.container),this.input=document.getElementById("raven-input"),this.fileInput=document.getElementById("raven-file-input"),this.addEventListeners()}addEventListeners(){var i,s,l;const e=document.getElementById("raven-chat-button");e==null||e.addEventListener("click",()=>this.toggle());const t=document.getElementById("raven-close-button");t==null||t.addEventListener("click",()=>this.close());const n=document.getElementById("raven-new-chat-button");n==null||n.addEventListener("click",()=>this.startNewChat());const a=document.getElementById("raven-send-button");a==null||a.addEventListener("click",()=>this.sendMessage()),(i=this.input)==null||i.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&(d.preventDefault(),this.sendMessage())}),(s=this.input)==null||s.addEventListener("input",()=>this.autoResizeInput());const r=document.getElementById("raven-image-button");r==null||r.addEventListener("click",()=>{var d;return(d=this.fileInput)==null?void 0:d.click()}),(l=this.fileInput)==null||l.addEventListener("change",d=>this.handleFileSelect(d))}handleFileSelect(e){var r;const n=(r=e.target.files)==null?void 0:r[0];if(!n)return;if(!n.type.startsWith("image/")){alert("Please select an image file");return}if(n.size>10*1024*1024){alert("Image too large. Max size: 10MB");return}const a=new FileReader;a.onload=i=>{var l;const s=(l=i.target)==null?void 0:l.result;this.pendingImage={file:n,previewUrl:s},this.showImagePreview(s,n.name)},a.readAsDataURL(n)}showImagePreview(e,t){if(!this.imagePreview)return;this.imagePreview.innerHTML=`
      <img src="${e}" alt="Preview" />
      <span>${this.escapeHtml(t)}</span>
      <button id="raven-remove-image" aria-label="Remove">${E}</button>
    `,this.imagePreview.classList.add("has-image");const n=document.getElementById("raven-remove-image");n==null||n.addEventListener("click",()=>this.clearPendingImage())}clearPendingImage(){this.pendingImage=null,this.fileInput&&(this.fileInput.value=""),this.imagePreview&&(this.imagePreview.innerHTML="",this.imagePreview.classList.remove("has-image"))}toggle(){this.isOpen?this.close():this.open()}open(){var n,a;const e=document.getElementById("raven-chat-window"),t=document.getElementById("raven-chat-button");e==null||e.classList.add("open"),t==null||t.classList.add("hidden"),this.isOpen=!0,(n=this.leadCaptureConfig)!=null&&n.enabled&&!this.leadCaptureCompleted?this.showLeadCaptureForm():(a=this.input)==null||a.focus()}close(){var n,a,r;const e=document.getElementById("raven-chat-window"),t=document.getElementById("raven-chat-button");e==null||e.classList.remove("open"),t==null||t.classList.remove("hidden"),this.isOpen=!1,this.chat.clearConversation(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.messageCount=0,this.quickActionsShown=!1,this.longConversationWarningShown=!1,this.leadCaptureCompleted=!1,(n=document.getElementById("raven-lead-capture-overlay"))==null||n.remove(),(a=document.getElementById("raven-end-overlay"))==null||a.remove(),(r=document.getElementById("raven-away-banner"))==null||r.remove()}startNewChat(){var t,n;this.chat.clearConversation(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),(t=document.getElementById("raven-lead-capture-overlay"))==null||t.remove(),(n=document.getElementById("raven-end-overlay"))==null||n.remove(),this.messageCount=0,this.longConversationWarningShown=!1,this.quickActionsShown=!1,this.updateAgentStatus(!1);const e=this.language==="en"?this.welcomeMessageEn:this.welcomeMessage;this.addMessage("assistant",e),this.showQuickActions()}addMessage(e,t,n){if(!this.messagesContainer)return;this.messageCount++;const a=document.createElement("div");a.className=`raven-message ${e}`;const r=document.createElement("span");if(r.textContent=t,a.appendChild(r),n&&n.length>0){for(const i of n)if(i.type==="image"){const s=document.createElement("img");s.src=i.url,s.alt=i.filename||"Image",s.onclick=()=>window.open(i.url,"_blank"),a.appendChild(s)}}this.messagesContainer.appendChild(a),this.scrollToBottom(),this.messageCount>=this.MAX_MESSAGES_BEFORE_WARNING&&!this.longConversationWarningShown&&this.showLongConversationWarning()}showLongConversationWarning(){if(!this.messagesContainer||this.longConversationWarningShown)return;const e=document.createElement("div");e.className="raven-warning-message",e.style.cssText="background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin: 8px 0; text-align: center;",e.textContent=this.t.longConversation,this.messagesContainer.appendChild(e),this.scrollToBottom(),this.longConversationWarningShown=!0}showTyping(){if(!this.messagesContainer)return document.createElement("div");const e=document.createElement("div");return e.className="raven-typing",e.innerHTML="<span></span><span></span><span></span>",this.messagesContainer.appendChild(e),this.scrollToBottom(),e}removeTyping(e){e.remove()}scrollToBottom(){this.messagesContainer&&(this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight)}async sendMessage(){var l;if(!this.input)return;const e=this.input.value.trim(),t=!!this.pendingImage;if(!e&&!t)return;this.input.value="",this.input.style.height="auto";let n,a;this.pendingImage&&(a=this.pendingImage.previewUrl),a?this.addMessage("user",e||"📷",[{type:"image",url:a,filename:(l=this.pendingImage)==null?void 0:l.file.name}]):this.addMessage("user",e);const r=this.showTyping(),i=document.getElementById("raven-send-button"),s=document.getElementById("raven-image-button");this.input.disabled=!0,i&&(i.disabled=!0),s&&(s.disabled=!0);try{this.pendingImage&&(n=[await this.chat.uploadImage(this.pendingImage.file)],this.clearPendingImage());const d=await this.chat.sendMessage(e||"📷 Image",n);this.removeTyping(r),this.updateAgentStatus(d.isHumanTakeover),this.addMessage("assistant",d.message),d.availableSlots&&d.availableSlots.length>0&&this.showSlotButtons(d.availableSlots),d.shouldClose&&setTimeout(()=>{this.showEndOfConversationOverlay()},1500)}catch(d){console.error("Raven: Failed to send message",d),this.removeTyping(r),this.addMessage("assistant",this.t.error)}finally{this.input.disabled=!1,i&&(i.disabled=!1),s&&(s.disabled=!1),this.input.focus()}}autoResizeInput(){if(!this.input)return;this.input.style.height="auto";const t=Math.min(this.input.scrollHeight,120);this.input.style.height=`${t}px`}showQuickActions(){if(this.quickActionsShown||!this.messagesContainer)return;const e=document.createElement("div");e.className="raven-quick-actions",(this.language==="en"?[{icon:"❓",label:"View FAQ",message:"Can you show me your frequently asked questions?"},{icon:"📅",label:"Book Appointment",message:"I would like to book an appointment"}]:[{icon:"❓",label:"Voir FAQ",message:"Pouvez-vous me montrer les questions fréquentes?"},{icon:"📅",label:"Prendre RDV",message:"Je voudrais prendre un rendez-vous"}]).forEach(n=>{const a=document.createElement("button");a.className="raven-quick-action-btn",a.innerHTML=`<span class="icon">${n.icon}</span><span>${this.escapeHtml(n.label)}</span>`,a.onclick=()=>{this.input&&(this.input.value=n.message,this.sendMessage()),e.remove(),this.quickActionsShown=!1},e.appendChild(a)}),this.messagesContainer.appendChild(e),this.scrollToBottom(),this.quickActionsShown=!0}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}updateAgentStatus(e){const t=document.getElementById("raven-status-dot"),n=document.getElementById("raven-status-text");t&&n&&(e?(t.style.background="#f59e0b",n.innerHTML=`${S} ${this.t.humanAgent}`):(t.style.background="#22c55e",n.textContent=this.t.aiAssistant))}showSlotButtons(e){if(!this.messagesContainer)return;const t=this.widgetSettings.primary_color||"#0ea5e9",n=this.messagesContainer.querySelector(".raven-slot-buttons");n&&n.remove();const a=document.createElement("div");a.className="raven-slot-buttons",a.style.cssText=`
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px;
      margin-bottom: 8px;
    `,e.forEach(r=>{const i=document.createElement("button");i.style.cssText=`
        background: white;
        border: 1px solid ${t};
        color: ${t};
        padding: 8px 12px;
        border-radius: 16px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      `,i.textContent=r.display,i.onmouseenter=()=>{i.style.background=t,i.style.color="white"},i.onmouseleave=()=>{i.style.background="white",i.style.color=t},i.onclick=()=>{this.input&&(this.input.value=r.display,a.remove(),this.sendMessage())},a.appendChild(i)}),this.messagesContainer.appendChild(a),this.scrollToBottom()}showLeadCaptureForm(){if(!this.leadCaptureConfig||!this.container)return;const e=document.createElement("div");e.id="raven-lead-capture-overlay",e.className="raven-lead-capture-overlay";const t=this.leadCaptureConfig.fields.filter(s=>s.enabled),n=this.widgetSettings.primary_color||"#0ea5e9";let a="";for(const s of t){const l=this.language==="en"?s.label_en:s.label_fr,d=s.name==="email"?"email":s.name==="phone"?"tel":"text";a+=`
        <div class="raven-field">
          <label>${this.escapeHtml(l)}${s.required?" *":""}</label>
          <input type="${d}" data-field="${s.name}" ${s.required?"required":""} placeholder="${this.escapeHtml(l)}" />
        </div>
      `}e.innerHTML=`
      <div class="raven-lead-capture-content">
        <h3>${this.escapeHtml(this.businessName)}</h3>
        <p>${this.language==="en"?"Please introduce yourself to start chatting":"Présentez-vous pour démarrer le chat"}</p>
        <form id="raven-lead-form">
          ${a}
          <button type="submit" style="background: ${n};">${this.t.startChat}</button>
        </form>
      </div>
    `;const r=document.getElementById("raven-chat-window");r==null||r.appendChild(e);const i=document.getElementById("raven-lead-form");i==null||i.addEventListener("submit",s=>{var v;s.preventDefault();const l=e.querySelectorAll("input[data-field]");let d=null,c=null,p=null;l.forEach(b=>{const f=b,x=f.getAttribute("data-field");x==="name"&&(d=f.value.trim()||null),x==="email"&&(c=f.value.trim()||null),x==="phone"&&(p=f.value.trim()||null)}),this.chat.setVisitorInfo(d,c,p),this.leadCaptureCompleted=!0,e.remove(),(v=this.input)==null||v.focus()})}showEndOfConversationOverlay(){var d;if(!this.container)return;(d=document.getElementById("raven-end-overlay"))==null||d.remove();const e=document.createElement("div");e.id="raven-end-overlay",e.className="raven-end-overlay";const t=this.widgetSettings.primary_color||"#0ea5e9",n=this.chat.getVisitorEmail()||"";e.innerHTML=`
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
    `;const a=document.getElementById("raven-chat-window");a==null||a.appendChild(e);let r=null;e.querySelectorAll(".raven-rate-btn").forEach(c=>{c.addEventListener("click",()=>{e.querySelectorAll(".raven-rate-btn").forEach(p=>p.classList.remove("selected")),c.classList.add("selected"),r=c.getAttribute("data-rating")})});const i=document.getElementById("raven-transcript-send");i==null||i.addEventListener("click",async()=>{const c=document.getElementById("raven-transcript-email"),p=document.getElementById("raven-transcript-status"),v=c==null?void 0:c.value.trim();if(v)try{const b=await this.chat.emailTranscript(v);p&&(p.textContent=b?this.t.transcriptSent:this.t.transcriptError,p.style.color=b?"#22c55e":"#ef4444")}catch{p&&(p.textContent=this.t.transcriptError,p.style.color="#ef4444")}});const s=document.getElementById("raven-rate-submit");s==null||s.addEventListener("click",async()=>{var c;if(r){const p=(c=document.getElementById("raven-rate-comment"))==null?void 0:c.value.trim();await this.chat.rateConversation(r,p||void 0)}e.remove(),this.close()});const l=document.getElementById("raven-rate-skip");l==null||l.addEventListener("click",()=>{e.remove(),this.close()})}showAwayBanner(){if(!this.messagesContainer)return;const e=document.createElement("div");e.id="raven-away-banner",e.className="raven-away-banner";const t=this.language==="en"?this.awayMessageEn:this.awayMessage;e.textContent=t||(this.language==="en"?"We are currently unavailable. Leave us a message and we will get back to you.":"Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons."),this.messagesContainer.insertBefore(e,this.messagesContainer.firstChild)}}(function(){const m=window.RAVEN_CONFIG;if(!m){console.error("Raven: Missing RAVEN_CONFIG. Please set window.RAVEN_CONFIG before loading the widget.");return}if(!m.businessId){console.error("Raven: Missing businessId in RAVEN_CONFIG");return}if(!m.apiUrl){console.error("Raven: Missing apiUrl in RAVEN_CONFIG");return}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new w(m).init()}):new w(m).init()})()})();
