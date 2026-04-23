require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT) || 3000;

// Handle unhandled rejections and uncaught exceptions so the process can
// log and exit (or be restarted by the platform) instead of crashing silently.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production you may want to exit and let the process manager restart the app
  // process.exit(1);
});

app.listen(port, () => {
  console.log(`JokeVerse listening on port ${port}`);
});
