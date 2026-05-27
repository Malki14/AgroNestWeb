import { run } from './db.js';
try {
  await run('ALTER TABLE users ADD COLUMN password TEXT DEFAULT ""');
  console.log("Added password column to users");
} catch(e) {
  console.log("password col:", e.message.includes("duplicate") ? "already exists" : e.message);
}
process.exit(0);
