# Salat Tracker (Daily Prayer Log & Calendar)

A minimal, serene, and modern web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite** for tracking the five daily Salat (prayers) and visualizing completion history on an Islamic-inspired monthly heatmap calendar.

---

## Features

1. **User Identification (No Passwords Required)**
   - Enter your name or username on first visit.
   - User ID is stored locally so you don't need to re-enter it every time.
   - Switch user accounts anytime with 1-click access to saved profiles on your device.
   - Distinct, partitioned local records per user ID.

2. **Monthly Calendar with Heatmap Green Intensity**
   - Monthly calendar layout inspired by GitHub's contribution heatmap.
   - Month navigation: `Previous Month`, `Next Month`, and `Today` quick jump.
   - **Intensity Rules**:
     - `0 Salat`: Neutral background
     - `1 Salat`: Very light green (`#DCFCE7`)
     - `2 Salat`: Light green (`#BBF7D0`)
     - `3 Salat`: Medium green (`#4ADE80`)
     - `4 Salat`: Strong green (`#16A34A`)
     - `5 Salat`: Dark green (`#166534`)

3. **Daily Prayer Submission**
   - Click today's date to log your prayers (0 to 5).
   - Submit multiple times in a single day as you pray; each submission cleanly updates today's record in-place.
   - Calendar cell colors and monthly stats update immediately.

4. **Strict Date Restrictions**
   - **Today**: Fully editable throughout the day.
   - **Past Dates**: Strictly read-only to preserve authentic history. If no record exists, displays as unrecorded.
   - **Future Dates**: Strictly disabled and unselectable.

5. **Monthly Summary & Today's Progress**
   - Real-time progress bar for today's prayers (0–5).
   - Total prayers completed in the viewed month.
   - Perfect days (5/5).
   - Average prayers per recorded day.
   - Interactive contribution legend.

---

## Quick Start

### 1. Development Server
```bash
npm run dev
```

### 2. Run Tests
```bash
npm test
```

### 3. Production Build
```bash
npm run build
```

---

## Architecture & Code Structure

```
salat-tracker/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Header with User ID & quick user switcher
│   │   ├── UserAuthModal.tsx          # User ID entry modal & account switcher
│   │   ├── MonthlyCalendar.tsx        # 7-day grid monthly calendar heatmap
│   │   ├── DailyPrayerSubmission.tsx  # Daily prayer submission & read-only inspector
│   │   ├── CalendarLegend.tsx         # 0-5 green intensity level legend
│   │   └── MonthlySummary.tsx         # Monthly statistics & today's progress card
│   ├── constants/
│   │   └── prayerRules.ts             # Green intensity mapping & color configurations
│   ├── services/
│   │   └── storageService.ts          # Clean localStorage persistence layer
│   ├── utils/
│   │   └── dateUtils.ts               # Local timezone-safe date utilities
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces & types
│   ├── test/
│   │   ├── App.test.tsx               # Full component integration tests
│   │   ├── dateUtils.test.ts          # Date & timezone unit tests
│   │   ├── prayerRules.test.ts        # Intensity rules verification
│   │   └── storageService.test.ts     # Persistence & duplicate prevention tests
│   ├── App.tsx                        # Main dashboard state & coordination
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Tailwind CSS & Plus Jakarta Sans typography
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```
