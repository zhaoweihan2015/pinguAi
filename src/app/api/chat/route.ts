// import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, createDataStreamResponse } from "ai";
import db from "@/db/db";
import tools from "./tools";
import chalk from "chalk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, network, modal, files } = await req.json();

  // 赋予性格和长期记忆
  const _meessages = [
    {
      role: "system",
      content: db.data.prompts, // 性格
    },
    {
      role: "system",
      content: db.data.memory.join(";"), // 长期记忆
    },
    {
      role: "system",
      content: "调用getTitle方法获取标题,但是禁止多次调用",
    },
    ...messages,
  ];

  let baseURL = process.env.DEEPSEEK_API_URL ?? "";
  let model = "deepseek-r1-250120";

  // 选择模型
  switch (modal) {
    case "doubao-1.5-lite-32k":
      model = "doubao-1-5-lite-32k-250115";
      break;
    case "doubao-1.5-vision-pro-32k":
      model = "doubao-1-5-vision-pro-32k-250115";

      // 添加图片
      const lastMessage = _meessages[_meessages.length - 1];

      lastMessage.content = [
        {
          type: "text",
          text: lastMessage.content,
        },
        ...files.map((file: { base64: string; type: string }) => ({
          type: "image",
          image: file.base64,
          mimeType: file.type,
        })),
      ];
      break;
    default: // deepseek
      const isNetwork = network === "1";

      // deepseek联网需要更换url和modal
      if (isNetwork) {
        baseURL = process.env.DEEPSEEK_BOT_API_URL ?? "";
        model = process.env.DEEPSEEK_BOT_API_KEY ?? "";
      }
      break;
  }

  console.log(messages[messages.length - 1], network);

  console.log(chalk.greenBright("使用的模型：", model));

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: createOpenAICompatible({
          baseURL,
          apiKey: process.env.DEEPSEEK_API_KEY,
          name: "deepseek",
        }).chatModel(model),
        messages: _meessages,
        system: system ?? "",
        tools,
        maxSteps: 5,
        toolChoice: "auto",
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
