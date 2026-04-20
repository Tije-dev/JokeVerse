const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const jokesRouter = require('./routes/jokes');
const authRouter = require('./routes/auth');
const saveJokeRouter = require('./routes/saveJoke');
const { requirePageAuth } = require('./middleware/auth');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, origin);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be set in production.');
}

const isProduction = process.env.NODE_ENV === 'production';
const sessionMaxAgeMs = Number.parseInt(process.env.SESSION_MAX_AGE_MS || '', 10);
const cookieMaxAge = Number.isFinite(sessionMaxAgeMs) ? sessionMaxAgeMs : 7 * 24 * 60 * 60 * 1000;

app.use(
  session({
    name: 'jokeverse.sid',
    secret: sessionSecret || 'dev-only-insecure-set-SESSION_SECRET',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    unset: 'destroy',
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.' },
});

const saveJokeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.' },
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/jokes', jokesRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/save-joke', saveJokeLimiter, saveJokeRouter);

const publicRoot = path.join(__dirname, '..');

const protectedHtmlFiles = ['pages/main.html', 'pages/save.html'];
protectedHtmlFiles.forEach((relativePath) => {
  const urlPath = `/${relativePath.replace(/\\/g, '/')}`;
  app.get(urlPath, requirePageAuth, (req, res) => {
    res.sendFile(path.join(publicRoot, relativePath));
  });
});
// Browsers request /favicon.ico by default; serve SVG at that path to avoid 404 noise
app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/favicon.svg');
});
app.use(express.static(publicRoot));

app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ success: false, message: 'Not found.' });
    return;
  }
  res.status(404).send('Not found');
});

module.exports = app;
