import { KnowledgeBaseIdentifier } from '@lobechat/builtin-tool-knowledge-base';

import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { createSystemRole } from './systemRole';

/**
 * Frontend Interviewer Agent
 *
 * A specialized agent that simulates professional frontend technical interviews.
 * Supports 5 knowledge domains (JS/React/Browser/CSS/Algorithms) with
 * adaptive difficulty, RAG-enhanced questioning from the knowledge base,
 * and structured multi-dimensional scoring.
 *
 * Persist config defaults to DeepSeek — users can override via Agent Settings.
 * Knowledge base tool enables the agent to search uploaded facebooks for question ideas.
 */
export const INTERVIEWER: BuiltinAgentDefinition = {
  avatar: '/avatars/lobe-ai.png',

  persist: {
    chatConfig: {
      historyCount: 8,
    },
    model: 'deepseek-v4-flash',
    provider: 'openai',
  },

  runtime: (ctx) => ({
    plugins: [KnowledgeBaseIdentifier, ...(ctx.plugins || [])],
    systemRole: createSystemRole(ctx.userLocale),
  }),

  slug: BUILTIN_AGENT_SLUGS.interviewer,
};
