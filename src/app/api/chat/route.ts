// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, createDataStreamResponse } from "ai";
import db from "@/db/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system } = await req.json();
  console.log(messages[messages.length - 1]);

  const prompt = db.data.prompts

  // 赋予性格和长期记忆
  const _meessages = [
    {
      role: "system",
      content: prompt,
    },
    ...messages,
  ];

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: createOpenAICompatible({
          baseURL: process.env.DEEPSEEK_API_URL ?? "",
          apiKey: process.env.DEEPSEEK_API_KEY,
          name: "deepseek",
          queryParams: {
            maxTokens: "2000",
          },
        }).chatModel("deepseek-r1-250120"),
        messages: _meessages,
        system: system ?? "",
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      return error instanceof Error ? error.message : String(error);
    },
  });
}
