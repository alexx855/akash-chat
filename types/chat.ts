import { Message } from 'ai';
import { LLM } from './llms';

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: LLM;
  messages: Message[];
  key: string;
  prompt: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: LLM;
  prompt: string;
  folderId: string | null;
}
