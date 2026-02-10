#!/usr/bin/env python3
"""
Update Raven Support with proper FAQs and product information.
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.services.database import get_supabase_client

def update_support_content():
    """Update Raven Support with proper content."""
    client = get_supabase_client()

    support_id = "f2939e5f-9367-4110-9113-60748fc2cddb"

    # Prepare comprehensive support content
    support_data = {
        'welcome_message': "👋 Bienvenue sur Raven Support ! Comment puis-je vous aider aujourd'hui ?",
        'welcome_message_en': "👋 Welcome to Raven Support! How can I help you today?",
        'faqs': [
            {
                "question": "Qu'est-ce que Raven Support ?",
                "answer": "Raven Support est une plateforme de chatbot IA qui aide les entreprises au Cameroun à automatiser leurs conversations clients sur leur site web et WhatsApp. Notre IA répond instantanément aux questions de vos clients 24h/24, en français et en anglais."
            },
            {
                "question": "What is Raven Support?",
                "answer": "Raven Support is an AI-powered chatbot platform that helps businesses in Cameroon automate customer conversations on their website and WhatsApp. Our AI answers your customers' questions instantly 24/7, in French and English."
            },
            {
                "question": "Combien ça coûte ?",
                "answer": "Les prix commencent à 10 000 CFA par mois pour le plan Basic. Le plan Professional est à 25 000 CFA par mois et inclut WhatsApp, analytics avancés, et support prioritaire. Visitez notre site pour voir tous les plans."
            },
            {
                "question": "How much does it cost?",
                "answer": "Pricing starts at 10,000 CFA per month for the Basic plan. The Professional plan is 25,000 CFA per month and includes WhatsApp integration, advanced analytics, and priority support. Visit our website to see all plans."
            },
            {
                "question": "Comment démarrer ?",
                "answer": "C'est simple ! 1) Créez un compte gratuit 2) Configurez votre profil d'entreprise 3) Ajoutez vos FAQs et produits 4) Copiez le code du widget sur votre site. Ça prend moins de 10 minutes !"
            },
            {
                "question": "How do I get started?",
                "answer": "It's simple! 1) Create a free account 2) Set up your business profile 3) Add your FAQs and products 4) Copy the widget code to your website. It takes less than 10 minutes!"
            },
            {
                "question": "Quelles langues supportez-vous ?",
                "answer": "Raven Support fonctionne en français et en anglais, vous permettant de servir tous vos clients dans leur langue préférée. Le chatbot détecte automatiquement la langue du client."
            },
            {
                "question": "What languages do you support?",
                "answer": "Raven Support works in both French and English, allowing you to serve all your customers in their preferred language. The chatbot automatically detects the customer's language."
            },
            {
                "question": "Puis-je intégrer avec WhatsApp ?",
                "answer": "Oui ! L'intégration WhatsApp est disponible avec le plan Professional. Cela vous permet d'automatiser vos conversations WhatsApp Business avec le même chatbot intelligent."
            },
            {
                "question": "Can I integrate with WhatsApp?",
                "answer": "Yes! WhatsApp integration is available with the Professional plan. This allows you to automate your WhatsApp Business conversations with the same intelligent chatbot."
            },
            {
                "question": "Offrez-vous un essai gratuit ?",
                "answer": "Oui ! Vous pouvez créer un compte et tester toutes les fonctionnalités gratuitement. Aucune carte bancaire requise pour commencer."
            },
            {
                "question": "Do you offer a free trial?",
                "answer": "Yes! You can create an account and test all features for free. No credit card required to get started."
            },
            {
                "question": "Comment obtenir de l'aide ?",
                "answer": "Vous pouvez nous contacter directement via ce chat ! Nous sommes là pour répondre à toutes vos questions. Vous pouvez aussi nous envoyer un email à support@ravensupport.cm"
            },
            {
                "question": "How do I get help?",
                "answer": "You can contact us directly via this chat! We're here to answer all your questions. You can also email us at support@ravensupport.cm"
            }
        ],
        'products': [
            {
                "name": "Plan Basic",
                "price": "10 000 CFA/mois",
                "description": "Parfait pour les petites entreprises. Inclut chatbot IA, analytics de base, support email, et jusqu'à 500 conversations/mois."
            },
            {
                "name": "Basic Plan",
                "price": "10,000 CFA/month",
                "description": "Perfect for small businesses. Includes AI chatbot, basic analytics, email support, and up to 500 conversations/month."
            },
            {
                "name": "Plan Professional",
                "price": "25 000 CFA/mois",
                "description": "Pour les entreprises en croissance. Inclut tout du Basic + WhatsApp, analytics avancés, membres d'équipe, prise de rendez-vous, conversations illimitées, et support prioritaire."
            },
            {
                "name": "Professional Plan",
                "price": "25,000 CFA/month",
                "description": "For growing businesses. Includes everything in Basic + WhatsApp integration, advanced analytics, team members, appointment booking, unlimited conversations, and priority support."
            }
        ],
        'custom_instructions': "Vous êtes l'assistant support de Raven Support. Soyez amical, professionnel et utile. Répondez toujours dans la langue du client (français ou anglais). Si on vous pose une question qui n'est pas dans les FAQs, dites poliment que vous allez transmettre la question à l'équipe qui reviendra vers eux avec plus de détails. Encouragez les utilisateurs à créer un compte pour essayer gratuitement."
    }

    print("🔄 Updating Raven Support content...")

    result = client.table('business_configs').update(support_data).eq('business_id', support_id).execute()

    if result.data:
        print("✅ Content updated successfully!")
        print(f"\n📊 Raven Support now has:")
        print(f"   - {len(support_data['faqs'])} FAQs (bilingual)")
        print(f"   - {len(support_data['products'])} Products (bilingual)")
        print(f"   - Custom AI instructions configured")
        print(f"\n🔗 Business ID: {support_id}")
        print(f"\n✨ The widget is now ready to provide proper support!")
        return True
    else:
        print("❌ Update failed")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  Update Raven Support Content")
    print("=" * 60)
    print()

    success = update_support_content()

    if not success:
        sys.exit(1)
