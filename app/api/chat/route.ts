
import { Message, streamText, tool } from 'ai';
import { createOpenAI as createVLLM } from '@ai-sdk/openai';
import { z } from 'zod';
import { Client } from "@gradio/client";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // // for self-hosted Groq/Llama-3-Groq-8B-Tool-Use model
  // const groq = createVLLM({
  //   compatibility: 'strict',
  //   baseURL: process.env.API_HOST,
  //   // apiKey: process.env.OPENAI_API_KEY,
  // })

  // using groq API
  const groq = createVLLM({
    baseURL: process.env.GROQ_API_HOST,
    apiKey: process.env.GROQ_API_KEY,
  });

  const chatToolSet = {
    ...(process.env.NEXT_PUBLIC_AUDIO_TOOL ? {
      generateImage: tool({
        description: 'Generate an image from text input.',
        parameters: z.object({ text: z.string() }),
        execute: async ({ text }) => {
          try {
            console.log('Generating image for:', text);
            console.log('Using image tool at:', process.env.NEXT_PUBLIC_IMAGE_TOOL);

            const client = await Client.connect(process.env.NEXT_PUBLIC_IMAGE_TOOL!);
            const result = await client.predict("/predict", {
              prompt: text,
              steps: 20,
              width: 512,
              height: 512,
              cfg_scale: 7,
              sampler_name: "DPM++ 2M Karras",
              negative_prompt: "ugly, blurry, bad quality, deformed",
              enable_hr: false,
              denoising_strength: 0.7,
              batch_size: 1
            });

            console.log('Image generation result:', result);
            const imageData = `data:image/png;base64,${result['data'] as string}`;

            return {
              url: imageData,
            };
          } catch (error) {
            console.error('Image generation failed:', error);
            throw error;
          }
        }
      })
    } : {}),
    ...(process.env.NEXT_PUBLIC_AUDIO_TOOL ? {
      generateAudio: tool({
        description: 'Generate an audio track from text input.',
        parameters: z.object({ text: z.string() }),
        execute: async ({ text }) => {
          console.log('Generating audio for:', text);
          try {

            console.log('Using audio tool at:', process.env.NEXT_PUBLIC_AUDIO_TOOL);
            const client = await Client.connect(process.env.NEXT_PUBLIC_AUDIO_TOOL!);
            const result = await client.predict("/predict", {
              text: text,
            });
            console.log('Audio generation result:', result);
            const resultData = result['data'] as Array<string>
            return resultData[1]
          } catch (error) {
            console.error('Audio generation failed:', error);
            throw error;
          }
        }
      })
    } : {}),
  };

  const result = streamText({
    // model: groq('Groq/Llama-3-Groq-8B-Tool-Use'),
    model: groq('llama3-groq-8b-8192-tool-use-preview'),
    system: process.env.DEFAULT_SYSTEM_PROMPT,
    messages,
    maxSteps: 2,
    tools: chatToolSet,
  });

  return result.toDataStreamResponse();
}