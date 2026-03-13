import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  limit: z.string().optional().transform(val => parseInt(val || '20', 10)),
  search: z.string().optional()
});

export const createBlacklistSchema = z.object({
  jti: z.string().min(1),
  expiresAt: z.union([z.number(), z.string(), z.date()]),
  userId: z.number().int().positive().optional(),
  reason: z.string().optional()
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1)
});
