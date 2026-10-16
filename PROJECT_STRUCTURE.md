# Karachi Civic AI — "The City Around You"

## Project Overview

**Tagline:** *"Report a problem. We'll find who can fix it."*  
**اردو:** *"آپ مسئلہ بتائیں، ہم ذمہ دار ادارہ تلاش کریں گے۔"*

This is a production-grade, location-aware civic reporting and automated government routing platform designed specifically for **Karachi, Pakistan**. It empowers citizens to report municipal issues using **Photo 📷**, **Voice 🎙️**, or **Text ✍️** in English, Urdu, or Roman Urdu. The system uses AI to understand reports, extract locations, classify issues, route them to the responsible government authority, check for duplicates, and dispatch formal bilingual complaints via email.

---

## Key Concepts

### What This Platform Does

1. **Multimodal Input**: Citizens can report issues via:
   - 📷 **Photo**: Upload images with automatic EXIF GPS extraction
   - 🎙️ **Voice**: Record audio complaints in any language (transcribed via Whisper)
   - ✍️ **Text**: Type descriptions in English, Urdu, or Roman Urdu

2. **Intelligent Processing**:
   - **Vision Analysis**: Google Gemini analyzes photos to identify visible civic problems
   - **Location Detection**: Prioritizes Manual > Browser GPS > EXIF GPS > Text extraction
   - **Authority Routing**: Database-driven rules route complaints to the correct government body (KWSC, SSWMB, KMC, Cantonment Boards, etc.)
   - **Duplicate Detection**: Uses semantic matching + geographic distance to identify similar nearby reports

3. **Bilingual Output**:
   - Citizens see complaints in both **English** and **اردو**
   - Official emails to authorities are sent in **formal English only**

4. **Nearby Discovery**:
   - View civic issues reported near your location
   - Support existing complaints to increase visibility
   - Discover civic services (water tankers, gas connections, etc.)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Photo      │  │   Voice      │  │   Text       │     │
│  │   (EXIF GPS) │  │ (MediaRecorder)│  │ (En/Ur/Roman)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                │                │              │
│           └────────────────┴────────────────┘              │
│                          │                                 │
│                   ┌──────▼──────┐                          │
│                   │  Location   │                          │
│                   │  Picker     │                          │
│                   │  (Leaflet)  │                          │
│                   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP/JSON
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               FASTAPI BACKEND ENGINE                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Vision Analysis (Gemini - visible facts only)    │   │
│  │ 2. Audio Transcription (Groq Whisper Large v3)      │   │
│  │ 3. Text Normalization (Groq Llama/Qwen)             │   │
│  │ 4. Location Priority Engine                          │   │
│  │ 5. Authority Routing (Database rules)                │   │
│  │ 6. Duplicate Detection (Haversine + Category)        │   │
│  │ 7. Complaint Generator (English + Urdu)              │   │
│  │ 8. Email Dispatcher (Gmail SMTP)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          POSTGRESQL / SUPABASE DATABASE                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ authorities  │  │  complaints  │  │ civic_services│     │
│  │ issue_cats   │  │  embeddings  │  │ saved_services│     │
│  │ routing_rules│  │  events      │  │ profiles      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                  + pgvector + RLS                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **UI**: Tailwind CSS (Pakistan Civic Green theme)
- **i18n**: i18next (English + Urdu with RTL support)
- **Maps**: Leaflet + OpenStreetMap
- **State**: React Context API + TanStack Query
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI Services**:
  - **Vision**: Google Gemini (image analysis)
  - **Speech-to-Text**: Groq Whisper Large v3
  - **Text Processing**: Groq Llama/Qwen
- **Database**: PostgreSQL (Supabase) with pgvector
- **Email**: Gmail SMTP via smtplib
- **Validation**: Pydantic v2
- **Testing**: Pytest

### Database
- **Supabase PostgreSQL**
- **Extensions**: pgvector, uuid-ossp, pgcrypto
- **Security**: Row Level Security (RLS)
- **Migrations**: SQL-based

---

## Project Structure


### Repository Layout

