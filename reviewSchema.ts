import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int('Rating harus bilangan bulat')
    .min(1, 'Rating minimal 1')
    .max(5, 'Rating maksimal 5')
    .openapi({ example: 5 }),
  comment: z.string().trim().max(1000, 'Komentar maksimal 1000 karakter').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
