# Authentication & Database Setup Guide

This guide will help you set up Google OAuth authentication and the database for the TimeTravel.AI trading dashboard.

## Overview

- **/demo** - Working demo with mock data (no authentication required)
- **/login** - Login page with Google One Tap
- **/app** - Authenticated dashboard with real user data

## 1. Database Setup

The app uses SQLite with libsql for local development.

```bash
# The database will be created automatically at ./local.db
# on first run. No additional setup needed for local development.
```

## 2. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
6. Click **Create**
7. Copy your **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Google OAuth credentials in `.env.local`:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Database (SQLite local file)
   DATABASE_URL=file:./local.db
   ```

## 3. Run the Application

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit:
- **http://localhost:3000** - Landing page
- **http://localhost:3000/demo** - Demo dashboard (no login required)
- **http://localhost:3000/login** - Login page
- **http://localhost:3000/app** - Authenticated app (requires login)

## 4. Using the Application

### Demo Mode (`/demo`)
- Full-featured dashboard with mock data
- No authentication required
- Great for testing and demonstrations
- All 7 dashboard tabs available

### Authenticated App (`/app`)
- Requires Google login
- Personal portfolio and data
- Create and manage strategies
- Add signals to watchlist
- Real-time portfolio tracking

### First Login
1. Go to `/login`
2. Click "Sign in with Google"
3. Authorize the application
4. You'll be redirected to `/app`
5. Your portfolio is automatically created with $100,000 starting capital

## 5. API Endpoints

### Authentication
- `GET/POST /api/auth/[...all]` - Better-auth handler

### User Data
- `GET /api/user/portfolio` - Get portfolio summary and positions
- `PATCH /api/user/portfolio` - Update portfolio
- `GET /api/user/strategies` - Get user strategies
- `POST /api/user/strategies` - Create strategy
- `PATCH /api/user/strategies/[id]` - Update strategy
- `DELETE /api/user/strategies/[id]` - Delete strategy
- `GET /api/user/signals` - Get user signals
- `POST /api/user/signals` - Add signal to watchlist

## 6. Database Schema

The database automatically creates these tables:
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth accounts
- `portfolios` - User portfolios
- `strategies` - Trading strategies
- `signals` - Watchlist signals
- `positions` - Open positions
- `trades` - Trade history

## 7. Production Deployment

For production deployment:

1. Set up a production database (recommend Turso or another libsql provider)
2. Update `DATABASE_URL` with production database URL
3. Add `DATABASE_AUTH_TOKEN` if using Turso
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Add your production domain to Google OAuth authorized origins/redirects

## Troubleshooting

### "Unauthorized" errors
- Check that `.env.local` has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs in Google Cloud Console match your app URL

### Database errors
- The database file will be created automatically
- Ensure write permissions in the project directory

### Google One Tap not showing
- Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Verify you're on `localhost:3000` or an authorized origin

## Development Tips

1. Use `/demo` for testing UI without authentication
2. Test auth flow in `/login` and `/app`
3. All user data is isolated per Google account
4. Use browser DevTools to inspect API calls
5. Check console for any auth-related errors
