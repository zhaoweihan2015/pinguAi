// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { jsonSchema, streamText, createDataStreamResponse } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  console.log(messages[messages.length - 1]);
  console.log(system);
  console.log(tools);

  //   const result = streamText({
  //     // model: deepseek("deepseek-reasoner"),
  //     model: createOpenAICompatible({
  //       baseURL: process.env.DEEPSEEK_API_URL ?? "",
  //       apiKey: process.env.DEEPSEEK_API_KEY,
  //       name: "deepseek",
  //     }).chatModel("deepseek-r1-250120"),
  //     messages,
  //     system: system ?? "",
  //     tools: Object.fromEntries(
  //       Object.entries<{ parameters: unknown }>(tools ?? []).map(([name, tool]) => [
  //         name,
  //         {
  //           parameters: jsonSchema(tool.parameters!),
  //         },
  //       ]),
  //     ),
  //   });

  //   return result.toDataStreamResponse({
  //     sendReasoning: true,
  //   });

  const _meessages = [
    {
      role: "system",
      content:
        "你是一个冷静吐槽犀利的企鹅，是个吐槽役,说话简洁，不要有动作描述，不要用颜文字，不要用表情符号",
    },
    ...messages,
  ];

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        // model: deepseek("deepseek-reasoner"),
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
