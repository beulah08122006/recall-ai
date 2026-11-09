# Recall AI

> **"Your life, remembered."**  
> A personal memory and intelligent organization system.

Recall AI is a calm, personal productivity application built to help you remember important information, track borrowed and lent items, manage timely reminders, organize daily carry lists, and retrieve personal information using AI.

---

## 🌟 Core Highlights

- **Human-Crafted, Calm Aesthetic**: Designed with a premium **Sage Green + Cream** palette (Sidebar: `#183C36`, Canvas: `#E8E8D8`, Primary Accent: `#526F52`, Soft Sage: `#C4D5B0`, Cards: `#FFFFFF`, Main Text: `#26332C`, Borders: `#D9DED2`), avoiding typical loud neon AI dashboards.
- **Context-Aware AI Assistant with Ambient Video**: Retrieves and synthesizes answers using **your actual database records**, backed by an ambient background video with a toggle control. Integrates with **Google Gemini API** when an API key is provided, with an intelligent local synthesis fallback that guarantees accurate, non-hallucinated answers with source citations.
- **Comprehensive Item Tracking**: Tracks both items you lent to others and items you borrowed, calculates overdue status automatically based on return dates, and supports one-click return status updates.
- **Departure Checklists (Before You Leave)**: Reusable routines for college, work commutes, gym sessions, and travel, preventing forgotten essentials (chargers, keys, IDs).
- **People & Relationship Directory**: Connects people to their memories, borrowed/lent items, and reminders with an interactive Connected Records viewer.
- **Real Calculated Insights**: Aggregates memory category distributions, person lending breakdowns, and reminder completion rates from actual database documents.
- **Zero-Trust Data Isolation**: Every endpoint verifies the authenticated JWT identity; users can only ever access their own records.
- **Demo Ready**: Pre-seeded with realistic data for demo user **Beulah** (`demo@recall.ai` / `RecallDemo2026!`), accessible via 1-click Auto-Fill.

---

## 🏗️ Architecture & Technology Stack

```
recall-ai/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/                  # Routing, App wrapper, Protected routes
│   │   ├── components/
│   │   │   ├── layout/           # AppLayout, Mobile header
│   │   │   ├── sidebar/          # Main sidebar navigation & user profile
│   │   │   └── ui/               # Button, Input, Modal, Badge, SearchBar, Toast
│   │   ├── features/
│   │   │   ├── dashboard/        # Home overview, greetings, stats, widgets
│   │   │   ├── memories/         # Memory cards, tags, category filters, CRUD
│   │   │   ├── borrowed/         # Lent & borrowed tracking, overdue indicators
│   │   │   ├── reminders/        # Priority tasks, completion toggles, dates
│   │   │   ├── people/           # Contacts & connected records modal
│   │   │   ├── carry-list/       # Persistent everyday checklist
│   │   │   ├── before-you-leave/ # Departure routines & pack lists
│   │   │   ├── insights/         # Real database aggregations & charts
│   │   │   ├── assistant/        # Context-aware chat with source citations
│   │   │   ├── settings/         # Profile preferences & session management
│   │   │   └── auth/             # Login & Registration pages
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── services/             # Axios API client & domain services
│   │   └── types/                # TypeScript shared interfaces
│   └── dist/                     # Optimized production bundle
│
├── backend/                      # Node.js 22 + Express 5 + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/               # Database auto-connect & env configuration
│   │   ├── controllers/          # Business logic for all 9 core domains
│   │   ├── middleware/           # JWT auth, Zod validation, error handling
│   │   ├── models/               # Mongoose schemas (User, Memory, Item, etc.)
│   │   ├── routes/               # Modular Express API routers
│   │   ├── services/             # AI service (Gemini + Local synthesis) & retrieval
│   │   ├── utils/                # Cryptographic PBKDF2 hashing & RFC JWT tokens
│   │   ├── validators/           # Zod validation schemas
│   │   ├── tests/                # 13-suite automated end-to-end integration test
│   │   └── server.ts             # Express application & SPA static server
│   └── .env                      # Backend configuration
│
└── package.json                  # Root runner scripts
```

### Stack Details

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS v4, Lucide Icons, React Hook Form, Zod |
| **Backend** | Node.js 22 (native TypeScript), Express 5, Mongoose, Zod, Crypto |
| **Database** | MongoDB with Mongoose ODM (indexes, text search, timestamps) |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash`) + Intelligent Context Retrieval Engine |
| **Security** | PBKDF2 SHA-512 password hashing with random 16-byte salt, RFC 7519 HMAC-SHA256 JWT tokens |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or v22 installed
- **MongoDB**: MongoDB 7+ or 8+ installed locally or MongoDB Atlas connection URI

### 1. Configure Environment Variables

In `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/recallai
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_optional_gemini_api_key_here
```

*(Note: If `GEMINI_API_KEY` is not provided, Recall AI automatically utilizes its built-in factual retrieval synthesis engine, meaning the app is 100% functional out of the box).*

### 2. Build the Frontend

```bash
npm run build:frontend
```

This generates the production bundle in `frontend/dist/`.

### 3. Run the Backend & Application

```bash
npm start
```

The Express server will start on port `5000` and automatically serve both the API routes (`/api/*`) and the frontend single-page application at:
👉 **`http://localhost:5000`**

### 4. Development Mode (Optional)

To run the frontend with Vite hot-module replacement and the backend concurrently:

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```
Frontend Vite dev server runs at: `http://localhost:5173` (proxies `/api` to port 5000).

---

## 🧪 Testing

A comprehensive automated test suite validates all full-stack operations:

```bash
npm run test:backend
```

### Verified Test Suites:
1. **Health Check**: Endpoint accessibility
2. **User Registration**: Validation & JWT issuance
3. **User Login**: PBKDF2 password verification
4. **Protected Routes**: Bearer token authentication
5. **People Directory**: Creation & indexing
6. **Memories CRUD**: Creation, category tagging, search
7. **Borrowed & Lent Tracking**: Return dates & overdue calculation
8. **Reminders CRUD**: Priority scheduling & completion toggles
9. **Carry List**: Persistent checklist state & toggle
10. **Departure Routines**: Routine checklist creation
11. **AI Assistant Retrieval**: Querying lent items & memories with source citations
12. **System Insights**: Real MongoDB aggregation metrics
13. **Data Isolation**: Strict user-level access segregation

---

## 🔒 Security Practices

- **Never trust client IDs**: All database mutations derive ownership strictly from the verified JWT payload (`req.user.userId`).
- **No secrets in frontend**: Client code contains no API keys or database connection strings.
- **Cryptographic Hashing**: Passwords stored as `salt:hash` using PBKDF2 with 100,000 iterations and SHA-512.
- **Sanitized Output**: Error middleware suppresses internal stack traces in production environments.

---

## 📄 License

MIT License. Designed and built for **Recall AI**.

