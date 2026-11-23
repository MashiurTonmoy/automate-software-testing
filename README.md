# Salat Tracker (Daily Prayer Log & Calendar)

[![Frontend CI](https://github.com/MashiurTonmoy/Salat_Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/MashiurTonmoy/Salat_Tracker/actions/workflows/ci.yml)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=github-actions&logoColor=white)
![Vitest](https://img.shields.io/badge/Test_Automation-Vitest-6E9F18?logo=vitest&logoColor=white)
![Deploy Automation](https://img.shields.io/badge/Deploy_Automation-Production_Build-success?logo=githubactions&logoColor=white)

A minimal, serene, and modern full-stack web application for tracking the five daily Salat (Fajr, Dhuhr, Asr, Maghrib, Isha) and visualizing completion history on an Islamic-inspired monthly heatmap calendar.

---

## 🏛️ Project Architecture

```
Salat_Tracker/
├── backend/                  # Production Express + TypeScript + Prisma API
│   ├── prisma/
│   │   └── schema.prisma     # Supabase PostgreSQL schema & models
│   ├── src/
│   │   ├── config/           # Environment and DB config
│   │   ├── controllers/      # Auth & prayer HTTP handlers
│   │   ├── middlewares/      # JWT auth, Zod validation, helmet, rate limiting
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Business logic & date restriction rules
│   │   ├── types/            # TypeScript contracts
│   │   └── validations/      # Zod request schemas
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React 18 + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── components/       # Calendar, Daily submission (individual prayers), Auth
│   │   ├── services/         # Storage service & API client
│   │   └── test/             # Vitest & RTL test suites (92 passing tests)
│   ├── .env.example
│   └── package.json
│
├── .github/workflows/ci.yml  # Automated CI/CD workflow
├── package.json              # Monorepo workspace runner
└── README.md
```

---

## ✨ Features

1. **Authentication (Username/Email & Password)**
   - Secure account registration & login with password hashing via **bcrypt**.
   - Session management via short-lived JWT access tokens & HTTP-only refresh tokens.
   - Local device profile fallback mode supported.

2. **5 Daily Prayers Breakdown**
   - Individual tracking for:
     - 🌅 **Fajr** (Dawn)
     - ☀️ **Dhuhr** (Noon)
     - 🌤️ **Asr** (Afternoon)
     - 🌇 **Maghrib** (Sunset)
     - 🌙 **Isha** (Night)
   - Real-time intensity calculation (0 to 5) updating calendar cells dynamically.

3. **Supabase PostgreSQL & Prisma ORM**
   - Composite unique constraint `(user_id, date)` guaranteeing strict single-record integrity per day.
   - Transaction-safe upserts for multiple submissions throughout the day.

4. **Strict Islamic Date Restrictions**
   - **Today**: Fully editable throughout the day.
   - **Past Dates**: Strictly read-only to preserve authentic history.
   - **Future Dates**: Strictly disabled and unselectable.

5. **Monthly Heatmap Calendar**
   - GitHub-inspired contribution heatmap with 6 distinct green intensity tiers.
   - Dynamic monthly summaries (Total prayers, Perfect 5/5 days, Average per day).

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase connection strings

# Run migrations to push schema to Supabase:
npx prisma migrate dev --name init

# Start dev backend server:
npm run dev
# Running at http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

### 3. Run Automated Tests

```bash
# Run backend tests (11 passing tests)
cd backend && npm test

# Run frontend tests with coverage (92 passing tests, >78% coverage)
cd frontend && npm run test:coverage
```
