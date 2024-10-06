import { z } from 'zod';

// Validation for creating/updating a comment
const createUpdateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .max(5000, 'Content is too long'),
  post: z.string().optional(),
  parent: z.string().optional(),
});

export const CommentValidation = {
  createUpdateCommentSchema,
};
