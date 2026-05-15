# SafeMedAI - AI-Powered Pharmacovigilance Platform

A complete web application for detecting, analyzing, and alerting drug safety risks using AI and public datasets.

## 📋 Project Structure

```
SafeMedAI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── ml/             # ML models
│   │   ├── database/       # Database config
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   └── utils/          # Utilities
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite config
│
├── docker-compose.yml      # Docker setup
├── .env                    # Environment variables
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Git

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 2: Frontend Setup

```bash
# Open another terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📚 Development Phases

### Phase 1: Project Setup ✅

- Folder structure
- Backend & Frontend initialization
- Basic API connection

### Phase 2: Authentication System ✅

- Two-role login system (Doctor/Officer)
- Professional JWT-based authentication
- Secure password hashing

### Phase 3: Data Pipeline ✅

- FAERS data fetching & ingestion
- Data cleaning & structured storage
- Live clinical data synchronization

### Phase 4: Core Logic ✅

- ROR (Reporting Odds Ratio) calculation
- Signal momentum & risk scoring
- Trend detection algorithms

### Phase 5: Backend APIs ✅

- Leaderboard & Drug Analytics APIs
- Search & Filter capabilities
- Alert management & Notification engine
- Interaction detection & Sentiment Analysis
- Gemini-powered AI Chatbot integration

### Phase 6: Frontend UI ✅

- Professional Officer Dashboard (Edge-to-edge layout)
- Clinical Leaderboard & Drug Details
- Responsive & Collapsible Sidebar navigation
- Theme-aware design (Light/Dark mode)

### Phase 7: Advanced Features ✅

- Real-time Alert system with risk momentum
- Comprehensive Drug Interaction detection
- Social media sentiment & Nocebo detection
- Context-aware Clinical AI Chatbot

### Phase 8: Doctor Input System ✅

- Clinical adverse event reporting form
- Professional doctor verification protocol (License ID)
- Real-time report submission & processing

### Phase 9: Report Generation ✅

- Formal PDF report export functionality
- Clinical intelligence summaries (ROR Signal Matrices)
- In-app report previewer

### Phase 10: Final Integration & Polishing ✅

- UI/UX refinements for enterprise-grade experience
- Dashboard data synchronization fixes
- Cross-role workflow optimization

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion
- **Backend**: FastAPI, Python 3.10+
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: JWT (python-jose), Passlib
- **AI/LLM**: Google Gemini API
- **PDF Generation**: ReportLab / WeasyPrint integration

## 📝 API Endpoints

```
GET  /                        - Root endpoint
GET  /health                  - Health check
POST /auth/register           - User registration
POST /auth/token              - Login/Token generation
GET  /auth/verify-doctor      - Doctor license verification
GET  /drugs/search            - Drug search
GET  /drugs/detail            - Drug detail analytics
GET  /analytics/leaderboard   - Top risk drugs
GET  /alerts/list             - System-generated alerts
POST /interactions            - Drug-drug interaction check
GET  /sentiment               - Social media sentiment analysis
POST /chatbot/ask             - AI Support Chatbot
POST /reports/submit          - Submit clinical report (Doctor)
GET  /reports/pdf/{report_id} - Export PDF report
```

## 🔐 Environment Variables

Ensure you have a `.env` file in the root directory with the following:
- `DATABASE_URL`
- `SECRET_KEY` (for JWT)
- `GEMINI_API_KEY` (for AI features)

## 🎯 Current Status

The SafeMedAI platform is now fully operational as an enterprise-grade pharmacovigilance suite. It features a dual-role interface for Doctors and Safety Officers, real-time risk detection, AI-powered insights, and automated clinical reporting.

---

**SafeMedAI** - *Advancing Patient Safety through Intelligent Surveillance*
