require('dotenv').config({ path: '.env.local' });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    if (process.send) {
      process.send('ready');
    }
  });

  // Graceful shutdown handler for both signals
  // PM2 sends SIGTERM for graceful shutdown, SIGINT for interrupt
  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      console.error('Forcefully shutting down after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
