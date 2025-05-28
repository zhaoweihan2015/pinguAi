import db from "@/db/db";

export async function POST(req: Request) {
  const { title, id } = await req.json();

  await db.read();

  db.data.conversation[id].name = title;

  await db.write();

  return new Response(
    JSON.stringify({
      message: "success",
      data: db.data.conversation[id],
    })
  );
}
