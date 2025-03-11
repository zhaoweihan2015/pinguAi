// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { jsonSchema, streamText, createDataStreamResponse } from "ai";
import memory from "./memory";
export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();
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
        tools: Object.fromEntries(
          Object.entries<{ parameters: unknown }>(tools ?? []).map(
            ([name, tool]) => [
              name,
              {
                parameters: jsonSchema(tool.parameters!),
              },
            ]
          )
        ),
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
