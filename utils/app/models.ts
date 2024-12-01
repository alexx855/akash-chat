import { LLMID, LLMS } from "@/types/llms";

export function isValidLLMID(value: string): value is LLMID {
    return Object.keys(LLMS).includes(value);
}