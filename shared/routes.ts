import { z } from 'zod';
import { insertStorySchema, insertCharacterSchema, insertSpeechBubbleSchema, stories, panels, characters, speechBubbles } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  stories: {
    create: {
      method: 'POST' as const,
      path: '/api/stories',
      input: insertStorySchema.extend({
        characters: z.array(insertCharacterSchema.omit({ storyId: true })).optional(),
      }),
      responses: {
        201: z.custom<typeof stories.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stories/:id',
      responses: {
        200: z.custom<typeof stories.$inferSelect & { panels: typeof panels.$inferSelect[], characters: typeof characters.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/stories',
      responses: {
        200: z.array(z.custom<typeof stories.$inferSelect>()),
      },
    },
  },
  panels: {
    generate: {
      method: 'POST' as const,
      path: '/api/panels/:id/generate',
      responses: {
        200: z.custom<typeof panels.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/stories/:id/panels',
      responses: {
        200: z.array(z.custom<typeof panels.$inferSelect & { speechBubbles: typeof speechBubbles.$inferSelect[] }>()),
      },
    }
  },
  bubbles: {
    create: {
      method: 'POST' as const,
      path: '/api/panels/:panelId/bubbles',
      input: insertSpeechBubbleSchema.omit({ panelId: true }),
      responses: {
        201: z.custom<typeof speechBubbles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bubbles/:id',
      input: insertSpeechBubbleSchema.partial(),
      responses: {
        200: z.custom<typeof speechBubbles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bubbles/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
