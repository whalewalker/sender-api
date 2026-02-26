import { z } from 'zod';
import { TemplateBlockSchema } from './template-block.schema';

export const GenerationResponseSchema = z.object({
  name: z.string().min(1).describe('The name of the template'),
  category: z.string().min(1).describe('The category of the template'),
  type: z.enum(['transactional', 'marketing']).default('transactional').describe('The type of the template'),
  blocks: z.array(TemplateBlockSchema).min(1).describe('The blocks of the template'),
  variables: z.array(z.string()).default([]).describe('The variables of the template'),
});

export const GenerationSuiteResponseSchema = z.array(GenerationResponseSchema);

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
export type GenerationSuiteResponse = z.infer<typeof GenerationSuiteResponseSchema>;
