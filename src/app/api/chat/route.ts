// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, createDataStreamResponse } from "ai";
import db from "@/db/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, network, modal } = await req.json();
  console.log(messages[messages.length - 1], network);

  // 赋予性格和长期记忆
  const prompt = db.data.prompts
  const _meessages = [
    {
      role: "system",
      content: prompt + "回复里的引用部分用斜体灰色字",
    },
    ...messages,
  ];

  let baseURL = process.env.DEEPSEEK_API_URL ?? "";
  let model = "deepseek-r1-250120";

  // 选择模型
  if(modal === "doubao"){
    model = "doubao-1-5-lite-32k-250115"
  } else {
    const isNetwork = network === "1";

    // deepseek联网需要更换url和modal
    if(isNetwork){
      baseURL = process.env.DEEPSEEK_BOT_API_URL ?? "";
      model = process.env.DEEPSEEK_BOT_API_KEY ?? "";
    }
  }
  
  console.log("使用的模型：", model, modal);

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