```
CWA-Ship-2026/
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/               # API Endpoints
│   │   │       ├── authorities.py    # GET authorities, categories
│   │   │       ├── complaints.py     # POST /analyze, /send, GET /my
│   │   │       ├── health.py         # Health check endpoint
│   │   │       ├── location.py       # Location services
│   │   │       ├── nearby.py         # GET /problems, /hotspots
│   │   │       ├── services.py       # Civic services API
│   │   │       └── user.py           # User profile management
│   │   ├── core/
│   │   │   ├── config.py             # Settings (Pydantic)
│   │   │   ├── logging.py            # Logging configuration
│   │   │   └── security.py           # JWT extraction
│   │   ├── repositories/             # Data Access Layer
│   │   │   ├── authority_repository.py
│   │   │   ├── complaint_repository.py
│   │   │   ├── profile_repository.py
│   │   │   └── service_repository.py
│   │   ├── schemas/                  # Pydantic Models
│   │   │   └── complaint.py
│   │   ├── services/                 # Business Logic
│   │   │   ├── duplicate_service.py  # Duplicate detection
│   │   │   ├── email_service.py      # SMTP email sender
│   │   │   ├── gemini_service.py     # Image analysis
│   │   │   ├── groq_service.py       # Text processing
│   │   │   ├── whisper_service.py    # Audio transcription
│   │   │   ├── location_service.py   # Geocoding
│   │   │   └── routing_service.py    # Authority routing
│   │   ├── utils/
│   │   │   └── exif.py               # EXIF GPS extraction
│   │   └── main.py                   # FastAPI app entry
│   ├── tests/                        # Automated tests
│   │   ├── test_api.py
│   │   └── test_civic_platform.py
│   ├── .env                          # Environment variables
│   ├── .env.example
│   ├── requirements.txt              # Python dependencies
│   └── Procfile                      # Render deployment
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── AnalysisStepper.tsx   # 6-step progress indicator
│   │   │   ├── ComplaintCard.tsx     # Complaint list item
│   │   │   ├── ComplaintPreview.tsx  # Review before sending
│   │   │   ├── ComplaintTimeline.tsx # Event timeline
│   │   │   ├── HotspotBanner.tsx     # Area hotspot alert
│   │   │   ├── LanguageToggle.tsx    # English ⟷ اردو switcher
│   │   │   ├── LocationHeader.tsx    # Current area display
│   │   │   ├── LocationPicker.tsx    # Map + GPS location
│   │   │   ├── Navbar.tsx            # Top navigation
│   │   │   ├── PhotoUploader.tsx     # Image capture/upload
│   │   │   ├── ProblemMap.tsx        # Leaflet map view
│   │   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   │   ├── ServiceCard.tsx       # Civic service item
│   │   │   ├── StatusBadge.tsx       # Complaint status badge
│   │   │   ├── TextReporter.tsx      # Text input form
│   │   │   └── VoiceRecorder.tsx     # Audio recording
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # User authentication
│   │   │   └── LocationContext.tsx   # User location state
│   │   ├── locales/                  # Internationalization
│   │   │   ├── en.json               # English translations
│   │   │   └── ur.json               # Urdu translations
│   │   ├── pages/                    # Route Pages
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Report.tsx            # Issue reporting
│   │   │   ├── Complaints.tsx        # User complaint list
│   │   │   ├── ComplaintDetails.tsx  # Single complaint view
│   │   │   ├── Dashboard.tsx         # Admin/metrics
│   │   │   ├── NearbyProblems.tsx    # Map of nearby issues
│   │   │   ├── ServicesList.tsx      # All civic services
│   │   │   ├── WaterTankers.tsx      # KWSC tanker services
│   │   │   ├── WaterLines.tsx        # Water connections
│   │   │   ├── GasServices.tsx       # SSGC gas services
│   │   │   ├── ServiceDetail.tsx     # Single service view
│   │   │   ├── Profile.tsx           # User profile
│   │   │   ├── Login.tsx             # Authentication
│   │   │   └── ResetPassword.tsx     # Password reset
│   │   ├── services/
│   │   │   ├── api.ts                # Backend API client
│   │   │   └── supabase.ts           # Supabase client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # React Router setup
│   │   ├── main.tsx                  # React entry point
│   │   ├── i18n.ts                   # i18next config
│   │   └── index.css                 # Global styles
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── package.json
│   ├── tailwind.config.js            # Tailwind customization
│   ├── vite.config.ts                # Vite build config
│   └── vercel.json                   # Vercel deployment
│
├── supabase/
│   └── migrations/                   # Database migrations
│       ├── 20260912000000_init_civic_schema.sql
│       └── 20260914_v2_schema.sql
│
├── supabase_complete_schema.sql      # Full DB schema
├── README.md                         # Project documentation
├── package.json                      # Root package config
├── render.yaml                       # Render deployment config
└── vercel.json                       # Vercel deployment config
```

