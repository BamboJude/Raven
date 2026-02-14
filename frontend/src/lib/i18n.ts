/**
 * Simple internationalization (i18n) for Raven.
 * Supports French and English.
 */

export type Language = "fr" | "en";

export const translations = {
  fr: {
    // Navigation
    nav: {
      login: "Connexion",
      signup: "Commencer gratuitement",
      dashboard: "Tableau de bord",
      logout: "Déconnexion",
      profile: "Profil",
    },
    // Landing page
    landing: {
      title: "Un assistant IA pour votre entreprise",
      subtitle:
        "Raven Support est un chatbot intelligent qui répond aux questions de vos clients 24h/24, en français et anglais. Intégrez-le sur votre site web ou WhatsApp en quelques minutes.",
      tryFree: "Essayer gratuitement",
      learnMore: "En savoir plus",
      whyChoose: "Pourquoi choisir Raven Support?",
      feature1Title: "Réponses 24h/24",
      feature1Desc:
        "Votre chatbot répond instantanément aux questions de vos clients, même la nuit et le weekend.",
      feature2Title: "Français & Anglais",
      feature2Desc:
        "Communiquez avec tous vos clients dans leur langue préférée, sans effort supplémentaire.",
      feature3Title: "Configuration rapide",
      feature3Desc:
        "Ajoutez vos FAQs et produits, et intégrez le widget sur votre site en moins de 10 minutes.",
      pricing: "Tarifs accessibles",
      priceFrom: "À partir de",
      startNow: "Commencer maintenant",
      footer: "Fait avec cœur au Cameroun",
    },
    // Auth
    auth: {
      loginTitle: "Connexion",
      signupTitle: "Créer un compte",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      loginButton: "Se connecter",
      signupButton: "Créer mon compte",
      noAccount: "Pas encore de compte?",
      hasAccount: "Déjà un compte?",
      createAccount: "Créer un compte",
      loginLink: "Se connecter",
      passwordMinLength: "Au moins 6 caractères",
      repeatPassword: "Répéter le mot de passe",
      loggingIn: "Connexion...",
      creating: "Création...",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
    },
    // Dashboard
    dashboard: {
      title: "Tableau de bord",
      newBusiness: "+ Nouvelle entreprise",
      noBusiness: "Aucune entreprise configurée",
      noBusinessDesc:
        "Commencez par configurer votre première entreprise pour activer votre chatbot.",
      setupBusiness: "Configurer mon entreprise",
      modify: "Modifier",
      widget: "Widget",
      conversations: "Conversations",
      conversationsDesc: "Voir les conversations de vos clients",
      widgetDesc: "Obtenir le code à intégrer sur votre site",
      french: "Français",
      english: "English",
      team: "Équipe",
      teamDesc: "Gérer les membres et les rôles de l'équipe",
    },
    // Setup
    setup: {
      title: "Configurer votre entreprise",
      editTitle: "Modifier l'entreprise",
      basicInfo: "Informations de base",
      businessName: "Nom de l'entreprise",
      businessNamePlaceholder: "Ex: Hotel Belle Vue",
      description: "Description",
      descriptionPlaceholder:
        "Décrivez votre entreprise, vos services, vos horaires...",
      descriptionHelp:
        "Cette description aide le chatbot à mieux répondre aux questions.",
      language: "Langue principale",
      welcomeMessage: "Message d'accueil",
      welcomeMessagePlaceholder: "Bonjour! Comment puis-je vous aider?",
      faq: "Questions fréquentes (FAQ)",
      faqDesc: "Ajoutez les questions que vos clients posent souvent.",
      question: "Question",
      questionPlaceholder: "Ex: Quels sont vos horaires?",
      answerPlaceholder:
        "Ex: Nous sommes ouverts du lundi au samedi, de 8h à 18h.",
      addQuestion: "+ Ajouter une question",
      products: "Produits / Services",
      productsDesc: "Ajoutez vos produits ou services principaux.",
      product: "Produit",
      productName: "Nom du produit",
      productPrice: "Prix (ex: 5000 CFA)",
      productDesc: "Description du produit ou service",
      addProduct: "+ Ajouter un produit",
      customInstructions: "Instructions personnalisées (optionnel)",
      customInstructionsDesc:
        "Ajoutez des instructions spécifiques pour votre chatbot.",
      customInstructionsPlaceholder:
        "Ex: Toujours recommander de prendre rendez-vous pour les consultations.",
      cancel: "Annuler",
      save: "Enregistrer",
      saving: "Enregistrement...",
      delete: "Supprimer",
    },
    // Conversations
    convos: {
      title: "Conversations",
      noConversations: "Aucune conversation",
      noConversationsDesc:
        "Les conversations avec vos clients apparaîtront ici.",
      visitor: "Visiteur",
      messages: "Messages",
      selectConversation: "Sélectionnez une conversation",
    },
    // Widget page
    widgetPage: {
      title: "Widget",
      howToIntegrate: "Comment intégrer le widget",
      step1: 'Copiez le code ci-dessous en cliquant sur le bouton "Copier"',
      step2: "Collez ce code juste avant la balise </body> de votre site web",
      step3: "Enregistrez et publiez votre site",
      step4:
        "Le widget de chat apparaîtra automatiquement en bas à droite de votre site",
      embedCode: "Code à intégrer",
      copy: "Copier",
      copied: "Copié!",
      testWidget: "Tester le widget",
      testDesc: "Pour tester le widget localement, vous devez d'abord:",
      preview: "Aperçu",
      previewDesc: "L'aperçu sera disponible une fois le widget démarré",
      productionNote:
        "En production, vous devrez héberger le fichier widget sur un CDN ou votre propre serveur.",
    },
    // Lead Capture
    leadCapture: {
      title: "Capture de leads",
      description: "Collectez les informations des visiteurs avant le début du chat.",
      enable: "Activer le formulaire de capture",
    },
    // Away Mode
    awayMode: {
      title: "Mode Absent",
      description: "Affichez un message d'absence lorsque vous n'êtes pas disponible.",
      toggle: "Marquer comme absent",
      messageFr: "Message d'absence (Français)",
      messageEn: "Message d'absence (English)",
    },
    // Common
    common: {
      loading: "Chargement...",
      error: "Une erreur est survenue",
      required: "Requis",
    },
  },
  en: {
    // Navigation
    nav: {
      login: "Login",
      signup: "Get Started Free",
      dashboard: "Dashboard",
      logout: "Logout",
      profile: "Profile",
    },
    // Landing page
    landing: {
      title: "An AI Assistant for Your Business",
      subtitle:
        "Raven Support is an intelligent chatbot that answers your customers' questions 24/7, in French and English. Integrate it on your website or WhatsApp in minutes.",
      tryFree: "Try Free",
      learnMore: "Learn More",
      whyChoose: "Why Choose Raven Support?",
      feature1Title: "24/7 Responses",
      feature1Desc:
        "Your chatbot instantly answers customer questions, even at night and on weekends.",
      feature2Title: "French & English",
      feature2Desc:
        "Communicate with all your customers in their preferred language, effortlessly.",
      feature3Title: "Quick Setup",
      feature3Desc:
        "Add your FAQs and products, and integrate the widget on your site in under 10 minutes.",
      pricing: "Affordable Pricing",
      priceFrom: "Starting at",
      startNow: "Start Now",
      footer: "Made with love in Cameroon",
    },
    // Auth
    auth: {
      loginTitle: "Login",
      signupTitle: "Create Account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      loginButton: "Sign In",
      signupButton: "Create Account",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createAccount: "Create Account",
      loginLink: "Sign In",
      passwordMinLength: "At least 6 characters",
      repeatPassword: "Repeat password",
      loggingIn: "Signing in...",
      creating: "Creating...",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      newBusiness: "+ New Business",
      noBusiness: "No business configured",
      noBusinessDesc:
        "Start by setting up your first business to activate your chatbot.",
      setupBusiness: "Set Up My Business",
      modify: "Edit",
      widget: "Widget",
      conversations: "Conversations",
      conversationsDesc: "View your customer conversations",
      widgetDesc: "Get the embed code for your site",
      french: "Français",
      english: "English",
      team: "Team",
      teamDesc: "Manage team members and roles",
    },
    // Setup
    setup: {
      title: "Set Up Your Business",
      editTitle: "Edit Business",
      basicInfo: "Basic Information",
      businessName: "Business Name",
      businessNamePlaceholder: "Ex: Hotel Belle Vue",
      description: "Description",
      descriptionPlaceholder:
        "Describe your business, services, hours...",
      descriptionHelp:
        "This description helps the chatbot better answer questions.",
      language: "Primary Language",
      welcomeMessage: "Welcome Message",
      welcomeMessagePlaceholder: "Hello! How can I help you?",
      faq: "Frequently Asked Questions (FAQ)",
      faqDesc: "Add questions your customers often ask.",
      question: "Question",
      questionPlaceholder: "Ex: What are your hours?",
      answerPlaceholder:
        "Ex: We are open Monday to Saturday, 8am to 6pm.",
      addQuestion: "+ Add Question",
      products: "Products / Services",
      productsDesc: "Add your main products or services.",
      product: "Product",
      productName: "Product name",
      productPrice: "Price (ex: 5000 CFA)",
      productDesc: "Product or service description",
      addProduct: "+ Add Product",
      customInstructions: "Custom Instructions (optional)",
      customInstructionsDesc:
        "Add specific instructions for your chatbot.",
      customInstructionsPlaceholder:
        "Ex: Always recommend booking an appointment for consultations.",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      delete: "Delete",
    },
    // Conversations
    convos: {
      title: "Conversations",
      noConversations: "No conversations",
      noConversationsDesc:
        "Customer conversations will appear here.",
      visitor: "Visitor",
      messages: "Messages",
      selectConversation: "Select a conversation",
    },
    // Widget page
    widgetPage: {
      title: "Widget",
      howToIntegrate: "How to Integrate the Widget",
      step1: 'Copy the code below by clicking the "Copy" button',
      step2: "Paste this code just before the </body> tag on your website",
      step3: "Save and publish your site",
      step4:
        "The chat widget will automatically appear in the bottom right of your site",
      embedCode: "Embed Code",
      copy: "Copy",
      copied: "Copied!",
      testWidget: "Test the Widget",
      testDesc: "To test the widget locally, you first need to:",
      preview: "Preview",
      previewDesc: "Preview will be available once the widget is running",
      productionNote:
        "In production, you'll need to host the widget file on a CDN or your own server.",
    },
    // Lead Capture
    leadCapture: {
      title: "Lead Capture",
      description: "Collect visitor information before the chat starts.",
      enable: "Enable lead capture form",
    },
    // Away Mode
    awayMode: {
      title: "Away Mode",
      description: "Show an away message when you're not available.",
      toggle: "Mark as away",
      messageFr: "Away message (French)",
      messageEn: "Away message (English)",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "An error occurred",
      required: "Required",
    },
  },
};

// Get stored language or default to English
export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("raven_language") as Language) || "en";
}

// Store language preference
export function setStoredLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("raven_language", lang);
}

// Get translations for a language
export function t(lang: Language) {
  return translations[lang];
}
