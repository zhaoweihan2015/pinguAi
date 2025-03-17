// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, createDataStreamResponse } from "ai";
import db from "@/db/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, network } = await req.json();
  console.log(messages[messages.length - 1], network);

  const prompt = db.data.prompts

  // 赋予性格和长期记忆
  const _meessages = [
    {
      role: "system",
      content: prompt,
    },
    ...messages,
  ];

  const isNetwork = network === "1";

  const baseURL = (isNetwork ? process.env.DEEPSEEK_BOT_API_URL : process.env.DEEPSEEK_API_URL) ?? "";

  const model = (isNetwork ? process.env.DEEPSEEK_BOT_API_KEY : "deepseek-r1-250120") ?? "";

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: createOpenAICompatible({
          baseURL,
          apiKey: process.env.DEEPSEEK_API_KEY,
          name: "deepseek",
          queryParams: {
            maxTokens: "2000",
          },
        }).chatModel(model),
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
