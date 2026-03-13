import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  limit: z.string().optional().transform(val => parseInt(val || '20', 10)),
  search: z.string().optional()
});

export const updateAuditLogSchema = z.object({
  action: z.string().optional(),
  success: z.boolean().optional(),
  errorMessage: z.string().nullable().optional(),
  metadata: z.any().optional()
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1)
});
