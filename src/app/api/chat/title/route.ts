import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import chalk from "chalk";
export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const content = searchParams.get("content") ?? "";

  console.log(chalk.redBright("开始生成标题"));
  console.log(process.env.DEEPSEEK_API_URL);

  const { text } = await generateText({
    model: createOpenAICompatible({
      baseURL: process.env.DEEPSEEK_API_URL ?? "",
      apiKey: process.env.DEEPSEEK_API_KEY,
      name: "deepseek",
    }).chatModel("doubao-1-5-vision-pro-32k-250115"),
    messages: [
      {
        role: "system",
        content:
          "根据对话直接生成标题，对话里直接生成标题，不要添加任何其他内容，控制在几个字以内",
      },
      {
        role: "user",
        content,
      },
    ],
  });

  return new Response(
    JSON.stringify({
      message: "success",
      data: text,
    })
  );
}
