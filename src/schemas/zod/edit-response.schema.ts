import { z } from 'zod';
import { TemplateBlockSchema } from './template-block.schema';

export const EditResponseSchema = z.object({
  updatedBlocks: z.array(TemplateBlockSchema).min(1),
  changedBlockIds: z.array(z.string()).default([]),
  addedBlockIds: z.array(z.string()).default([]),
  removedBlockIds: z.array(z.string()).default([]),
  summary: z.string().min(1),
});

export type EditResponse = z.infer<typeof EditResponseSchema>;
