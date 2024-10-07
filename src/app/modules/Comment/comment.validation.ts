import { z } from 'zod';

// Validation for creating/updating a comment
const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: 'Content is required' })
      .max(5000, 'Content is too long'),
    post: z.string({ required_error: 'PostId is required' }),
    parent: z.string().optional(),
  }),
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: 'Content is required' })
      .max(5000, 'Content is too long'),
  }),
});

export const CommentValidation = {
  createCommentSchema,
  updateCommentSchema,
};
