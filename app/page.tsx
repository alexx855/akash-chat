"use client";

import Chat from "@/components/Chat/Chat";
import { ErrorMessage } from "@/types/error";
import { LLM, LLMID, LLMS } from "@/types/llms";

const fetchModels = async () => {
  const error = {
    title: 'Error fetching models.',
    code: null,
    messageLines: ['There was an error fetching the models.'],
  } as ErrorMessage;

  const response = await fetch('/api/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      Object.assign(error, {
        code: data.error?.code,
        messageLines: [data.error?.message],
      });
    } catch (e) {
      console.error('Error fetching models:', e);
    }
    return error;
  }

  const data: LLM[] = await response.json();

  if (!data) {
    return error;
  }

  // add tmp model with tools capability
  data.push(LLMS[LLMID.META_LLAMA_TOOLS]);

  if (data.length === 0) {
    return {
      title: `No models found with the capability to use tools.`,
      code: null,
      messageLines: ['There was an error fetching the models.'],
    } as ErrorMessage;
  }
  return data;
}

export default function Home() {
  const models = [LLMS[LLMID.META_LLAMA_TOOLS]];
  // const models = await fetchModels();
  if ('errorMessage' in models) {
    // Type assertion to tell TypeScript that errorMessage is a string
    throw new Error(models.errorMessage as string);
  }

  const defaultModelId = process.env.DEFAULT_MODEL as LLMID || LLMID.META_LLAMA_TOOLS;

  return (<Chat defaultModelId={defaultModelId} models={models as LLM[]} />);
}