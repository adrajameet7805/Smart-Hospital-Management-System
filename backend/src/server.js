// ── Fail-fast environment validation ─────────────────
const REQUIRED_ENV = ['JWT_SECRET','DB_HOST','DB_PASSWORD','REDIS_URL'];
const _missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (_missing.length > 0) {
  console.error('FATAL: Missing required env variables:', _missing.join(', '));
  console.error('Copy .env.example to .env and fill all values.');
  process.exit(1);
}

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const { initializeDatabase } = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'http://localhost,http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('WebSocket CORS blocked: ' + origin));
    },
    methods: ['GET','POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked for origin: ' + origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsMiddleware);
app.set('io', io);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Smart Hospital API', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsEndpoint);

function registerRoutes() {
  app.use('/api/v1/patients',     apiLimiter);
  app.use('/api/v1/doctors',      apiLimiter);
  app.use('/api/v1/appointments', apiLimiter);
  app.use('/api/v1/billing',      apiLimiter);
  app.use('/api/v1/pharmacy',     apiLimiter);
  app.use('/api/v1/ambulance',    apiLimiter);
  app.use('/api/v1/analytics',    apiLimiter);
  app.use('/api/v1/qr',           apiLimiter);
  app.use('/api/v1/ai',           apiLimiter);
  // NOTE: /api/v1/auth is intentionally excluded.
  // auth.js applies its own dev-safe authLimiter on login only.

  app.use('/api/v1/auth', require('./routes/v1/auth'));
  app.use('/api/v1/patients', require('./routes/v1/patients'));
  app.use('/api/v1/doctors', require('./routes/v1/doctors'));
  app.use('/api/v1/appointments', require('./routes/v1/appointments'));
  app.use('/api/v1/billing', require('./routes/v1/billing'));
  app.use('/api/v1/pharmacy', require('./routes/v1/pharmacy'));
  app.use('/api/v1/ambulance', require('./routes/v1/ambulance'));
  app.use('/api/v1/analytics', require('./routes/v1/analytics'));
  app.use('/api/v1/qr', require('./routes/v1/qrCheckin'));
  app.use('/api/v1/ai', require('./routes/v1/ai'));

  app.use('/api/auth', (req, res) => res.redirect(307, `/api/v1/auth${req.url}`));
  app.use('/api/patients', (req, res) => res.redirect(307, `/api/v1/patients${req.url}`));
  app.use('/api/doctors', (req, res) => res.redirect(307, `/api/v1/doctors${req.url}`));
  app.use('/api/appointments', (req, res) => res.redirect(307, `/api/v1/appointments${req.url}`));
  app.use('/api/billing', (req, res) => res.redirect(307, `/api/v1/billing${req.url}`));
  app.use('/api/pharmacy', (req, res) => res.redirect(307, `/api/v1/pharmacy${req.url}`));
  app.use('/api/ambulance', (req, res) => res.redirect(307, `/api/v1/ambulance${req.url}`));
  app.use('/api/analytics', (req, res) => res.redirect(307, `/api/v1/analytics${req.url}`));

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
  });

  app.use(errorHandler);
}

registerRoutes();

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('join', (data) => {
    if (data.userId) socket.join(`user-${data.userId}`);
    if (data.role) socket.join(`role-${data.role}`);
  });
  socket.on('ambulance-location', (data) => {
    io.to('role-admin').emit('ambulance-update', data);
  });
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

async function startServer() {

  await initializeDatabase();

  const PORT = process.env.PORT || 5000;
  await new Promise((resolve, reject) => {
    const handleError = (err) => {
      server.off('error', handleError);
      reject(err);
    };

    server.once('error', handleError);
    server.listen(PORT, () => {
      server.off('error', handleError);
      logger.info(`Smart Hospital API listening on http://localhost:${PORT}`);
      resolve();
    });
  });

  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.io = io;
module.exports.startServer = startServer;
