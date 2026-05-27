import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err);
    process.exit(1);
  }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve({ id: this.lastID, changes: this.changes });
    }
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const init = async () => {
  await run(`CREATE TABLE IF NOT EXISTS fruits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    seasonStart TEXT,
    seasonEnd TEXT,
    unitPrice REAL DEFAULT 0,
    minStock REAL DEFAULT 0,
    createdAt TEXT
  )`);

  // Migrate existing fruits table if columns don't exist yet
  await run('ALTER TABLE fruits ADD COLUMN unitPrice REAL DEFAULT 0').catch(() => {});
  await run('ALTER TABLE fruits ADD COLUMN minStock REAL DEFAULT 0').catch(() => {});

  await run(`CREATE TABLE IF NOT EXISTS orchardBlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    location TEXT,
    area REAL,
    elevation REAL,
    soilType TEXT,
    waterSource TEXT,
    assignedFruit TEXT,
    numberOfTrees INTEGER DEFAULT 0,
    plantingYear TEXT,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    createdAt TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fruitId INTEGER,
    fruitType TEXT,
    variety TEXT,
    stock REAL DEFAULT 0,
    unitPrice REAL DEFAULT 0,
    status TEXT,
    lastUpdated TEXT,
    minStock REAL DEFAULT 0,
    FOREIGN KEY (fruitId) REFERENCES fruits(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS harvests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    fruitId INTEGER,
    fruitType TEXT,
    quantity REAL,
    orchardBlockId INTEGER,
    orchardBlock TEXT,
    worker TEXT,
    notes TEXT,
    status TEXT,
    submittedAt TEXT,
    approvedAt TEXT,
    adminNote TEXT,
    FOREIGN KEY (fruitId) REFERENCES fruits(id),
    FOREIGN KEY (orchardBlockId) REFERENCES orchardBlocks(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    buyerName TEXT,
    fruitId INTEGER,
    fruitType TEXT,
    quantity REAL,
    unitPrice REAL,
    totalPrice REAL,
    status TEXT,
    FOREIGN KEY (fruitId) REFERENCES fruits(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    category TEXT,
    amount REAL,
    notes TEXT,
    status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fruitId INTEGER,
    fruitType TEXT,
    issueType TEXT,
    urgency TEXT,
    description TEXT,
    location TEXT,
    reportedBy TEXT,
    reportedAt TEXT,
    status TEXT,
    adminResponse TEXT,
    photo TEXT,
    FOREIGN KEY (fruitId) REFERENCES fruits(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    role TEXT,
    dateJoined TEXT,
    status TEXT,
    phone TEXT,
    nic TEXT,
    password TEXT
  )`);

  // ── Seed default users (only when table is empty) ──────────────────
  const userCount = await get('SELECT COUNT(*) as cnt FROM users');
  if (userCount.cnt === 0) {
    const seedUsers = [
      // Admins
      { name: 'Nimal Bandara',    email: 'nimal.admin@agronest.farm',   role: 'Admin',  phone: '0112345678', nic: '197812340123V', password: 'Admin@123',  status: 'Active',   dateJoined: '01/01/2022' },
      { name: 'Sunethra Perera',  email: 'sunethra.admin@agronest.farm',role: 'Admin',  phone: '0714567890', nic: '198509876543V', password: 'Admin@456',  status: 'Active',   dateJoined: '15/03/2022' },
      // Workers
      { name: 'Kamal Jayasinghe', email: 'kamal@agronest.farm',         role: 'Worker', phone: '0771234567', nic: '199012345678',  password: 'Worker@123', status: 'Active',   dateJoined: '01/06/2023' },
      { name: 'Dilshan Fernando', email: 'dilshan@agronest.farm',        role: 'Worker', phone: '0762345678', nic: '200034567890',  password: 'Worker@234', status: 'Active',   dateJoined: '12/08/2023' },
      { name: 'Priya Wijeratne',  email: 'priya@agronest.farm',          role: 'Worker', phone: '0753456789', nic: '199756789012',  password: 'Worker@345', status: 'Active',   dateJoined: '20/09/2023' },
      { name: 'Chamara Silva',    email: 'chamara@agronest.farm',        role: 'Worker', phone: '0784567890', nic: '199878901234',  password: 'Worker@456', status: 'Active',   dateJoined: '05/01/2024' },
      { name: 'Amali Rathnayake', email: 'amali@agronest.farm',          role: 'Worker', phone: '0745678901', nic: '200123456789',  password: 'Worker@567', status: 'Inactive', dateJoined: '15/02/2024' },
    ];
    for (const u of seedUsers) {
      await run(
        'INSERT INTO users (name, email, role, dateJoined, status, phone, nic, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [u.name, u.email, u.role, u.dateJoined, u.status, u.phone, u.nic, u.password],
      );
    }
    console.log(`Seeded ${seedUsers.length} default users.`);
  }
};

export { db, run, get, all, init };
