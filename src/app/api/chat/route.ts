// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, createDataStreamResponse } from "ai";
import memory from "./memory";
import { getTimes } from "./tools";
export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system } = await req.json();
  console.log(messages[messages.length - 1]);

  // 赋予性格和长期记忆
  const _meessages = [
    ...memory.map((item) => ({
      role: "system",
      content: item,
    })),
    ...messages,
  ];

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: createOpenAICompatible({
          baseURL: process.env.DEEPSEEK_API_URL ?? "",
          apiKey: process.env.DEEPSEEK_API_KEY,
          name: "deepseek",
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
