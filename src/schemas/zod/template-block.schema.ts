import { z } from 'zod';

export const TemplateBlockSchema = z.object({
  id: z.string().min(1).describe('The id of the block'),
  type: z.enum([
    'header',
    'text',
    'button',
    'image',
    'divider',
    'footer',
    'spacer',
    'columns',
  ]).describe('The type of the block'),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const TemplateBlocksArraySchema = z.array(TemplateBlockSchema);

export type TemplateBlock = z.infer<typeof TemplateBlockSchema>;
