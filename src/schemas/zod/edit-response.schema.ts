import { z } from 'zod';
import { TemplateBlockSchema } from './template-block.schema';

export const EditResponseSchema = z.object({
  updatedBlocks: z.array(TemplateBlockSchema).min(1).describe('The blocks that were updated'),
  changedBlockIds: z.array(z.string()).default([]).describe('The ids of the blocks that were changed'),
  addedBlockIds: z.array(z.string()).default([]).describe('The ids of the blocks that were added'),
  removedBlockIds: z.array(z.string()).default([]).describe('The ids of the blocks that were removed'),
  summary: z.string().min(1).describe('A summary of the changes'),
});

export type EditResponse = z.infer<typeof EditResponseSchema>;
