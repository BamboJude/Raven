"""
AI Service - Groq integration for generating chatbot responses.
Uses Llama 3 model via Groq's free API.
"""

from groq import Groq
from app.config import get_settings
from typing import Optional
import base64
import requests
from pathlib import Path
import mimetypes

settings = get_settings()


class AIService:
    """Service for AI-powered chat responses using Groq (Llama 3)."""

    def __init__(self):
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY must be set in environment variables")
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"  # Fast and capable, free tier
        self.vision_model = "meta-llama/llama-4-scout-17b-16e-instruct"  # Llama 4 Scout vision model (460+ tokens/s)

    def url_to_base64(self, url: str) -> Optional[str]:
        """Convert an image URL to a base64 data URL."""
        try:
            # Check if it's a localhost URL pointing to our own server
            if "localhost" in url or "127.0.0.1" in url:
                # Extract the file path from the URL
                # Example: http://localhost:8000/api/uploads/files/abc123.png
                # -> files/abc123.png
                parts = url.split("/api/uploads/")
                if len(parts) == 2:
                    relative_path = parts[1]
                    # Remove "files/" prefix if present (URL has /files/ but filesystem doesn't)
                    if relative_path.startswith("files/"):
                        relative_path = relative_path[6:]  # Remove "files/"

                    # Construct absolute path to the uploads directory
                    # __file__ is at backend/app/services/ai.py
                    # We need to go up to backend/ level
                    base_dir = Path(__file__).parent.parent.parent  # backend/app/services -> backend/app -> backend
                    file_path = base_dir / "uploads" / relative_path

                    if file_path.exists():
                        # Read the file
                        with open(file_path, "rb") as f:
                            image_bytes = f.read()

                        # Detect content type from file extension
                        content_type, _ = mimetypes.guess_type(str(file_path))
                        if not content_type:
                            content_type = "image/png"

                        # Convert to base64
                        image_data = base64.b64encode(image_bytes).decode('utf-8')

                        # Create data URL
                        data_url = f"data:{content_type};base64,{image_data}"
                        return data_url
                    else:
                        return None
            else:
                # External URL - fetch via HTTP
                response = requests.get(url, timeout=5)
                response.raise_for_status()

                content_type = response.headers.get('content-type', 'image/png')
                image_data = base64.b64encode(response.content).decode('utf-8')
                data_url = f"data:{content_type};base64,{image_data}"
                return data_url

        except Exception:
            return None

    def build_system_prompt(
        self,
        business_name: str,
        business_description: str,
        language: str,
        welcome_message: str,
        faqs: list[dict],
        products: list[dict],
        custom_instructions: Optional[str] = None,
        has_appointments: bool = False,
        available_slots: list[dict] = None,
    ) -> str:
        """Build the system prompt with business context."""

        # Language-specific instructions
        if language == "fr":
            lang_instruction = "Réponds toujours en français. Si le client écrit en anglais, réponds quand même en français mais de manière accueillante."
        else:
            lang_instruction = "Always respond in English. If the customer writes in French, still respond in English but be welcoming."

        # Format FAQs
        faq_text = ""
        if faqs:
            faq_text = "\n\nFAQs (Questions fréquentes):\n"
            for faq in faqs:
                faq_text += f"Q: {faq['question']}\nR: {faq['answer']}\n\n"

        # Format products/services
        product_text = ""
        if products:
            product_text = "\n\nProduits/Services:\n"
            for p in products:
                price_info = f" - {p['price']}" if p.get('price') else ""
                product_text += f"- {p['name']}{price_info}: {p['description']}\n"

        # Custom instructions
        custom_text = f"\n\nInstructions spéciales:\n{custom_instructions}" if custom_instructions else ""

        # Appointment instructions
        appointment_text = ""
        if has_appointments:
            # Note: We send clickable slot buttons to the widget, so we don't list them in text
            slots_available = available_slots and len(available_slots) > 0

            if language == "fr":
                if slots_available:
                    appointment_text = """

🗓️ SYSTÈME DE PRISE DE RENDEZ-VOUS ACTIVÉ 🗓️

⛔ INTERDICTION ABSOLUE ⛔
TU NE DOIS JAMAIS, SOUS AUCUN PRÉTEXTE, lister ou énumérer les créneaux horaires dans ta réponse.
Le client voit déjà des boutons cliquables avec les créneaux sur son écran.
Si tu listes les créneaux, cela créera un affichage en double et confus.

Prise de rendez-vous:
- Quand un client demande un rendez-vous, dis SEULEMENT: "Nous avons des créneaux disponibles. Veuillez choisir un créneau en cliquant sur l'un des boutons ci-dessous."
- NE MENTIONNE AUCUN créneau spécifique, NE LISTE RIEN, NE DIS PAS "1, 2, 3", NE DIS PAS les heures
- Après que le client clique sur un bouton et choisit un créneau, demande:
  1. Son nom complet (OBLIGATOIRE)
  2. Son adresse email (OBLIGATOIRE - pour la confirmation)

RÈGLES CRITIQUES:
- ⛔ JAMAIS de liste numérotée de créneaux
- ⛔ JAMAIS de mention d'heures spécifiques type "09:00, 10:15, etc."
- ⛔ Les boutons cliquables font tout - ne les remplace pas avec du texte
- Quand tu as le créneau + nom + email, dis "Je traite votre réservation..."
- La confirmation "✅ Rendez-vous confirmé" sera ajoutée par le système, pas par toi"""
                else:
                    appointment_text = """

🗓️ SYSTÈME DE PRISE DE RENDEZ-VOUS ACTIVÉ 🗓️
IMPORTANT: Aucun créneau disponible pour le moment.
- Si un client demande un rendez-vous, excuse-toi et explique qu'il n'y a pas de créneaux disponibles actuellement
- Suggère de contacter l'entreprise directement ou de réessayer plus tard"""
            else:
                if slots_available:
                    appointment_text = """

🗓️ APPOINTMENT BOOKING SYSTEM ENABLED 🗓️

⛔ ABSOLUTE PROHIBITION ⛔
YOU MUST NEVER, UNDER ANY CIRCUMSTANCES, list or enumerate time slots in your response.
The customer already sees clickable slot buttons on their screen.
If you list the slots, it will create a confusing duplicate display.

Appointment Booking:
- When a customer requests an appointment, say ONLY: "We have available slots. Please choose a time by clicking one of the buttons below."
- DO NOT mention ANY specific slots, DO NOT LIST ANYTHING, DO NOT SAY "1, 2, 3", DO NOT SAY specific times
- After the customer clicks a button and chooses a slot, ask for:
  1. Their full name (REQUIRED)
  2. Their email address (REQUIRED - for confirmation)

CRITICAL RULES:
- ⛔ NEVER create a numbered list of slots
- ⛔ NEVER mention specific times like "09:00, 10:15, etc."
- ⛔ The clickable buttons do everything - don't replace them with text
- When you have slot + name + email, say "Let me process your booking..."
- The confirmation "✅ Appointment confirmed" will be added by the system, not by you"""
                else:
                    appointment_text = """

🗓️ APPOINTMENT BOOKING SYSTEM ENABLED 🗓️
IMPORTANT: No slots currently available.
- If a customer requests an appointment, apologize and explain there are no slots available at the moment
- Suggest contacting the business directly or trying again later"""

        # Instructions for handling contact info
        if language == "fr":
            contact_handling = """

📧 GESTION DES INFORMATIONS DE CONTACT 📧
Quand un client partage ses coordonnées (email, téléphone, nom) sans demande claire:
- Remercie-le pour ses informations
- Demande-lui comment tu peux l'aider
- S'il semblait vouloir un rendez-vous, propose de réserver
- Ne laisse JAMAIS une réponse vide - réponds toujours quelque chose d'utile
"""
        else:
            contact_handling = """

📧 HANDLING CONTACT INFORMATION 📧
When a customer shares contact info (email, phone, name) without a clear request:
- Thank them for the information
- Ask how you can help them
- If they seemed to want an appointment, offer to book one
- NEVER leave a response empty - always respond with something helpful
"""

        # Boundary instructions based on language
        if language == "fr":
            boundary_text = contact_handling + """

🚫 LIMITES DE CONVERSATION 🚫
IMPORTANT: Tu es un assistant d'entreprise spécialisé. Tu dois UNIQUEMENT répondre aux questions concernant:
- Cette entreprise et ses services
- Les produits/services offerts
- Les horaires et disponibilités
- Les prix et tarifs
- La prise de rendez-vous
- Les questions fréquentes (FAQ)
- Comment contacter l'entreprise

Tu dois REFUSER poliment de répondre à:
- Questions générales sans rapport avec l'entreprise (histoire, géographie, science, etc.)
- Devoirs scolaires ou académiques
- Conseils personnels non liés aux services de l'entreprise
- Questions sur d'autres entreprises ou concurrents
- Toute question qui n'a aucun lien avec les services de cette entreprise

Si quelqu'un pose une question hors sujet, réponds poliment:
"Je suis désolé, mais je suis ici uniquement pour vous aider avec les services de {business_name}. Comment puis-je vous aider concernant nos produits ou services?"
"""
        else:
            boundary_text = contact_handling + f"""

🚫 CONVERSATION BOUNDARIES 🚫
IMPORTANT: You are a specialized business assistant. You must ONLY answer questions about:
- This business and its services
- Products/services offered
- Hours and availability
- Pricing and rates
- Appointment booking
- Frequently Asked Questions (FAQ)
- How to contact the business

You must POLITELY REFUSE to answer:
- General questions unrelated to the business (history, geography, science, etc.)
- Homework or academic assignments
- Personal advice unrelated to the business services
- Questions about other businesses or competitors
- Any question that has no connection to this business's services

If someone asks an off-topic question, politely respond:
"I'm sorry, but I'm here only to help you with {business_name}'s services. How can I assist you with our products or services?"
"""

        return f"""Tu es l'assistant virtuel de "{business_name}".

Description de l'entreprise:
{business_description}

Le message d'accueil "{welcome_message}" a déjà été affiché à l'utilisateur au début de la conversation. Ne le répète JAMAIS dans tes réponses.

{lang_instruction}
{boundary_text}
{appointment_text}

Règles importantes:
1. Sois amical, professionnel et utile
2. Réponds de manière concise (2-3 phrases maximum sauf si plus de détails sont nécessaires)
3. Si tu ne connais pas la réponse (SAUF pour les rendez-vous si le système est activé), dis-le poliment
4. Ne fais jamais de promesses que l'entreprise ne pourrait pas tenir
5. RAPPEL IMPORTANT: Si le système de rendez-vous est activé ci-dessus, tu PEUX et tu DOIS réserver des rendez-vous directement
6. RESTE DANS TON RÔLE: N'accepte que les questions liées à cette entreprise et ses services
{faq_text}{product_text}{custom_text}"""

    def detect_appointment_intent(self, message: str, language: str = "fr") -> bool:
        """Check if the message indicates appointment booking intent.
        Always checks both French and English keywords — users on this
        bilingual platform can express intent in either language regardless
        of the business language setting.
        """
        message_lower = message.lower()

        keywords = [
            # French
            "rendez-vous", "rdv", "rendez vous",
            "réserver", "reservation",
            "prendre un rendez-vous",
            "disponibilité", "disponible",
            "horaire",
            # English
            "appointment", "book", "booking", "schedule",
            "available", "availability",
        ]

        return any(keyword in message_lower for keyword in keywords)

    def extract_appointment_info(self, messages: list[dict], available_slots: list[dict] = None) -> dict:
        """
        Extract appointment information from conversation history.
        Returns a dict with name, phone, email, date, time, service, notes.
        Uses AI to extract structured data from natural conversation.
        """
        import re
        from datetime import datetime, timedelta

        info = {
            "name": None,
            "phone": None,
            "email": None,
            "date": None,
            "time": None,
            "service": None,
            "notes": None,
        }

        # Search all user messages in the conversation; the loop below iterates
        # newest-first so the most recent value for each field wins automatically.
        user_messages = [msg["content"] for msg in messages if msg["role"] == "user"]
        conversation_text = " ".join(user_messages)

        # Check for slot selection
        # NEW: Check if message matches any slot's display text exactly (e.g., "Thursday 05 February at 11:30")
        if available_slots:
            slot_selected = False

            # First, try to match the message against slot display strings
            for i, slot in enumerate(available_slots):
                # Build display strings from slot data (same format as chat.py response_slots)
                display_en = f"{slot['display_date']} at {slot['time']}"
                display_fr = f"{slot['display_date']} à {slot['time']}"

                # Check both English and French formats
                if display_en.lower() in conversation_text.lower() or display_fr.lower() in conversation_text.lower():
                    info["date"] = slot["date"]
                    info["time"] = slot["time"]
                    print(f"🔍 Slot display matched: '{display_en}' → {info['date']} at {info['time']}")
                    slot_selected = True
                    break

            # Fallback: Check for old-style slot number selection (e.g., "slot 1", "option 2")
            if not slot_selected:
                slot_patterns = [
                    r"(?:slot|option|créneau|creneau|choice|choix)\s*#?\s*(\d+)",  # slot 1, option #2
                    r"(?:the\s+)?(?:first|1st|premier|première)\s*(?:one|slot|option)?",  # the first one
                    r"(?:the\s+)?(?:second|2nd|deuxième|deuxieme)\s*(?:one|slot|option)?",  # the second
                    r"(?:the\s+)?(?:third|3rd|troisième|troisieme)\s*(?:one|slot|option)?",  # the third
                    r"(?:number|numéro|numero|#)\s*(\d+)",  # number 1, #2
                    # Only match bare number if it's the ONLY content (not followed by time indicators)
                    r"^(\d+)$",  # Just a number, nothing else (e.g., "2")
                ]

                for pattern in slot_patterns:
                    match = re.search(pattern, conversation_text, re.IGNORECASE)
                    if match:
                        slot_num = None
                        if match.groups() and match.group(1):
                            try:
                                slot_num = int(match.group(1))
                            except (ValueError, IndexError):
                                continue
                        elif "first" in pattern or "1st" in pattern or "premier" in pattern:
                            slot_num = 1
                        elif "second" in pattern or "2nd" in pattern or "deuxième" in pattern:
                            slot_num = 2
                        elif "third" in pattern or "3rd" in pattern or "troisième" in pattern:
                            slot_num = 3

                        # Validate slot number: must be >= 1 and <= available slots
                        if slot_num and slot_num >= 1 and slot_num <= len(available_slots):
                            selected_slot = available_slots[slot_num - 1]
                            info["date"] = selected_slot["date"]
                            info["time"] = selected_slot["time"]
                            print(f"🔍 Slot {slot_num} selected: {info['date']} at {info['time']}")
                            break

        # Debug logging
        print(f"🔍 Extracting from {len(user_messages)} recent user messages")
        print(f"🔍 Recent messages: {user_messages}")

        # Search from NEWEST to oldest for ALL fields
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_patterns = [
            r'\+\d{1,4}\s*\d{6,14}',  # International format +XX XXXXXXXXX
            r'\+237\s*[6-9]\d{8}',  # Cameroon +237 format
            r'\b[6-9]\d{8}\b',  # 9-digit format starting with 6-9
            r'\b\d{10}\b',  # 10-digit format (US, etc.)
            r'(?:number|phone|tel|num)[\s:]*(\d{7,15})',  # Labeled phone numbers
        ]
        # More flexible name patterns including typos like "my is X", "hi my is X"
        # IMPORTANT: Patterns must NOT match greetings like "Hi Raven"
        greeting_blacklist = r"(?!Hi\s|Hello\s|Hey\s|Bonjour\s|Salut\s)"  # Negative lookahead for greetings

        name_patterns = [
            r"(?:je m'appelle|mon nom est|je suis)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})(?:\s|$|,|\.)",
            r"(?:my name is|I am|I'm|my is|hi my is|hi i'm|hi i am)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})(?:\s|$|,|\.)",
            r"(?:name|nom)[:;]?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})(?:\n|$|\s|,|\.)",  # "Name James" or "name: James"
            r"^(?:hi|hello|hey)\s+(?:my is|i'm|i am)\s+([a-zA-Z]+)(?:\s|$|,|\.)",  # "Hi my is Sean"
            r"\bname\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",  # "Name James" or "Name James Smith"
            # NEW: Single name (any case) followed by comma and newline, then email/phone
            rf"^{greeting_blacklist}([a-zA-Z]+(?:\s+[a-zA-Z]+)?),\s*\n\s*[\w.+-]+@",  # name, \n email (not greeting)
            rf"^{greeting_blacklist}([a-zA-Z]+(?:\s+[a-zA-Z]+)?),\s*\n\s*\+?\d{{6,}}",  # name, \n phone (not greeting)
            # Single name followed by newline and then email/phone (e.g., "Bambo\nemail@example.com")
            rf"^{greeting_blacklist}([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s*\n\s*[\w.+-]+@",  # Name followed by newline then email (not greeting)
            rf"^{greeting_blacklist}([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s*\n\s*\+?\d{{6,}}",  # Name followed by newline then phone (not greeting)
            # Comma-separated names - TWO WORDS like "Jude Sean, email@example.com"
            # Use negative lookahead to exclude greetings
            rf"^{greeting_blacklist}([A-Z][a-z]+\s+[A-Z][a-z]+),\s*[\w.+-]+@",  # Two-word name before comma + email (not greeting)
            rf"^{greeting_blacklist}([A-Z][a-z]+\s+[A-Z][a-z]+),\s*\+?\d{{6,}}",  # Two-word name before comma + phone (not greeting)
            rf"^{greeting_blacklist}([A-Z][a-z]+\s+[A-Z][a-z]+),",  # Two-word name at start before comma (not greeting)
            r",\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\s*$",  # Two-word name after comma at end
            r",\s*([A-Z][a-z]+\s+[A-Z][a-z]+),\s*[\w.+-]+@",  # ..., Two-word Name, email@...
            r",\s*([A-Z][a-z]+\s+[A-Z][a-z]+),\s*\+?\d{6,}",  # ..., Two-word Name, phone...
            r",\s*([A-Z][a-z]+\s+[A-Z][a-z]+),",  # ..., Two-word Name, ... (between commas)
            # Comma-separated names - SINGLE WORD like "Jamesborn, email@example.com"
            rf"^{greeting_blacklist}([A-Z][a-z]{{2,}}),\s*[\w.+-]+@",  # Single name before comma + email (not greeting)
            rf"^{greeting_blacklist}([A-Z][a-z]{{2,}}),\s*\+?\d{{6,}}",  # Single name before comma + phone (not greeting)
            r",\s*([A-Z][a-z]{2,}),\s*[\w.+-]+@",  # ..., Single Name, email@...
            r",\s*([A-Z][a-z]{2,}),\s*\+?\d{6,}",  # ..., Single Name, phone...
        ]

        print(f"🔍 Looking for name, email, phone in recent messages...")

        # Search from newest to oldest
        for msg in reversed(user_messages):
            # Extract email from this message if not found yet
            if not info["email"]:
                email_match = re.search(email_pattern, msg)
                if email_match:
                    info["email"] = email_match.group()
                    print(f"🔍 Found email: {info['email']} in message: '{msg[:40]}...'")

            # Extract phone from this message if not found yet
            if not info["phone"]:
                for pattern in phone_patterns:
                    phone_match = re.search(pattern, msg)
                    if phone_match:
                        # Use group(1) if available (for patterns with capturing groups), else group()
                        try:
                            info["phone"] = phone_match.group(1).strip()
                        except IndexError:
                            info["phone"] = phone_match.group().strip()
                        print(f"🔍 Found phone: {info['phone']} in message: '{msg[:40]}...'")
                        break

            # Extract name from this message if not found yet
            if not info["name"]:
                for pattern in name_patterns:
                    name_match = re.search(pattern, msg, re.IGNORECASE | re.MULTILINE)
                    if name_match:
                        potential_name = name_match.group(1).strip()
                        print(f"🔍 Found potential name: '{potential_name}' in message: '{msg[:40]}...'")
                        words = potential_name.split()
                        if 1 <= len(words) <= 4 and all('\n' not in w and len(w) >= 2 for w in words):
                            info["name"] = " ".join(word.capitalize() for word in words)
                            print(f"🔍 Accepted name: '{info['name']}'")
                            break
                        else:
                            print(f"🔍 Rejected name: '{potential_name}' (validation failed)")

        # Extract date (various formats) - ONLY if not already set by slot selection
        if not info["date"]:
            today = datetime.now()

            # Check for relative dates
            if re.search(r"\b(aujourd'hui|today)\b", conversation_text, re.IGNORECASE):
                info["date"] = today.strftime("%Y-%m-%d")
            elif re.search(r"\b(demain|tomorrow)\b", conversation_text, re.IGNORECASE):
                info["date"] = (today + timedelta(days=1)).strftime("%Y-%m-%d")
            # Check for day of week (Monday, Tuesday, etc.)
            elif re.search(r"\b(monday|lundi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (0 - today.weekday()) % 7
                if days_ahead == 0:  # If today is Monday, schedule for next Monday
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(tuesday|mardi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (1 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(wednesday|mercredi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (2 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(thursday|jeudi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (3 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(friday|vendredi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (4 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(saturday|samedi)\b", conversation_text, re.IGNORECASE):
                days_ahead = (5 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            elif re.search(r"\b(sunday|dimanche)\b", conversation_text, re.IGNORECASE):
                days_ahead = (6 - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                info["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            else:
                # Try to extract specific dates (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
                date_patterns = [
                    r"\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b",  # YYYY-MM-DD
                    r"\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b",  # DD-MM-YYYY or MM-DD-YYYY
                ]
                for pattern in date_patterns:
                    date_match = re.search(pattern, conversation_text)
                    if date_match:
                        date_str = date_match.group(1)
                        # Try to parse it
                        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"]:
                            try:
                                parsed_date = datetime.strptime(date_str, fmt)
                                info["date"] = parsed_date.strftime("%Y-%m-%d")
                                break
                            except:
                                continue
                        if info["date"]:
                            break

        # Extract time (HH:MM format or simple hour) - ONLY if not already set by slot selection
        if not info["time"]:
            time_pattern = r"\b(\d{1,2})[h:](\d{2})\b"
            time_match = re.search(time_pattern, conversation_text)
            if time_match:
                hour = int(time_match.group(1))
                minute = time_match.group(2)

                # Check for PM/AM suffix even for HH:MM format (e.g., "2:30pm")
                # Look for PM/AM within 5 characters after the time match
                match_end = time_match.end()
                nearby_text = conversation_text[max(0, match_end):match_end + 5].lower()

                if "pm" in nearby_text and hour < 12:
                    hour += 12
                elif "am" in nearby_text and hour == 12:
                    hour = 0  # 12am = 00:00

                info["time"] = f"{hour:02d}:{minute}"
            else:
                # Try simple hour format like "14h" or "2pm"
                time_pattern_simple = r"\b(\d{1,2})\s*(?:h|heures?|pm|am)\b"
                time_match_simple = re.search(time_pattern_simple, conversation_text, re.IGNORECASE)
                if time_match_simple:
                    hour = int(time_match_simple.group(1))

                    # Adjust for PM if needed
                    if "pm" in conversation_text.lower() and hour < 12:
                        hour += 12
                    # Handle 12am (midnight) edge case
                    elif "am" in conversation_text.lower() and hour == 12:
                        hour = 0

                    info["time"] = f"{hour:02d}:00"

        print(f"🔍 Final extracted info: {info}")
        return info

    def generate_response(
        self,
        messages: list[dict],
        business_context: dict,
        has_appointments: bool = False,
        available_slots: list[dict] = None,
    ) -> str:
        """
        Generate a response using Groq (Llama 3) with vision support.

        Args:
            messages: List of previous messages in the conversation (with optional media)
            business_context: Dict with business info (name, description, config, etc.)
            has_appointments: Whether the business has appointment booking enabled
            available_slots: List of available appointment slots

        Returns:
            The AI-generated response text
        """
        # Build system prompt with business context
        config = business_context.get("config", {}) or {}
        system_prompt = self.build_system_prompt(
            business_name=business_context["name"],
            business_description=business_context["description"],
            language=business_context.get("language", "fr"),
            welcome_message=config.get("welcome_message", "Bonjour! Comment puis-je vous aider?"),
            faqs=config.get("faqs", []),
            products=config.get("products", []),
            custom_instructions=config.get("custom_instructions"),
            has_appointments=has_appointments,
            available_slots=available_slots or [],
        )

        # Limit conversation history to recent messages (last 15 pairs = 30 messages max)
        # This prevents context overflow and keeps responses faster
        recent_messages = messages[-20:] if len(messages) > 20 else messages

        # Format messages for Groq API with vision support
        groq_messages = [{"role": "system", "content": system_prompt}]
        has_images = False

        # Only use vision for the LAST 3 messages (to detect current image uploads)
        # Don't process old images from the entire conversation history
        vision_window = recent_messages[-3:] if len(recent_messages) > 3 else recent_messages

        for msg in recent_messages:
            # Only process images if this message is in the recent vision window
            if msg in vision_window and msg.get("media") and isinstance(msg["media"], list):
                # Build content array with text and images
                content = []

                # Add text content
                if msg.get("content"):
                    content.append({
                        "type": "text",
                        "text": msg["content"]
                    })

                # Add image content
                for media_item in msg["media"]:
                    if media_item.get("type") == "image":
                        image_url = media_item.get("url", "")

                        # Convert to base64 data URL if it's an HTTP URL
                        if image_url.startswith("data:"):
                            # Already a data URL
                            data_url = image_url
                        elif image_url.startswith("http"):
                            # Convert HTTP URL to base64 data URL
                            data_url = self.url_to_base64(image_url)
                            if not data_url:
                                continue
                        else:
                            continue

                        # Add image to content
                        has_images = True
                        content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": data_url
                            }
                        })

                groq_messages.append({
                    "role": msg["role"],
                    "content": content if content else msg["content"]
                })
            else:
                # Regular text message (or old message with images we're ignoring)
                groq_messages.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })

        # Use vision model if images are present, otherwise use regular model
        selected_model = self.vision_model if has_images else self.model

        # DEBUG: Log what we're sending to Groq
        print(f"📤 Calling Groq API with model: {selected_model}")
        print(f"📤 Number of messages: {len(groq_messages)}")
        print(f"📤 Has images: {has_images}")
        print(f"📤 System prompt length: {len(system_prompt)} chars")
        # Print first and last user message to verify context
        user_msgs = [m for m in groq_messages if m.get('role') == 'user']
        if user_msgs:
            print(f"📤 Last user message: {user_msgs[-1].get('content', '')[:100]}")

        # Call Groq API
        response = self.client.chat.completions.create(
            model=selected_model,
            max_tokens=500,  # Keep responses concise
            messages=groq_messages,
        )

        # DEBUG: Log what we got back
        print(f"📥 Response choices: {len(response.choices)}")
        print(f"📥 Response content: '{response.choices[0].message.content}'")
        print(f"📥 Finish reason: {response.choices[0].finish_reason}")

        # Handle empty responses
        ai_response = response.choices[0].message.content
        if not ai_response or ai_response.strip() == "":
            print("⚠️ Empty response from AI, using fallback")
            lang = business_context.get("language", "fr")
            business_name = business_context.get("name", "")

            # Simple, helpful fallback
            if lang == "fr":
                ai_response = f"Bonjour! Comment puis-je vous aider avec les services de {business_name}?"
            else:
                ai_response = f"Hello! How can I help you with {business_name}'s services?"

        return ai_response


# Singleton instance - created lazily to avoid errors at import time
_ai_service = None

def get_ai_service() -> AIService:
    """Get or create the AI service instance."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service

# For backward compatibility
ai_service = None  # Will be initialized on first use