---

## Database Schema

### Core Tables

#### `profiles`
- User profiles with authentication info
- Location preferences (home/current area)
- Language preference (en/ur)

#### `authorities`
- Government agencies (KMC, KWSC, SSWMB, Cantonment Boards)
- Contact info (email, phone)
- Authority type and functions

#### `authority_jurisdictions`
- Geographic coverage areas
- Cantonment boundaries (DHA, Clifton, Malir, etc.)
- Location keywords for routing

#### `issue_categories`
14 predefined categories:
- water_supply
- sewage
- garbage
- drainage
- road_damage
- street_lighting
- encroachment
- sanitation
- parks
- fire_rescue
- municipal_charges
- building_control
- health_services
- other

#### `complaints`
Main complaint records with:
- User ID, reference ID (CWA-YYYYMMDD-XXX)
- Input type (photo/voice/text)
- Original text, transcript, normalized English
- English & Urdu complaint drafts
- Category, subcategory, severity
- Authority routing info
- Location (lat/lon, address, area, town, district)
- Status (analyzing, ready, sent, email_pending, duplicate)
- Duplicate tracking
- Report count (support counter)
- Image/audio paths
- Email delivery info

#### `complaint_embeddings`
- Vector embeddings (384d) for semantic similarity
- Used in duplicate detection

#### `complaint_events`
- Audit trail of complaint lifecycle
- Event types: created, location_detected, classified, authority_resolved, email_sent, etc.

#### `civic_services`
Government services catalog:
- Water tankers (KWSC)
- Water/gas connections
- Sewerage services
- Contact details, pricing, procedures

#### `service_categories`
- water_tankers
- water_connections
- gas_services
- sewerage_services
- waste_management

#### `saved_services`
User bookmarks for civic services

#### `complaint_supporters`
Tracks which users have supported which complaints (prevents duplicate support)

---

## Key Features & Workflows

### 1. Complaint Reporting Flow

```
User Input (Photo/Voice/Text)
    ↓
Location Detection (Manual > GPS > EXIF > Text)
    ↓
AI Analysis
    ├─ Vision: Gemini analyzes photo
    ├─ Speech: Whisper transcribes audio
    └─ Text: Groq processes text
    ↓
Classification (category, severity, description)
    ↓
Authority Routing (database-driven rules)
    ├─ Geographic: Cantonments (CBC, FCB, MCB, CBKC, MNCB)
    ├─ Functional: KWSC (water/sewage), SSWMB (garbage), KMC (main roads)
    └─ Fallback: Town Administration
    ↓
Duplicate Detection
    ├─ Semantic: Vector similarity
    ├─ Geographic: Haversine distance < 600m
    └─ Temporal: Recent time window
    ↓
Complaint Generation (English + Urdu)
    ↓
Email Dispatch (Gmail SMTP to authority)
    ↓
Status: sent | email_pending | email_failed
```

### 2. Authority Routing Logic

**Priority Order:**

1. **Geographic Cantonment Jurisdictions** (98% confidence)
   - DHA/Clifton → Cantonment Board Clifton (CBC)
   - Malir Cantt → Malir Cantonment Board (MCB)
   - Faisal Cantt → Faisal Cantonment Board (FCB)
   - Korangi/Landhi Cantt → CBKC
   - Manora → MNCB

