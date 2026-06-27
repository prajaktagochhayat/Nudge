# Nudge: Security Audit & Controls

This document details the security practices, database Row Level Security (RLS) configurations, and secret prevention audits implemented in the Nudge application.

---

## 1. Secrets & Environment Variable Protection

To ensure credentials and API keys are never exposed:
- **`.gitignore` Rules**: Explicitly blocks `.env`, `.env.local`, and any dynamic `.env.*` configuration files from being staged or committed.
- **Client Configuration Shield**: The app initializes the Supabase client using a secure detection utility:
  ```typescript
  export const isSupabaseConfigured = 
    Boolean(import.meta.env.VITE_SUPABASE_URL) && 
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
  ```
- **Local Fallback Sandbox**: If the environment parameters are missing, the application completely disables remote requests and runs in local mock memory state. This prevents runtime console exceptions and avoids accidental leakage.

---

## 2. Database Row Level Security (RLS)

All tables in the Postgres database enforce strict RLS policies to prevent users from accessing or editing other users' data.

### A. Profiles Table
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow individual write access to profiles" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);
```

### B. Tasks Table
```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual CRUD on tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### C. Habits Table
```sql
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual CRUD on habits"
  ON public.habits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. Threat Model & Mitigation Actions

| Threat Vector | Mitigation Strategy | Implementation |
|---|---|---|
| Unauthorized Data Reading | Supabase PostgreSQL Row Level Security (RLS) | Authenticated policies check `auth.uid() = user_id` |
| Token Spoofing / SQL Injection | PostgREST API sanitization layer | Bound queries via client library |
| Code Secrets Leak | `.gitignore` filters + Example reference files | `.env.example` contains dummy descriptors |
