import { z } from 'zod';

export const savePrayerSchema = z.object({
  body: z.object({
    date: z
      .string({ required_error: 'Date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    count: z
      .number()
      .int()
      .min(0, 'Count must be at least 0')
      .max(5, 'Count cannot exceed 5')
      .optional(),
    fajr: z.boolean().optional(),
    dhuhr: z.boolean().optional(),
    asr: z.boolean().optional(),
    maghrib: z.boolean().optional(),
    isha: z.boolean().optional(),
  }),
});

export const monthQuerySchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
      .optional(),
  }),
});
