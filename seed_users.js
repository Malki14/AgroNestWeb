import { run, get } from './db.js';

// First ensure email is unique-indexed so INSERT OR IGNORE works
try {
  await run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)');
} catch (e) { /* index may already exist */ }

const seedUsers = [
  // Admins
  { name: 'Nimal Bandara',    email: 'nimal.admin@agronest.farm',    role: 'Admin',  phone: '0112345678', nic: '197812340123V', password: 'Admin@123',  status: 'Active',   dateJoined: '01/01/2022' },
  { name: 'Sunethra Perera',  email: 'sunethra.admin@agronest.farm', role: 'Admin',  phone: '0714567890', nic: '198509876543V', password: 'Admin@456',  status: 'Active',   dateJoined: '15/03/2022' },
  // Workers
  { name: 'Kamal Jayasinghe', email: 'kamal@agronest.farm',          role: 'Worker', phone: '0771234567', nic: '199012345678',  password: 'Worker@123', status: 'Active',   dateJoined: '01/06/2023' },
  { name: 'Dilshan Fernando', email: 'dilshan@agronest.farm',         role: 'Worker', phone: '0762345678', nic: '200034567890',  password: 'Worker@234', status: 'Active',   dateJoined: '12/08/2023' },
  { name: 'Priya Wijeratne',  email: 'priya@agronest.farm',           role: 'Worker', phone: '0753456789', nic: '199756789012',  password: 'Worker@345', status: 'Active',   dateJoined: '20/09/2023' },
  { name: 'Chamara Silva',    email: 'chamara@agronest.farm',         role: 'Worker', phone: '0784567890', nic: '199878901234',  password: 'Worker@456', status: 'Active',   dateJoined: '05/01/2024' },
  { name: 'Amali Rathnayake', email: 'amali@agronest.farm',           role: 'Worker', phone: '0745678901', nic: '200123456789',  password: 'Worker@567', status: 'Inactive', dateJoined: '15/02/2024' },
];

let inserted = 0;
let skipped  = 0;

for (const u of seedUsers) {
  const exists = await get('SELECT id FROM users WHERE email = ?', [u.email]);
  if (exists) {
    console.log(`  ⏭  Skipped (already exists): ${u.name} <${u.email}>`);
    skipped++;
  } else {
    await run(
      'INSERT INTO users (name, email, role, dateJoined, status, phone, nic, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [u.name, u.email, u.role, u.dateJoined, u.status, u.phone, u.nic, u.password],
    );
    console.log(`  ✅ Inserted: ${u.name} [${u.role}]`);
    inserted++;
  }
}

const total = await get('SELECT COUNT(*) as cnt FROM users');
console.log(`\nDone — inserted: ${inserted}, skipped: ${skipped}, total users: ${total.cnt}`);
process.exit(0);
