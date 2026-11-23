# Salat Tracker (Daily Prayer Log & Calendar)

[![Frontend CI](https://github.com/MashiurTonmoy/Salat_Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/MashiurTonmoy/Salat_Tracker/actions/workflows/ci.yml)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=github-actions&logoColor=white)
![Vitest](https://img.shields.io/badge/Test_Automation-Vitest-6E9F18?logo=vitest&logoColor=white)
![React Testing Library](https://img.shields.io/badge/Testing_Library-React-E33332?logo=testing-library&logoColor=white)
![ESLint](https://img.shields.io/badge/Code_Quality-ESLint-4B32C3?logo=eslint&logoColor=white)
![TypeScript](https://img.shields.io/badge/Type_Safety-TypeScript-3178C6?logo=typescript&logoColor=white)
![Deploy Automation](https://img.shields.io/badge/Deploy_Automation-Production_Build-success?logo=githubactions&logoColor=white)

> 🚀 **Purpose: GitHub Actions & CI/CD Pipeline Automation**  
> This repository is primarily configured to demonstrate modern **CI/CD pipelines**, **software test automation**, and **deploy/build automation** using **GitHub Actions**. Every push and pull request automatically triggers code quality checks (**ESLint**), automated unit & integration testing (**Vitest** + **React Testing Library**), and production build verification (**TypeScript compiler** + **Vite bundling**).

A serene, modern, full-stack web application for tracking the five daily Salat (Fajr, Dhuhr, Asr, Maghrib, Isha) and visualizing completion history on an Islamic-inspired monthly heatmap calendar.

---

## ⚙️ CI/CD Pipeline & Software Test Automation

The repository includes a fully automated GitHub Actions workflow (`.github/workflows/ci.yml`) designed for continuous integration, rigorous test automation, and deployment readiness:

* **Triggers**: Automatically runs on all `push` and `pull_request` events targeting the `main` branch.
* **Concurrency Control**: Automatically cancels outdated in-progress runs when new commits are pushed to save compute time.
* **Pipeline Stages**:
  1. **Environment Setup**: Runs on `ubuntu-latest` with Node.js LTS and automated dependency caching via `package-lock.json`.
  2. **Deterministic Dependency Installation**: Uses `npm ci` for clean, reproducible installations.
  3. **Static Code Quality Gate**: Runs `npm run lint` (**ESLint 9+**) to enforce strict code standards.
  4. **Static Type Checking**: Runs `npm run typecheck` (`tsc --noEmit`) to guarantee full end-to-end type safety.
  5. **Automated Unit & Integration Testing**: Runs `npm run test:coverage` using **Vitest** and **React Testing Library** with over 90 automated tests and global coverage thresholds (>70%).
  6. **Automated Test Coverage Summary**: Parses `coverage-summary.json` and automatically publishes a Markdown coverage table to the GitHub Job Summary.
  7. **Deployment & Build Automation**: Runs `npm run build` (`tsc -b && vite build`) to produce an optimized production bundle and upload it as a workflow artifact.

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
│   │   ├── test/             # Backend unit test suites (Vitest)
│   │   ├── types/            # TypeScript contracts
│   │   └── validations/      # Zod request schemas
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React 18 + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── components/       # Calendar, Daily submission (individual prayers), Auth
│   │   ├── services/         # Storage service & API client
│   │   └── test/             # Vitest & React Testing Library test suites (92 passing tests)
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
# Fill in your Supabase connection string and JWT secrets in .env

# Run dev backend server:
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
# Run backend test suite (11 passing tests)
cd backend && npm test

# Run frontend tests with coverage (92 passing tests, Vitest + React Testing Library)
cd frontend && npm run test:coverage

# Run ESLint code quality checks
cd frontend && npm run lint
```
