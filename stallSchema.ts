import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'id harus berupa angka' })
    .int('id harus bilangan bulat')
    .positive('id harus lebih dari 0')
    .openapi({ example: 3, description: 'ID warung' }),
});

export const stallQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'search maksimal 100 karakter')
    .optional(),
  category: z
    .string()
    .trim()
    .max(50, 'category maksimal 50 karakter')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createStallSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),
  category: z.string().trim().max(50, 'category maksimal 50 karakter').optional(),
  location: z.string().max(100, 'location maksimal 100 karakter').optional(),
  description: z.string().max(1000, 'description maksimal 1000 karakter').optional(),
});

export const updateStallSchema = createStallSchema.partial();

export type IdParam = z.infer<typeof idParamSchema>;
export type StallQuery = z.infer<typeof stallQuerySchema>;
export type CreateStallInput = z.infer<typeof createStallSchema>;
export type UpdateStallInput = z.infer<typeof updateStallSchema>;
