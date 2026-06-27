# Nudge: Deployment Guide

This guide details the procedures for compiling, building, database provisioning, and hosting the Nudge application.

---

## 1. Database Provisioning (Supabase)

To link Nudge to a live Supabase project:
1. **Create Supabase Project**: Set up a free account and spin up a new project.
2. **Apply Database Schema**: Navigate to the SQL Editor in Supabase, copy the contents of the local **[schema.sql](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/schema.sql)**, paste them, and click **Run**.
   - This creates tables (`profiles`, `tasks`, `habits`) and configures RLS policies and trigger sync profiles.

---

## 2. Environment Variables Injection

Create a `.env` or `.env.local` file in the root directory (remember: this is ignored by Git):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Fill in the values from your Supabase Project Settings -> API page.

---

## 3. Local Production Bundle Verification

Before deploying, always test building locally to ensure all TypeScript checks pass:
```bash
# Clean install
npm install

# Run TypeScript compilation check
npm run build
```
This outputs a minified production bundle in the `dist/` directory.

---

## 4. Hosting Options

### A. Vercel
1. Install Vercel CLI or link your repository via Vercel Dashboard.
2. Ensure Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are entered in the Project Settings on Vercel.
3. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### B. Netlify
1. Connect repository on Netlify.
2. Add build environment variables.
3. Configuration:
   - **Base directory**: `/`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
