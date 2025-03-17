import db from "@/db/db";

export async function GET() {
  const prompts = db.data.prompts;

  console.log("获取prompt==================");
  console.log(prompts);

  return new Response(JSON.stringify({ prompts }));
}

export async function POST(req: Request) {
  const { prompts } = await req.json();
  db.data.prompts = prompts;
  db.write();
  console.log("设置prompt==================");
  console.log(db.data.prompts);
  return new Response(JSON.stringify({ prompts }));
}


export async function DELETE() {
  db.data.prompts = "";
  db.write();
  console.log("删除prompt==================");
  return new Response(JSON.stringify({ prompts: "" }));
}