2. **Category-Specific Authorities** (96% confidence)
   - water_supply, sewage → KWSC (Karachi Water & Sewerage Corporation)
   - garbage, sanitation → SSWMB (Sindh Solid Waste Management Board)
   - drainage, parks, encroachment → KMC (Karachi Metropolitan Corporation)

3. **Town Administration** (90% confidence)
   - Local streets, potholes, neighborhood lighting

4. **KMC Fallback** (85% confidence)
   - Apex municipal authority

**Critical Rule**: **No email hallucination** - If authority has no email in database (e.g., SSWMB), status = `email_pending`, not `sent`.

### 3. Location Priority System

```
Priority 1: Manual Pin (User drags map marker)
Priority 2: Browser GPS (navigator.geolocation)
Priority 3: EXIF GPS (extracted from photo metadata)
Priority 4: Text Extraction (AI extracts location from description)
Priority 5: Geocoded Karachi Default (24.8607, 67.0011)
```

### 4. Duplicate Detection Algorithm

A complaint is marked as duplicate if:
```python
same_category AND distance < 600m AND time_window < 7_days
```

Uses:
- Semantic embedding similarity
- Haversine distance formula
- Recent report time window

If duplicate found:
- User can "Support" existing complaint (increments report_count)
- Original complaint gains visibility

### 5. Bilingual System

**Frontend:**
- Instant language toggle (English ⟷ اردو)
- Full RTL layout mirroring for Urdu
- Zero LLM latency (static JSON translations)

**Backend:**
- Citizen UI shows both English and Urdu drafts
- Official authority email is **always English**

### 6. Email Dispatch System

**Technology:** Gmail SMTP (smtplib)
- Host: smtp.gmail.com:587
- TLS encryption
- Requires Gmail App Password (16 characters)

**Email Format:**
```
Subject: Civic Complaint - [Category] - [Area] - Reference CWA-YYYYMMDD-XXX
Body: Formal English complaint with:
  - Issue description
  - Location
  - Requested action
  - Reference ID
  - Platform signature
```

**Status Handling:**
- `sent`: Email delivered successfully
- `email_pending`: Authority has no email configured
- `email_failed`: SMTP delivery error
- Idempotent: Won't send twice if already sent

---

## API Endpoints

### Complaints
- `POST /api/complaints/analyze` - Analyze and route complaint
- `POST /api/complaints/{id}/send` - Dispatch email to authority
- `POST /api/complaints/{id}/support` - Support existing complaint
- `GET /api/complaints/{id}/support-status` - Check if user supported
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints` - List all complaints (with filters)
- `GET /api/complaints/{id}` - Get single complaint details
- `DELETE /api/complaints/{id}` - Delete unsent complaint
- `POST /api/complaints/{id}/retry-email` - Retry failed email

### Nearby
- `GET /api/nearby/problems` - Get complaints near location
- `GET /api/nearby/hotspots` - Get hotspot areas

### Services
- `GET /api/services` - List civic services
- `GET /api/services/categories` - Service categories
- `GET /api/services/{id}` - Service details

### Authorities
- `GET /api/authorities` - List all authorities
- `GET /api/categories` - List issue categories

### User
- `GET /api/me/profile` - User profile
- `PATCH /api/me/profile` - Update profile
- `GET /api/me/saved-services` - User's saved services
- `POST /api/me/saved-services` - Save service
- `DELETE /api/me/saved-services/{id}` - Remove saved service

### Health
- `GET /api/health` - System health check

---

## Environment Variables

### Backend (.env)

```bash
# Supabase
SUPABASE_URL=https://raqcvzaxufmymrfltgrw.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI APIs
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AQ.Ab8RN...

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=shahmanjamal9@gmail.com
SMTP_PASSWORD=your_16_char_app_password
EMAIL_FROM=shahmanjamal9@gmail.com
EMAIL_FROM_NAME=cwa_chip
SMTP_USE_TLS=true

# Optional
FRONTEND_URL=http://localhost:5173
AUTHORITY_TEST_EMAIL=test@example.com  # Override authority emails for testing
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://raqcvzaxufmymrfltgrw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Government Authorities

