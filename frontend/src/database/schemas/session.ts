import { z } from 'zod';

import { MetaDataSchema } from '@/types/meta';

const fewShotsSchema = z.array(
  z.object({
    content: z.string(),
    role: z.string(),
  }),
);

export const AgentSchema = z.object({
  autoCreateTopicThreshold: z.number().default(2),
  compressThreshold: z.number().default(32).optional(),
  enableAutoCreateTopic: z.boolean().default(true),
  enableCompressThreshold: z.boolean().optional(),
  enableHistoryCount: z.boolean().optional(),
  enableMaxTokens: z.boolean().optional(),
  fewShots: fewShotsSchema.optional(),
  historyCount: z.number().default(32).optional(),
  inputTemplate: z.string().optional(),
  knowledgeBase: z.string().optional(),
  searchEngine: z.boolean().optional(),
  model: z.string().default('chatglm3-6b'),
  params: z.object({
    frequency_penalty: z.number().default(0).optional(),
    max_tokens: z.number().optional(),
    presence_penalty: z.number().default(0).optional(),
    temperature: z.number().default(0.6).optional(),
    top_p: z.number().default(1).optional(),
  }),
  plugins: z.array(z.string()).optional(),
  provider: z.string().default('openai').optional(),
  systemRole: z.string().default(''),
});

export const DB_SessionSchema = z.object({
  config: AgentSchema,
  group: z.string().default('default'),
  meta: MetaDataSchema,
  pinned: z.number().int().min(0).max(1).optional(),
  type: z.enum(['agent', 'group']).default('agent'),
});

export type DB_Session = z.infer<typeof DB_SessionSchema>;
