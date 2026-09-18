import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { extractSession } from './src/server/auth/middleware.ts';
import { authRouter } from './src/server/routes/authRoutes.ts';
import { adminUserRouter } from './src/server/routes/adminUserRoutes.ts';
import { adminProtectedOpsRouter } from './src/server/routes/adminProtectedOps.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Body & Cookie Parsers
  app.use(express.json());
  app.use(cookieParser());

  // Global Session Extractor (Bearer header & HTTP Cookie)
  app.use(extractSession);

  // Health probe
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication & Session Endpoints
  app.use('/api/auth', authRouter);

  // Admin User Management Endpoints
  app.use('/api/admin/users', adminUserRouter);

  // Server-Side Protected Operations (Products, Inventory, Finance, Orders, Payments)
  app.use('/api/admin/ops', adminProtectedOpsRouter);
  app.use('/api/admin', adminProtectedOpsRouter);

  // Vite middleware for development vs static build for production
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAYVEN] Unified Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
