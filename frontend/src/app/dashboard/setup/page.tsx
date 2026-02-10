"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, type FAQ, type Product, type LeadCaptureField } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { ChatToggle } from "@/components/ChatToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");

  // Business fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("en");
  const [welcomeMessage, setWelcomeMessage] = useState("Bonjour! Comment puis-je vous aider?");
  const [welcomeMessageEn, setWelcomeMessageEn] = useState("Hello! How can I help you?");
  const [customInstructions, setCustomInstructions] = useState("");

  // Widget settings
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [widgetPosition, setWidgetPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [widgetLanguage, setWidgetLanguage] = useState<"auto" | "fr" | "en">("auto");

  // Lead capture
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [leadCaptureFields, setLeadCaptureFields] = useState<LeadCaptureField[]>([
    { name: "name", label_fr: "Nom", label_en: "Name", required: true, enabled: true },
    { name: "email", label_fr: "Email", label_en: "Email", required: true, enabled: true },
    { name: "phone", label_fr: "Téléphone", label_en: "Phone", required: false, enabled: false },
  ]);

  // Away mode
  const [manualAway, setManualAway] = useState(false);
  const [awayMessage, setAwayMessage] = useState("Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons.");
  const [awayMessageEn, setAwayMessageEn] = useState("We are currently unavailable. Leave us a message and we will get back to you.");

  // FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: "", answer: "" }]);

  // Products
  const [products, setProducts] = useState<Product[]>([
    { name: "", description: "", price: "" },
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      setUserId(session.user.id);

      if (businessId) {
        setLoading(true);
        try {
          const data = await businessAPI.get(businessId, session.user.id);
          setName(data.name);
          setDescription(data.description);
          setLanguage(data.language);

          if (data.config) {
            setWelcomeMessage(data.config.welcome_message || "Bonjour! Comment puis-je vous aider?");
            setWelcomeMessageEn(data.config.welcome_message_en || "Hello! How can I help you?");
            setCustomInstructions(data.config.custom_instructions || "");
            if (data.config.faqs?.length) setFaqs(data.config.faqs);
            if (data.config.products?.length) setProducts(data.config.products);
            if (data.config.widget_settings) {
              setPrimaryColor(data.config.widget_settings.primary_color || "#0ea5e9");
              setWidgetPosition(data.config.widget_settings.position || "bottom-right");
              setWidgetLanguage(data.config.widget_settings.welcome_message_language || "auto");
            }
            if (data.config.lead_capture_config) {
              setLeadCaptureEnabled(data.config.lead_capture_config.enabled);
              if (data.config.lead_capture_config.fields?.length) {
                setLeadCaptureFields(data.config.lead_capture_config.fields);
              }
            }
            if (data.config.manual_away !== undefined) setManualAway(data.config.manual_away);
            if (data.config.away_message) setAwayMessage(data.config.away_message);
            if (data.config.away_message_en) setAwayMessageEn(data.config.away_message_en);
          }
        } catch (err) {
          console.error("Failed to load business:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [router, businessId]);

  const addFAQ = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFAQ = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addProduct = () => setProducts([...products, { name: "", description: "", price: "" }]);
  const removeProduct = (index: number) => setProducts(products.filter((_, i) => i !== index));
  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validFaqs = faqs.filter((f) => f.question && f.answer);
      const validProducts = products.filter((p) => p.name && p.description);

      const configData = {
        welcome_message: welcomeMessage,
        welcome_message_en: welcomeMessageEn,
        faqs: validFaqs,
        products: validProducts,
        custom_instructions: customInstructions || undefined,
        widget_settings: {
          primary_color: primaryColor,
          position: widgetPosition,
          welcome_message_language: widgetLanguage,
        },
        lead_capture_config: {
          enabled: leadCaptureEnabled,
          fields: leadCaptureFields,
        },
        manual_away: manualAway,
        away_message: awayMessage,
        away_message_en: awayMessageEn,
      };

      if (businessId) {
        await businessAPI.update(businessId, { name, description, language }, userId);
        await businessAPI.updateConfig(businessId, configData, userId);
      } else {
        const newBusiness = await businessAPI.create({ name, description, language }, userId);
        await businessAPI.updateConfig(newBusiness.id, configData, userId);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to save:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raven</span>
          </Link>
          <div className="flex items-center gap-4">
            {businessId && <ChatToggle businessId={businessId} apiUrl={API_URL} />}
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {businessId ? t.setup.editTitle : t.setup.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.setup.basicInfo}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.setup.businessName} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={t.setup.businessNamePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.setup.description} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder={t.setup.descriptionPlaceholder}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t.setup.descriptionHelp}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.setup.language}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
                  className="input"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.setup.welcomeMessage} (Français)
                </label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="input"
                  placeholder="Bonjour! Comment puis-je vous aider?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.setup.welcomeMessage} (English)
                </label>
                <input
                  type="text"
                  value={welcomeMessageEn}
                  onChange={(e) => setWelcomeMessageEn(e.target.value)}
                  className="input"
                  placeholder="Hello! How can I help you?"
                />
              </div>
            </div>
          </div>

          {/* Widget Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "fr" ? "Paramètres du Widget" : "Widget Settings"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "fr"
                ? "Personnalisez l'apparence de votre widget de chat."
                : "Customize the appearance of your chat widget."}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "fr" ? "Couleur principale" : "Primary Color"}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="input w-32"
                    placeholder="#0ea5e9"
                  />
                  <div
                    className="w-10 h-10 rounded-full shadow-md"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "fr" ? "Position du widget" : "Widget Position"}
                </label>
                <select
                  value={widgetPosition}
                  onChange={(e) => setWidgetPosition(e.target.value as "bottom-right" | "bottom-left")}
                  className="input"
                >
                  <option value="bottom-right">
                    {language === "fr" ? "En bas à droite" : "Bottom Right"}
                  </option>
                  <option value="bottom-left">
                    {language === "fr" ? "En bas à gauche" : "Bottom Left"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "fr" ? "Langue du widget" : "Widget Language"}
                </label>
                <select
                  value={widgetLanguage}
                  onChange={(e) => setWidgetLanguage(e.target.value as "auto" | "fr" | "en")}
                  className="input"
                >
                  <option value="auto">
                    {language === "fr" ? "Automatique (navigateur)" : "Auto-detect (browser)"}
                  </option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {language === "fr"
                    ? "Détermine quelle langue utiliser pour le message de bienvenue et l'interface."
                    : "Determines which language to use for the welcome message and interface."}
                </p>
              </div>
            </div>
          </div>

          {/* Lead Capture */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "fr" ? "Capture de leads" : "Lead Capture"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "fr"
                ? "Collectez les informations des visiteurs avant le début du chat."
                : "Collect visitor information before the chat starts."}
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leadCaptureEnabled}
                  onChange={(e) => setLeadCaptureEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {language === "fr" ? "Activer le formulaire de capture" : "Enable lead capture form"}
                </span>
              </label>

              {leadCaptureEnabled && (
                <div className="space-y-3 ml-8">
                  {leadCaptureFields.map((field, idx) => (
                    <div key={field.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          onChange={(e) => {
                            const updated = [...leadCaptureFields];
                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                            setLeadCaptureFields(updated);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                        <span className="text-sm font-medium text-gray-700 w-20">
                          {language === "en" ? field.label_en : field.label_fr}
                        </span>
                      </label>
                      {field.enabled && (
                        <label className="flex items-center gap-2 cursor-pointer ml-auto">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const updated = [...leadCaptureFields];
                              updated[idx] = { ...updated[idx], required: e.target.checked };
                              setLeadCaptureFields(updated);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600"
                          />
                          <span className="text-xs text-gray-500">
                            {language === "fr" ? "Requis" : "Required"}
                          </span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Away Mode */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "fr" ? "Mode Absent" : "Away Mode"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "fr"
                ? "Affichez un message d'absence lorsque vous n'êtes pas disponible."
                : "Show an away message when you're not available."}
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualAway}
                  onChange={(e) => setManualAway(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {language === "fr" ? "Marquer comme absent" : "Mark as away"}
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "fr" ? "Message d'absence (Français)" : "Away message (French)"}
                </label>
                <textarea
                  value={awayMessage}
                  onChange={(e) => setAwayMessage(e.target.value)}
                  className="input min-h-[60px]"
                  placeholder="Nous sommes actuellement indisponibles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "fr" ? "Message d'absence (English)" : "Away message (English)"}
                </label>
                <textarea
                  value={awayMessageEn}
                  onChange={(e) => setAwayMessageEn(e.target.value)}
                  className="input min-h-[60px]"
                  placeholder="We are currently unavailable..."
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.setup.faq}</h2>
            <p className="text-sm text-gray-600 mb-4">{t.setup.faqDesc}</p>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t.setup.question} {index + 1}
                    </span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFAQ(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        {t.setup.delete}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    className="input mb-2"
                    placeholder={t.setup.questionPlaceholder}
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                    className="input min-h-[80px]"
                    placeholder={t.setup.answerPlaceholder}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFAQ}
              className="mt-4 text-primary-600 text-sm font-medium hover:underline"
            >
              {t.setup.addQuestion}
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.setup.products}</h2>
            <p className="text-sm text-gray-600 mb-4">{t.setup.productsDesc}</p>
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t.setup.product} {index + 1}
                    </span>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        {t.setup.delete}
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, "name", e.target.value)}
                      className="input"
                      placeholder={t.setup.productName}
                    />
                    <input
                      type="text"
                      value={product.price || ""}
                      onChange={(e) => updateProduct(index, "price", e.target.value)}
                      className="input"
                      placeholder={t.setup.productPrice}
                    />
                  </div>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateProduct(index, "description", e.target.value)}
                    className="input min-h-[60px]"
                    placeholder={t.setup.productDesc}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addProduct}
              className="mt-4 text-primary-600 text-sm font-medium hover:underline"
            >
              {t.setup.addProduct}
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.setup.customInstructions}</h2>
            <p className="text-sm text-gray-600 mb-4">{t.setup.customInstructionsDesc}</p>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="input min-h-[100px]"
              placeholder={t.setup.customInstructionsPlaceholder}
            />
          </div>

          <div className="flex gap-4">
            <Link href="/dashboard" className="btn-secondary flex-1 text-center">
              {t.setup.cancel}
            </Link>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? t.setup.saving : t.setup.save}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
