# JokeVerse — Deploying to Railway

Quick steps to run this project locally or deploy on Railway.

Prerequisites
- Node.js >= 18

Local run
1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and edit values (or set env vars in your environment):

```bash
cp .env.example .env
# edit .env
```

3. Start the app:

```bash
npm start
```

Railway deployment
1. Push your repo to a Git provider and create a new Railway project linked to this repo.
2. In Railway, add the following environment variables (Railway provides `PORT` automatically):

- `SESSION_SECRET` (required in production)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Optional: `CORS_ORIGINS` (comma-separated allowed origins)
- Optional: `SESSION_MAX_AGE_MS`, `NODE_ENV=production`

3. Railway will run `npm install` and then `npm start` (the `start` script runs `node src/index.js`).

Notes
- The app reads configuration from environment variables (see `.env.example`).
- Static files are served from the project root and `public/` if present.
- Basic error handling and graceful startup logging were added to improve production stability.

Files changed for deployment:
- `src/index.js` — dynamic PORT, error handlers
- `src/app.js` — CORS from `CORS_ORIGINS`, static `public` serving, error middleware
