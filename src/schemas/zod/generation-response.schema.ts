import { z } from 'zod';
import { TemplateBlockSchema } from './template-block.schema';

export const GenerationResponseSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['transactional', 'marketing']).default('transactional'),
  blocks: z.array(TemplateBlockSchema).min(1),
  variables: z.array(z.string()).default([]),
});

export const GenerationSuiteResponseSchema = z.array(GenerationResponseSchema);

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
export type GenerationSuiteResponse = z.infer<typeof GenerationSuiteResponseSchema>;
