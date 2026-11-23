import { Router } from 'express';
import authRoutes from './auth.routes.js';
import prayerRoutes from './prayer.routes.js';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Salat Tracker API',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/prayers', prayerRoutes);

export default apiRouter;
