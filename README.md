# Nudge: The AI-Powered Productivity Companion

Nudge is a proactive productivity companion designed to help students, professionals, and entrepreneurs plan, prioritize, and complete critical tasks before deadlines are missed. 

Unlike passive trackers that rely on easily ignored notifications, Nudge calculates dynamic priority scores, detects deadline risks early, and suggests context-aware recovery plans.

---

## 🚀 Key Features

1. **Intelligent Priority Engine**: Dynamic priority scoring based on effort cost, energy levels, and deadline proximity.
2. **Proactive Deadline Risk Alerts**: Visual dashboard warnings when estimated task effort exceeds available free time.
3. **AI smart recovery paths**: Actionable 3-step recovery checklist automatically built when tasks fall overdue.
4. **Context-Aware Nudges**: Personalized AI recommendations matching current time slots and stress indicators.
5. **Interactive 3D Workspace**: Gamified check-point garden and calendar assets rendered in an immersive sky canvas.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Database / Auth**: Supabase PostgreSQL
- **Animations**: Framer Motion
- **3D Engine**: Three.js, React Three Fiber, Drei
- **Testing**: Vitest + jsdom + React Testing Library
- **Styling**: Vanilla Tailwind CSS + Glassmorphism

---

## 📁 Project Documentation

For in-depth explanations on development setups, refer to:
- 📖 **[Architecture & Math Engine](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/docs/ARCHITECTURE.md)**
- 🔒 **[Security Auditing & Row Level Security (RLS)](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/docs/SECURITY.md)**
- 🧪 **[Testing Suites Guide](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/docs/TESTING.md)**
- 🌐 **[Deployment & Hosting Setup](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/docs/DEPLOYMENT.md)**

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env` file at the root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Unit Tests
```bash
npm run test
```
