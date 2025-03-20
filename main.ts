import db from "./src/db/db"

db.data.memory = ["123", "456", "789"];
console.log(db.data.memory);

await db.write();

await db.read()

console.log(db.data.memory);
