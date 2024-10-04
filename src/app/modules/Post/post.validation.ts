import { z } from 'zod';

// Define the Zod schema
const createPostValidationSchema = z.object({
  body: z.object({
    content: z.string({ required_error: 'Content is required!' }),
    categories: z.array(z.string().optional()).default([]),
    isPremium: z.boolean().optional().default(false),
  }),
});

export const PostValidations = {
  createPostValidationSchema,
};
