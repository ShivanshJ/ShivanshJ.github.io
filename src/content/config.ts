import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    highlight: z.string(),
    stack: z.array(z.string()),
    backers: z
      .array(
        z.union([
          z.string(),
          z.object({ name: z.string(), url: z.string().url().optional() }),
        ]),
      )
      .optional(),
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    link: z.string().url().optional(),
    order: z.number(),
  }),
});

export const collections = { work };
