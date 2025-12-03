# Frontend Guide - Next.js Single Frontend

## Overview

Your frontend has been consolidated to a **single Next.js application**. The old Vite + React Router setup has been removed.

## Dev Server Status

✅ **Dev server is running** on `http://localhost:3001`

## Quick Links

### Test All Features
**Visit**: `http://localhost:3001/test`

This page has quick links to:
- Candidate interview pages (waiting screen + live interview)
- Interviewer pages
- Login & Signup
- Dashboard

### Direct URLs

| Route | Purpose |
|-------|---------|
| `http://localhost:3001/login` | **Login page** - Connect to backend auth |
| `http://localhost:3001/signup` | Signup page - Create account |
| `http://localhost:3001/dashboard` | Interview management dashboard |
| `http://localhost:3001/interview/[id]` | Interviewer live session view |
| `http://localhost:3001/i/[token]` | **Candidate waiting screen** (what you were looking for!) |
| `http://localhost:3001/test` | **Test page with quick links** |

## Running the Dev Server

### Option 1: Use the script
```bash
cd /home/shani/personalProjects/interviewAI
bash RUN_DEV.sh
```

### Option 2: Direct command (correct Node version)
```bash
cd frontend
~/.nvm/versions/node/v22.21.1/bin/pnpm dev
```

### Option 3: Set up aliases (recommended)
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
alias pnpm="~/.nvm/versions/node/v22.21.1/bin/pnpm"
alias npm="~/.nvm/versions/node/v22.21.1/bin/npm"
```

Then:
```bash
pnpm dev
```

## Backend Integration

### Login/Signup
- Connects to: `http://localhost:8080/api/auth/login`
- Connects to: `http://localhost:8080/api/auth/signup`
- **Stores token in localStorage** for future requests
- **Auto-redirects to login** if unauthorized (401)

### Candidate Interview Page
- Fetches interview data from: `http://localhost:8080/api/interviews/link/{token}`
- Shows waiting screen while `status === "waiting" || "pending"`
- Shows live interview when `status === "in_progress"`

### To Test Candidate Page
You can visit any token URL and it will try to fetch from your backend:
```
http://localhost:3000/i/xK9mPq2nR4vL
http://localhost:3000/i/aB3cD4eF5gH6
http://localhost:3000/i/iJ7kL8mN9oP0
```

If backend is not available, the UI will still display (waiting for backend data).

## Project Structure

```
frontend/
├── app/                          # Next.js pages
│   ├── login/page.tsx           # Login (now with auth ✅)
│   ├── signup/page.tsx          # Signup
│   ├── dashboard/page.tsx       # Interview list
│   ├── interview/[id]/page.tsx  # Interviewer view
│   ├── i/[token]/page.tsx       # Candidate waiting screen ✅
│   ├── test/page.tsx            # Test page (NEW) ✅
│   └── layout.tsx               # Root layout
├── components/                   # UI components
├── stores/                        # State management (Zustand)
│   └── authStore.ts            # Auth state
├── services/                      # API clients
│   ├── apiClient.ts            # Axios with interceptors
│   └── authService.ts          # Auth endpoints
├── .env.local                    # Environment variables
├── package.json
└── pnpm-lock.yaml
```

## Key Files Modified/Created

### ✅ Created
- `/stores/authStore.ts` - Zustand store for auth
- `/services/apiClient.ts` - Axios client with interceptors
- `/services/authService.ts` - Auth service
- `/app/test/page.tsx` - Test page
- `/.env.local` - Environment config

### ✅ Updated
- `/app/login/page.tsx` - Now connects to backend
- `/app/signup/page.tsx` - Now connects to backend

### ✅ Already Exist & Working
- `/app/i/[token]/page.tsx` - Candidate interview (fetches from backend)
- `/app/interview/[id]/page.tsx` - Interviewer view (mock data)
- `/app/dashboard/page.tsx` - Interview list

## Environment Variables

File: `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Change this if your backend is on a different port/host.

## Deleted

- ❌ `/frontend/src/` (entire Vite + React Router setup)
- ❌ All Vite configuration files

## What's Working

- ✅ Login/Signup with backend integration
- ✅ Candidate waiting screen (fetches interview data)
- ✅ Interviewer live session view (mock data)
- ✅ Single Next.js frontend
- ✅ Zustand state management
- ✅ API interceptors with Bearer token
- ✅ Auto-redirect on unauthorized access

## Troubleshooting

### "pnpm not found"
Use the full path with Node 22.21.1:
```bash
~/.nvm/versions/node/v22.21.1/bin/pnpm dev
```

Or set up the alias in your shell config.

### Login not connecting to backend
1. Make sure your backend is running on `http://localhost:8080`
2. Check the `.env.local` file for correct `NEXT_PUBLIC_API_BASE_URL`
3. Open browser DevTools (F12) → Network → check the login request

### Candidate page not loading data
1. Make sure your backend has interviews with the token in the URL
2. Check browser console for errors
3. Backend should return data from `/api/interviews/link/{token}`

## Next Steps

1. **Test login**: Go to `http://localhost:3000/login`
2. **Test candidate page**: Go to `http://localhost:3000/test` and click a candidate link
3. **Check backend integration**: Open DevTools → Network tab to see API calls
4. **Review interview screens**: Pages already exist and are ready to use

All done! 🎉
