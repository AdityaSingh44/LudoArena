import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/src/db/connection.js';
import authRoutes from './server/src/routes/authRoutes.js';
import statsRoutes from './server/src/routes/statsRoutes.js';
import { GameSocketServer } from './server/src/sockets/gameSocket.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Connect to DB with fallback
  await connectDB();

  // Express middleware
  app.use(cors());
  app.use(express.json());

  // Socket.IO setup
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Initialize Game Socket Engine
  new GameSocketServer(io);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stats', statsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LudoArena API & Real-time Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 LudoArena server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
