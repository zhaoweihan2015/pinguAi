import db, { ConversationType } from "@/db/db";
import dayjs from "dayjs";

export async function GET() {
  const { conversation } = db.data;

  return new Response(JSON.stringify(conversation ?? {}));
}

export async function POST(req: Request) {
  const { key, name, messages } = await req.json();

  console.log("创建对话==================");
  console.log(name);

  await db.read();

  const conversation: Record<string, ConversationType> =
    db.data.conversation ?? {};

  if (!(key in conversation)) {
    conversation[key] = {
      ...conversation[key],
      key,
    };
  }

  conversation[key] = {
    ...conversation[key],
    name,
    messages,
    updateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    createTime:
      key in conversation
        ? conversation[key].createTime
        : dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };

  await db.write();

  return new Response(
    JSON.stringify({
      message: "success",
      conversation,
    })
  );
}

export async function DELETE(req: Request) {
  const { key } = await req.json();

  const conversation: Record<string, ConversationType> =
    db.data.conversation ?? {};

  delete conversation[key];

  db.write();

  return new Response(
    JSON.stringify({
      message: "success",
    })
  );
}
