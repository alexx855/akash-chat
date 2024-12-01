// app/api/models/route.ts
import { LLM, LLMID, LLMS } from '@/types/llms';
import { API_HOST } from '@/utils/app/const';
import { NextResponse } from 'next/server';

export const dynamic = "force-static"

export async function GET() {
  try {
    const response = await fetch(`${API_HOST}/v1/models`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    if (response.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${response.status}: ${await response.text()}`
      );
      throw new Error('OpenAI API returned an error');
    }

    const json = await response.json();

    const models: LLM[] = json.data
      .map((model: any) => {
        for (const [key, value] of Object.entries(LLMID)) {
          const baseModelId = model.id.split(':')[0];
          if (value === baseModelId) {
            return {
              id: model.id,
              name: LLMS[value].name,
            };
          }
        }
      })
      .filter(Boolean);

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}