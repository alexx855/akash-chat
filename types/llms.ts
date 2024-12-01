export interface LLM {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
  capabilities?: string[];
}

export enum LLMID {
  MISTRAL = 'mistral',
  MIXTRAL = 'mixtral',
  DOLPHINMIXTRAL = 'dolphin-mixtral',
  NOUSHERMESMIXTRAL = 'nous-hermes2-mixtral',
  META_LLAMA_TOOLS = 'llama3-groq-tool-use',
  NVIDIA_LLAMA_70B = 'nvidia-Llama-3-1-Nemotron-70B-Instruct-HF',
  META_LLAMA_23B = 'Meta-Llama-3-2-3B-Instruct',
  META_LLAMA_8B = 'Meta-Llama-3-1-8B-Instruct-FP8',
  META_LLAMA_405B = 'Meta-Llama-3-1-405B-Instruct-FP8',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = LLMID.META_LLAMA_TOOLS;

export const LLMS: Record<LLMID, LLM> = {
  [LLMID.META_LLAMA_TOOLS]: {
    id: LLMID.META_LLAMA_TOOLS,
    name: 'Llama-3.1 Groq Tool Use',
    capabilities: ['tools'],
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.MISTRAL]: {
    id: LLMID.MISTRAL,
    name: 'Mistral-7B',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.NOUSHERMESMIXTRAL]: {
    id: LLMID.NOUSHERMESMIXTRAL,
    name: 'Nous Hermes 2 Mixtral',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.MIXTRAL]: {
    id: LLMID.MIXTRAL,
    name: 'Mixtral',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.DOLPHINMIXTRAL]: {
    id: LLMID.DOLPHINMIXTRAL,
    name: 'Dolphin Mixtral',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.NVIDIA_LLAMA_70B]: {
    id: LLMID.NVIDIA_LLAMA_70B,
    name: 'Nvidia Llama 3 70B',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.META_LLAMA_23B]: {
    id: LLMID.META_LLAMA_23B,
    name: 'Meta Llama 3 2.3B',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.META_LLAMA_8B]: {
    id: LLMID.META_LLAMA_8B,
    name: 'Meta Llama 3 8B',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [LLMID.META_LLAMA_405B]: {
    id: LLMID.META_LLAMA_405B,
    name: 'Meta Llama 3 405B',
    maxLength: 12000,
    tokenLimit: 4000,
  },
};
