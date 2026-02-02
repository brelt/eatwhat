# EatWhat Project Status

**Last Updated:** 2026-02-02
**Session:** Backend MVP Implementation Complete

---

## Current State

### ✅ Completed

**Frontend (deployed on Vercel):**
- Landing page customized for EatWhat AU
- Supabase Auth implemented (sign up, sign in, sign out)
- Auth fixed for Vercel (lazy client initialization)
- Environment variables configured in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deployed and accessible at: [your Vercel URL]

**Backend (running locally on port 3001):**
- Express.js + TypeScript + Supabase
- 24 files, fully implemented and tested
- All 8 database tables created in Supabase
- 6 recipes seeded (Chinese recipes with ingredients/steps)
- 98 products imported (Woolworths/Coles/ALDI from scrapers)
- Zero TypeScript errors, zero npm vulnerabilities

**API Endpoints (all working):**
- `GET /api/recipes` — list recipes with filters
- `GET /api/recipes/:id` — recipe details with ingredients/steps
- `GET /api/recipes/recommended` — personalized recommendations
- `GET /api/recipes/favorites` — user's favorites
- `POST /api/recipes/:id/favorite` — add favorite
- `DELETE /api/recipes/:id/favorite` — remove favorite
- `GET /api/deals` — on-sale products
- `GET /api/supermarkets/nearby` — all supermarkets with counts
- `GET /api/user/preferences` — user settings
- `PUT /api/user/preferences` — update settings
- `POST /api/meal-plan/generate` — create 14-meal weekly plan
- `GET /api/meal-plan/:id` — fetch meal plan
- `PUT /api/meal-plan/:id/replace` — swap a meal
- `GET /api/shopping-list/:meal_plan_id` — generate shopping list with fuzzy product matching

**Git Commits:**
- `0f0cb63` — Frontend Vercel fix (lazy Supabase client)
- `06f9536` — Complete backend MVP (24 files)
- All changes pushed to GitHub

**Database (Supabase):**
- 8 tables with RLS policies
- 6 recipes with full data
- 98 supermarket products
- Service Role Key stored in backend `.env`

---

## How to Resume Development

### Start the Backend Locally
```bash
cd eatwhat-backend
npm run dev
# Server runs on http://localhost:3001
```

### Test Endpoints
```bash
# Public endpoints (no auth required)
curl http://localhost:3001/api/recipes
curl http://localhost:3001/api/deals
curl http://localhost:3001/api/supermarkets/nearby

# Auth-protected endpoints (need Bearer token from Supabase)
# Get token by signing in via frontend or Supabase dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/user/preferences
```

### Environment Variables

**Backend (`eatwhat-backend/.env`):**
```
SUPABASE_URL=https://jddkpbpdpczxicrfiqto.supabase.co
SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_KEY=[your service key]
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (`eatwhat-frontend/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=https://jddkpbpdpczxicrfiqto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=[your service key]
```

---

## Next Steps (In Priority Order)

### 1. Deploy Backend to Production
**Options:**
- Vercel (easiest, same platform as frontend)
- Railway (auto-deploys from Git, generous free tier)
- Render (free tier available)

**Required:**
- Set environment variables on the platform
- Update `FRONTEND_URL` to your Vercel domain
- Update frontend to call production backend URL

### 2. Connect Frontend to Backend APIs
**Tasks:**
- Replace mock data with actual API calls
- Implement recipe browsing page (calls `/api/recipes`)
- Implement deals page (calls `/api/deals`)
- Implement meal plan generation UI (calls `/api/meal-plan/generate`)
- Implement shopping list page (calls `/api/shopping-list/:id`)
- Add loading states and error handling
- Test full auth flow end-to-end

### 3. Test Full User Flow
**Scenarios to verify:**
1. User signs up → sets preferences → generates meal plan → views shopping list
2. User browses recipes → favorites a recipe → includes it in next meal plan
3. User views deals → filters by supermarket → finds cheapest ingredients

### 4. Enhancements (Post-MVP)
- Add more recipes (scrape from recipe websites)
- Implement recipe search
- Add nutrition tracking
- Implement recipe ratings/reviews
- Add meal plan history
- Implement shopping list export (PDF/email)
- Add price comparison charts
- Implement recipe sharing

---

## Known Issues / TODOs

- [ ] Backend not yet deployed (only runs locally)
- [ ] Frontend still uses mock data (not connected to backend)
- [ ] Email confirmation enabled on Supabase (users must confirm email to sign in)
- [ ] Only 6 recipes in database (need more variety)
- [ ] Only 98 products imported (need to run scrapers regularly)
- [ ] No automated scraper schedule (manual runs only)
- [ ] Shopping list fuzzy matching may need tuning (threshold currently 0.4)
- [ ] No frontend pages for meal planning yet (need to build UI)
- [ ] BACKEND_PRD.md has incorrect port numbers (says 3000 for Express, should be 3001)

---

## Architecture Summary

```
┌─────────────────┐
│  Frontend       │  Next.js 15, deployed on Vercel
│  (Vercel)       │  http://localhost:3000 (local)
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Backend        │  Express.js + TypeScript
│  (Local:3001)   │  NOT YET DEPLOYED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │  PostgreSQL + Auth + Storage
│  (Cloud)        │  8 tables, RLS enabled
└─────────────────┘
         ▲
         │
┌────────┴────────┐
│  Python         │  3 scrapers (Woolworths/Coles/ALDI)
│  Scrapers       │  Manual execution
└─────────────────┘
```

---

## Key Decisions Made

1. **Port allocation:** Express on 3001, Next.js on 3000 (local)
2. **Ingredient matching:** Fuzzy matching via fuse.js (threshold 0.4)
3. **Meal plan algorithm:** Fisher-Yates shuffle with pool reset (6 recipes → 14 slots)
4. **Auth pattern:** Frontend-first with Supabase Auth (no custom backend auth)
5. **RLS strategy:** Enabled on user data tables, public-read for recipes/products
6. **Scraper execution:** Manual via ts-node scripts (no automation yet)

---

## Quick Reference

**Supabase Dashboard:**
- Project: https://supabase.com/dashboard/project/jddkpbpdpczxicrfiqto
- SQL Editor: where schema.sql was run
- Table Editor: view/edit data
- Auth: manage users, toggle email confirmation

**Important Files:**
- Backend plan: `~/.claude/plans/swift-wobbling-garden.md`
- Backend PRD: `docs/prd/BACKEND_PRD.md`
- Frontend PRD: `docs/prd/FRONTEND_PRD.md`
- Scrapers README: `eatwhat-backend/poc/SCRAPERS_README.md`

**Useful Commands:**
```bash
# Backend
cd eatwhat-backend
npm run dev                          # Start server
npx ts-node scripts/import-recipes.ts   # Re-seed recipes
npx ts-node scripts/import-products.ts  # Re-import products
npx tsc --noEmit                     # Type check

# Frontend
cd eatwhat-frontend
npm run dev                          # Start dev server
npm run build                        # Build for production
vercel                               # Deploy to Vercel

# Python scrapers
cd eatwhat-backend
python scrape_all_supermarkets.py   # Run all scrapers
```

---

**Status:** ✅ Backend MVP complete and working locally. Ready to deploy and connect to frontend.