### Karachi Water & Sewerage Corporation (KWSC/KWSB)
- **Email:** info@kwsc.gos.pk
- **Phone:** +92 21 99245138
- **Responsibilities:**
  - Clean water supply
  - Water filtration
  - Sewerage network management
  - Sewage overflows
  - Water pipe leakages

### Sindh Solid Waste Management Board (SSWMB)
- **Email:** ❌ Not configured
- **Phone:** +92 3181030851
- **Responsibilities:**
  - Residential/commercial garbage collection
  - Waste transportation
  - Landfill operations
  - Municipal cleanliness

### Karachi Metropolitan Corporation (KMC)
- **Email:** mayor@kmc.gos.pk
- **Phone:** +92 21 99215000
- **Responsibilities:**
  - Main roads & bridges
  - Storm water drains
  - Major parks (Safari Park, Zoo)
  - Fire & rescue
  - Encroachment removal

### Cantonment Board Clifton (CBC)
- **Email:** info@cbc.gov.pk
- **Phone:** +92 21 99251848
- **Coverage:** DHA, Clifton, Boat Basin, Sea View
- **Responsibilities:** Roads, streetlights, water, sanitation, parks, building control

### Faisal Cantonment Board (FCB)
- **Email:** faisalcantonmentboard@gmail.com
- **Phone:** +92 21 99240317
- **Coverage:** Faisal Cantt, Shahrah-e-Faisal, Drigh Road, Karsaz

### Malir Cantonment Board (MCB)
- **Email:** pa.cbmalir@gmail.com
- **Phone:** +92 21 99247201
- **Coverage:** Malir Cantt, Askari 4/5, Safoora

### Cantonment Board Korangi & Landhi (CBKC)
- **Email:** newceo.cbkc@gmail.com
- **Phone:** +92 21 35061611
- **Coverage:** Korangi Cantt, Landhi Cantt

### Manora Cantonment Board (MNCB)
- **Email:** cbmanora75@gmail.com
- **Phone:** +92 21 32470001
- **Coverage:** Manora Island

