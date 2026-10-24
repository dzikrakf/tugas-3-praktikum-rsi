import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerSchema, loginSchema } from '../schemas/authSchema.ts';
import {
  idParamSchema,
  stallQuerySchema,
  createStallSchema,
  updateStallSchema,
} from '../schemas/stallSchema.ts';
import { createReviewSchema } from '../schemas/reviewSchema.ts';

const registry = new OpenAPIRegistry();

registry.register('Register', registerSchema);
registry.register('Login', loginSchema);
registry.register('StallQuery', stallQuerySchema);
registry.register('StallId', idParamSchema);
registry.register('CreateStall', createStallSchema);
registry.register('UpdateStall', updateStallSchema);
registry.register('CreateReview', createReviewSchema);

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  description: 'Mendaftarkan akun baru',
  request: {
    body: {
      content: {
        'application/json': { schema: registerSchema },
      },
    },
  },
  responses: {
    201: { description: 'Registrasi berhasil' },
    400: { description: 'Validasi gagal' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  description: 'Login dan mendapatkan token JWT',
  request: {
    body: {
      content: {
        'application/json': { schema: loginSchema },
      },
    },
  },
  responses: {
    200: { description: 'Login berhasil' },
    401: { description: 'Email atau password salah' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  description: 'Melihat user yang sedang login',
  responses: {
    200: { description: 'Data user berhasil diambil' },
    401: { description: 'Token tidak ada atau tidak valid' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls',
  description: 'Melihat daftar warung',
  request: {
    query: stallQuerySchema,
  },
  responses: {
    200: { description: 'Daftar warung berhasil diambil' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls/{id}',
  description: 'Melihat detail warung',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: { description: 'Detail warung berhasil diambil' },
    404: { description: 'Warung tidak ditemukan' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls',
  description: 'Membuat warung (owner/admin)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createStallSchema },
      },
    },
  },
  responses: {
    201: { description: 'Warung berhasil dibuat' },
    401: { description: 'Belum login' },
    403: { description: 'Tidak memiliki akses' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/stalls/{id}',
  description: 'Mengubah warung milik sendiri (owner) atau warung apa pun (admin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': { schema: updateStallSchema },
      },
    },
  },
  responses: {
    200: { description: 'Warung berhasil diperbarui' },
    401: { description: 'Belum login' },
    403: { description: 'Tidak memiliki akses ke warung' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/stalls/{id}',
  description: 'Menghapus warung (admin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: { description: 'Warung berhasil dihapus' },
    401: { description: 'Belum login' },
    403: { description: 'Tidak memiliki akses' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls/{id}/reviews',
  description: 'Menambahkan review pada warung',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': { schema: createReviewSchema },
      },
    },
  },
  responses: {
    201: { description: 'Review berhasil dibuat' },
    401: { description: 'Belum login' },
    404: { description: 'Warung tidak ditemukan' },
    409: { description: 'Review sudah pernah dibuat' },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);


export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Review Kantin API',
    version: '1.0.0',
    description: 'API untuk pengelolaan warung dan review kantin',
  },
  servers: [{ url: 'http://localhost:3000' }],
});

openApiDocument.components = {
  ...openApiDocument.components,
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};
