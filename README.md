# Raven - AI Chatbot Platform

Raven est une plateforme de chatbot IA pour les entreprises au Cameroun et en Afrique francophone. Permettez a vos clients de poser des questions 24h/24 via votre site web ou WhatsApp.

## Stack Technique

- **Backend**: Python/FastAPI
- **Frontend**: Next.js (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Widget**: TypeScript/Vite

## Structure du Projet

```
raven/
├── backend/          # API FastAPI
├── frontend/         # Dashboard Next.js
├── widget/           # Widget de chat embeddable
└── supabase/         # Migrations SQL
```

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Un compte Supabase
- Une cle API Anthropic (Claude)

### 1. Configuration Supabase

1. Creez un projet sur [supabase.com](https://supabase.com)
2. Allez dans SQL Editor et executez le fichier `supabase/migrations/001_initial_schema.sql`
3. Notez votre Project URL et Anon Key (dans Settings > API)

### 2. Configuration Backend

```bash
cd backend

# Creer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dependances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Editez .env avec vos cles Supabase et Anthropic

# Demarrer le serveur
uvicorn app.main:app --reload
```

Le backend sera disponible sur http://localhost:8000

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Editez .env.local avec vos cles Supabase

# Demarrer le serveur de developpement
npm run dev
```

Le dashboard sera disponible sur http://localhost:3000

### 4. Configuration Widget

```bash
cd widget

# Installer les dependances
npm install

# Demarrer le serveur de developpement
npm run dev
```

Pour tester le widget, ouvrez `widget/test.html` dans votre navigateur apres avoir remplace `YOUR_BUSINESS_ID` par un ID valide.

## Utilisation

### Pour les Business Owners

1. Creez un compte sur http://localhost:3000/auth/signup
2. Configurez votre entreprise (nom, description, FAQs, produits)
3. Copiez le code du widget depuis le dashboard
4. Integrez le widget sur votre site web

### Integration du Widget

Ajoutez ce code juste avant `</body>` sur votre site:

```html
<script>
  window.RAVEN_CONFIG = {
    businessId: "VOTRE_ID_ENTREPRISE",
    apiUrl: "https://api.raven.cm"  // URL de production
  };
</script>
<script src="https://cdn.raven.cm/widget.js" async></script>
```

## API Endpoints

### Public (Widget)

- `GET /api/chat/business/{id}/public` - Info publique d'une entreprise
- `POST /api/chat` - Envoyer un message

### Protected (Dashboard)

- `GET /api/businesses` - Lister ses entreprises
- `POST /api/businesses` - Creer une entreprise
- `GET /api/businesses/{id}` - Details d'une entreprise
- `PUT /api/businesses/{id}/config` - Mettre a jour la config

## Variables d'Environnement

### Backend (.env)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
DEBUG=true
```

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deploiement

### Backend (Railway/Render)

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Deployez avec `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Deployez automatiquement

### Widget

Buildez le widget et hebergez sur un CDN:

```bash
cd widget
npm run build
# Le fichier dist/raven-widget.js peut etre heberge sur n'importe quel CDN
```

## Roadmap

### Phase 1 (MVP) ✅
- [x] Backend FastAPI
- [x] Integration Claude
- [x] Dashboard Next.js
- [x] Widget embeddable
- [x] Authentification Supabase

### Phase 2
- [ ] Integration WhatsApp Business API
- [ ] Prise de rendez-vous
- [ ] Capture de leads
- [ ] Export des donnees

### Phase 3
- [ ] Paiements Mobile Money (MTN MoMo, Orange Money)
- [ ] Comptes multi-utilisateurs
- [ ] Analytics avances

## Support

Pour toute question ou probleme, ouvrez une issue sur GitHub.

---

Fait avec ❤️ au Cameroun
