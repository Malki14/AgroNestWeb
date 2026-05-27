import { run } from './db.js';

const cols = [
  { name: 'status',        sql: 'TEXT DEFAULT "Active"' },
  { name: 'notes',         sql: 'TEXT DEFAULT ""' },
  { name: 'assignedFruit', sql: 'TEXT DEFAULT ""' },
  { name: 'numberOfTrees', sql: 'INTEGER DEFAULT 0' },
  { name: 'plantingYear',  sql: 'TEXT DEFAULT ""' },
];

for (const col of cols) {
  try {
    await run(`ALTER TABLE orchardBlocks ADD COLUMN ${col.name} ${col.sql}`);
    console.log(`✅ Added column: ${col.name}`);
  } catch (e) {
    console.log(`ℹ️  ${col.name}: ${e.message.includes('duplicate') ? 'already exists' : e.message}`);
  }
}

console.log('\nMigration complete.');
process.exit(0);