### Town Administration
- **Email:** mayor@kmc.gos.pk (shared with KMC)
- **Phone:** +92 21 99215000
- **Responsibilities:** Local roads, potholes, neighborhood streetlights

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL (or Supabase account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure .env file
cp .env.example .env
# Edit .env with your API keys

# Run development server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure .env file
cp .env.example .env
# Edit .env with backend URL

# Run development server
npm run dev
```

Frontend runs at: http://localhost:5173

### Database Setup

1. Create Supabase project at https://supabase.com
2. Run migrations:
   ```sql
   -- Copy contents of supabase_complete_schema.sql
   -- Paste into Supabase SQL Editor
   -- Execute
   ```
3. Verify tables created:
   - authorities
   - complaints
   - profiles
   - civic_services
   - (and others)

---

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

**Test Coverage:**
- Authority routing rules
- Location priority resolution
- Duplicate detection
- Email handling (SSWMB no-email case)
- API endpoints

### Manual Testing Flow

1. Open http://localhost:5173
2. Click "Report an Issue"
3. Try each mode (Photo/Voice/Text)
4. Submit: "North Nazimabad mein kachra nahi uthaya gaya"
5. Verify:
   - Category: Garbage
   - Authority: SSWMB
   - Status: email_pending (no email configured)
6. Submit: "Sewage overflow on Shahrah-e-Faisal"
7. Verify:
   - Category: Sewage
   - Authority: KWSC
   - Email sent to: info@kwsc.gos.pk
   - Status: sent

---

## Deployment

### Backend (Render)

1. Create Web Service on Render
2. Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (from .env)
5. Deploy

### Frontend (Vercel)

1. Import project on Vercel
2. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
3. Add environment variables:
   - `VITE_API_BASE_URL`: Your Render backend URL
4. Deploy

### Database (Supabase)

Already cloud-hosted. Just run migration SQL.

---

## User Journey Examples

### Example 1: Garbage Not Collected

**Input (Text):**
```
North Nazimabad Block H mein 4 din se kachra nahi uthaya gaya
```

**Processing:**
1. Text normalized to English: "Garbage not collected for 4 days in North Nazimabad Block H"
2. Location detected: North Nazimabad, Karachi
3. Category: garbage
4. Authority: SSWMB (Sindh Solid Waste Management Board)
5. Result: `email_pending` (SSWMB has no email, only phone)
6. User sees: "Your complaint has been saved, but an email contact is not currently configured for this authority yet. Phone: +92 3181030851"

### Example 2: Sewage Overflow

**Input (Photo + GPS):**
- Photo of sewage overflow
- GPS: 24.8615, 67.0658 (Shahrah-e-Faisal)

**Processing:**
1. Gemini analyzes photo: "Sewage overflow visible on street"
2. Location: Shahrah-e-Faisal, PECHS, Karachi
3. Category: sewage, Severity: high
4. Authority: KWSC (email: info@kwsc.gos.pk)
5. Duplicate check: No similar reports nearby
6. Email dispatched: "Civic Complaint - Sewage & Sanitation - PECHS - Reference CWA-20260923-001"
7. Status: sent

### Example 3: Streetlight Broken in DHA

**Input (Voice):**
```
[Audio] "DHA Phase 5 mein 2 hafton se street lights off hain"
```

**Processing:**
1. Whisper transcribes: "DHA Phase 5 mein 2 hafton se street lights off hain"
2. Normalized: "Streetlights have been off for 2 weeks in DHA Phase 5"
3. Location: DHA Phase 5
4. Category: street_lighting
5. Authority: Cantonment Board Clifton (CBC) - email: info@cbc.gov.pk
6. (Why CBC? DHA falls under CBC jurisdiction - geographic routing)
7. Email sent, Status: sent

---

## Design Principles

### 1. No Hallucinated Data
- Authority emails are **NEVER generated by AI**
- All authority info comes from database
- If no email exists → status = `email_pending`, not fake email

### 2. Location Accuracy
- Strict priority: Manual > GPS > EXIF > Text > Default
- Karachi boundary validation
- Interactive map for manual correction

### 3. Transparent Routing
- Users see WHY authority was chosen
- Routing confidence scores
- Geographic vs functional reasoning

### 4. Bilingual UX
- Instant language switching
- Full RTL layout for Urdu
- Static translations (no LLM latency)
- Official emails in English only

### 5. Duplicate Prevention
- Semantic + geographic + temporal matching
- Support existing complaints instead of creating duplicates
- Visible report counts

### 6. Audit Trail
- Every complaint has event timeline
- Created → Location Detected → Classified → Routed → Email Sent
- User can see full history

---

## Future Enhancements

### Planned Features
- [ ] SMS notifications
- [ ] Authority response tracking
- [ ] Complaint resolution workflow
- [ ] Public complaint map
- [ ] Authority dashboard
- [ ] WhatsApp integration
- [ ] Urdu OCR for documents
- [ ] Mobile app (React Native)
- [ ] Complaint analytics dashboard
- [ ] Community voting on complaints
- [ ] Photo evidence gallery
- [ ] Multi-city expansion (Lahore, Islamabad)

### Technical Improvements
- [ ] WebSocket real-time updates
- [ ] Offline PWA support
- [ ] Advanced duplicate detection (computer vision)
- [ ] Automated testing (E2E with Playwright)
- [ ] Performance monitoring (Sentry)
- [ ] CDN for static assets
- [ ] Redis caching layer
- [ ] Background job queue (Celery)

---

## License

This project is part of a civic tech initiative for Karachi, Pakistan.

---

## Contact

**Developer:** Team CWA Ship 2026  
**Email:** shahmanjamal9@gmail.com  
**Platform:** The City Around You

---

## Acknowledgments

- **Karachi Metropolitan Corporation** for municipal authority data
- **KWSC** for water/sewerage contact info
- **SSWMB** for waste management coordination
- **Supabase** for database hosting
- **Groq** for fast LLM inference
- **Google Gemini** for vision analysis
- **OpenStreetMap** contributors for map data

---

*Last Updated: September 2026*
