import { CoreToolCallUnion, CoreToolResultUnion, streamText, tool } from 'ai';
import { z } from 'zod';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // Type check if the request has a body
  if (!req.body) {
    res.status(400).json('Bad Request: no body');
    return;
  }

  const { prompt, messages } = req.body;

  const groq = createGroq({
    baseURL: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
  });

  const model = groq('llama3-groq-8b-8192-tool-use-preview');

  // const chatToolSet = {
  //   generateImage: tool({
  //     description: 'generate an image, with the user instructions to generate the image and displayed the generated image to the user without a link or url.',
  //     parameters: z.object({ text: z.string() }),
  //     execute: async ({ text }) => {
  //       try {
  //         console.log('Generating image for:', text);
  //         const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             prompt: text,
  //             steps: 20,
  //             width: 512,
  //             height: 512,
  //             cfg_scale: 7,
  //             sampler_name: "DPM++ 2M Karras",
  //             negative_prompt: "ugly, blurry, bad quality, deformed",
  //             enable_hr: false,
  //             denoising_strength: 0.7,
  //             batch_size: 1
  //           })
  //         });

  //         if (!response.ok) throw new Error('API call failed');

  //         const result = await response.json();
  //         const imageData = `data:image/png;base64,${result.images[0]}`;

  //         return {
  //           url: imageData,
  //           alt: text
  //         };
  //       } catch (error) {
  //         console.error('Image generation failed:', error);
  //         throw error;
  //       }
  //     }
  //   }),
  //   generateAudio: tool({
  //     description: 'generate an audio track, with the user instructions to generate the audio and displayed the generated audio to the user without a link or url.',
  //     parameters: z.object({ text: z.string(), shouldAutoPlay: z.boolean().optional() }),
  //     execute: async ({ text, shouldAutoPlay }) => {
  //       // Mock text to speech API call
  //       console.log('Generating audio for:', text);
  //       await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
  //       const url = '/female.wav';
  //       return {
  //         url,
  //         shouldAutoPlay: shouldAutoPlay ?? false
  //       }
  //     }
  //   }),
  // };

  const result = await streamText({
    model,
    system: process.env.DEFAULT_SYSTEM_PROMPT,
    // + 'When using tools do not reply with links or urls, that is handled by the UI.',
    // TODO: get max tokens from llm
    maxTokens: 2048,
    temperature: 0,
    prompt: 'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. User: ' + prompt,
    // messages,
    // maxSteps: 5,
    // tools: chatToolSet,
    // experimental_continueSteps : true,
    // experimental_toolCallStreaming: true,
    // experimental_activeTools : ['getWeatherInformation', 'getLocation'],
  });

  return result.toDataStreamResponse();
};
