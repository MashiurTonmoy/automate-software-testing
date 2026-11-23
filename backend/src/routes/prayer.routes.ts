import { Router } from 'express';
import { prayerController } from '../controllers/prayer.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { savePrayerSchema, monthQuerySchema } from '../validations/prayer.schema.js';

const router = Router();

// Protect all prayer routes with JWT authentication
router.use(authenticate);

router.get('/', validate(monthQuerySchema), prayerController.getMonthlyRecords);
router.get('/today', prayerController.getTodayRecord);
router.put('/today', validate(savePrayerSchema), prayerController.savePrayerRecord);
router.get('/summary', validate(monthQuerySchema), prayerController.getMonthlySummary);

export default router;
