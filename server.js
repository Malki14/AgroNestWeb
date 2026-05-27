/* global process */
import express from 'express';
import cors from 'cors';
import { init, all, get, run } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

await init();

const getInventoryByVariety = async (variety) => {
  return get('SELECT * FROM inventory WHERE variety = ?', [variety]);
};

const buildInventoryStatus = (stock, minStock) => {
  if (stock <= 0) return 'Out of Stock';
  return stock <= minStock ? 'Low Stock' : 'In Stock';
};

const upsertInventoryForHarvest = async (fruitType, quantity) => {
  const item = await getInventoryByVariety(fruitType);
  const now = new Date().toLocaleString('en-LK');
  if (item) {
    const updatedStock = item.stock + parseFloat(quantity);
    await run(
      'UPDATE inventory SET stock = ?, lastUpdated = ?, status = ? WHERE id = ?',
      [updatedStock, now, buildInventoryStatus(updatedStock, item.minStock), item.id],
    );
    return get('SELECT * FROM inventory WHERE id = ?', [item.id]);
  }

  const result = await run(
    'INSERT INTO inventory (fruitType, variety, stock, unitPrice, status, lastUpdated, minStock) VALUES (?, ?, ?, 0, ?, ?, 0)',
    [fruitType, fruitType, parseFloat(quantity), buildInventoryStatus(quantity, 0), now],
  );
  return get('SELECT * FROM inventory WHERE id = ?', [result.id]);
};

const adjustInventoryForRevert = async (fruitType, quantity) => {
  const item = await getInventoryByVariety(fruitType);
  if (!item) return null;
  const updatedStock = Math.max(0, item.stock - parseFloat(quantity));
  await run(
    'UPDATE inventory SET stock = ?, lastUpdated = ?, status = ? WHERE id = ?',
    [updatedStock, new Date().toLocaleString('en-LK'), buildInventoryStatus(updatedStock, item.minStock), item.id],
  );
  return get('SELECT * FROM inventory WHERE id = ?', [item.id]);
};

const adjustInventoryForSale = async (fruitType, quantity) => {
  const item = await getInventoryByVariety(fruitType);
  if (item) {
    const updatedStock = Math.max(0, item.stock - parseFloat(quantity));
    await run(
      'UPDATE inventory SET stock = ?, lastUpdated = ?, status = ? WHERE id = ?',
      [updatedStock, new Date().toLocaleString('en-LK'), buildInventoryStatus(updatedStock, item.minStock), item.id],
    );
    return get('SELECT * FROM inventory WHERE id = ?', [item.id]);
  }
  const result = await run(
    'INSERT INTO inventory (fruitType, variety, stock, unitPrice, status, lastUpdated, minStock) VALUES (?, ?, ?, 0, ?, ?, 0)',
    [fruitType, fruitType, 0, 'Out of Stock', new Date().toLocaleString('en-LK')],
  );
  return get('SELECT * FROM inventory WHERE id = ?', [result.id]);
};

app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Worker';
  const name = role === 'Admin' ? 'Admin User' : 'Worker User';
  res.json({ id: Date.now(), name, email, role, status: 'Active' });
});

app.get('/api/init', async (req, res) => {
  const [inventory, harvests, sales, expenses, issues, users, fruits, orchardBlocks] = await Promise.all([
    all('SELECT * FROM inventory ORDER BY id DESC'),
    all('SELECT * FROM harvests ORDER BY id DESC'),
    all('SELECT * FROM sales ORDER BY id DESC'),
    all('SELECT * FROM expenses ORDER BY id DESC'),
    all('SELECT * FROM issues ORDER BY id DESC'),
    all('SELECT * FROM users ORDER BY id DESC'),
    all('SELECT * FROM fruits ORDER BY id DESC'),
    all('SELECT * FROM orchardBlocks ORDER BY id DESC'),
  ]);
  res.json({ inventory, harvests, sales, expenses, issues, users, fruits, orchardBlocks });
});

app.get('/api/inventory', async (req, res) => {
  const inventory = await all('SELECT * FROM inventory ORDER BY id DESC');
  res.json(inventory);
});

app.post('/api/inventory', async (req, res) => {
  const { fruitType, variety, stock, unitPrice, status, minStock } = req.body;
  const now = new Date().toLocaleString('en-LK');
  const result = await run(
    'INSERT INTO inventory (fruitType, variety, stock, unitPrice, status, lastUpdated, minStock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [fruitType, variety, parseFloat(stock), parseFloat(unitPrice), status || 'In Stock', now, parseFloat(minStock) || 0],
  );
  const item = await get('SELECT * FROM inventory WHERE id = ?', [result.id]);
  res.json(item);
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { fruitType, variety, stock, unitPrice, status, minStock } = req.body;
  const now = new Date().toLocaleString('en-LK');
  await run(
    'UPDATE inventory SET fruitType = ?, variety = ?, stock = ?, unitPrice = ?, status = ?, lastUpdated = ?, minStock = ? WHERE id = ?',
    [fruitType, variety, parseFloat(stock), parseFloat(unitPrice), status || 'In Stock', now, parseFloat(minStock) || 0, id],
  );
  const item = await get('SELECT * FROM inventory WHERE id = ?', [id]);
  res.json(item);
});

app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM inventory WHERE id = ?', [id]);
  res.json({ success: true });
});

app.get('/api/harvests', async (req, res) => {
  res.json(await all('SELECT * FROM harvests ORDER BY id DESC'));
});

app.post('/api/harvests', async (req, res) => {
  const { date, fruitType, quantity, orchardBlock, worker, notes } = req.body;
  const submittedAt = new Date().toLocaleString('en-LK');
  const result = await run(
    'INSERT INTO harvests (date, fruitType, quantity, orchardBlock, worker, notes, status, submittedAt, approvedAt, adminNote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [date, fruitType, parseFloat(quantity), orchardBlock, worker, notes, 'Pending', submittedAt, '', ''],
  );
  const harvest = await get('SELECT * FROM harvests WHERE id = ?', [result.id]);
  res.json(harvest);
});

app.put('/api/harvests/:id', async (req, res) => {
  const { id } = req.params;
  const { date, fruitType, quantity, orchardBlock, notes } = req.body;
  await run(
    'UPDATE harvests SET date = ?, fruitType = ?, quantity = ?, orchardBlock = ?, notes = ? WHERE id = ?',
    [date, fruitType, parseFloat(quantity), orchardBlock, notes, id],
  );
  const harvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  res.json(harvest);
});

app.delete('/api/harvests/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM harvests WHERE id = ?', [id]);
  res.json({ success: true });
});

app.post('/api/harvests/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { adminNote = '' } = req.body;
  const harvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  if (!harvest) return res.status(404).json({ error: 'Harvest not found' });
  await run(
    'UPDATE harvests SET status = ?, approvedAt = ?, adminNote = ? WHERE id = ?',
    ['Approved', new Date().toLocaleString('en-LK'), adminNote, id],
  );
  const updatedHarvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  const updatedInventory = await upsertInventoryForHarvest(updatedHarvest.fruitType, updatedHarvest.quantity);
  res.json({ harvest: updatedHarvest, inventory: updatedInventory });
});

app.post('/api/harvests/:id/reverse', async (req, res) => {
  const { id } = req.params;
  const { adminNote = '' } = req.body;
  const harvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  if (!harvest) return res.status(404).json({ error: 'Harvest not found' });
  await run(
    'UPDATE harvests SET status = ?, approvedAt = ?, adminNote = ? WHERE id = ?',
    ['Reverted', new Date().toLocaleString('en-LK'), adminNote || 'Accepted in error, inventory corrected', id],
  );
  const updatedHarvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  const updatedInventory = await adjustInventoryForRevert(updatedHarvest.fruitType, updatedHarvest.quantity);
  res.json({ harvest: updatedHarvest, inventory: updatedInventory });
});

app.post('/api/harvests/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { adminNote = '' } = req.body;
  await run('UPDATE harvests SET status = ?, approvedAt = ?, adminNote = ? WHERE id = ?', ['Rejected', new Date().toLocaleString('en-LK'), adminNote, id]);
  const harvest = await get('SELECT * FROM harvests WHERE id = ?', [id]);
  res.json(harvest);
});

app.get('/api/sales', async (req, res) => {
  res.json(await all('SELECT * FROM sales ORDER BY id DESC'));
});

app.post('/api/sales', async (req, res) => {
  const { date, buyerName, fruitType, quantity, unitPrice, totalPrice, status } = req.body;
  const result = await run(
    'INSERT INTO sales (date, buyerName, fruitType, quantity, unitPrice, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [date, buyerName, fruitType, parseFloat(quantity), parseFloat(unitPrice), parseFloat(totalPrice), status || 'Pending'],
  );
  const sale = await get('SELECT * FROM sales WHERE id = ?', [result.id]);
  const inventoryUpdate = await adjustInventoryForSale(fruitType, quantity);
  res.json({ ...sale, inventoryUpdate });
});

app.get('/api/expenses', async (req, res) => {
  res.json(await all('SELECT * FROM expenses ORDER BY id DESC'));
});

app.post('/api/expenses', async (req, res) => {
  const { date, category, amount, notes, status } = req.body;
  const result = await run(
    'INSERT INTO expenses (date, category, amount, notes, status) VALUES (?, ?, ?, ?, ?)',
    [date, category, parseFloat(amount), notes, status || 'Pending'],
  );
  const expense = await get('SELECT * FROM expenses WHERE id = ?', [result.id]);
  res.json(expense);
});

app.get('/api/issues', async (req, res) => {
  res.json(await all('SELECT * FROM issues ORDER BY id DESC'));
});

app.post('/api/issues', async (req, res) => {
  const { fruitType, issueType, urgency, description, location, reportedBy, photo } = req.body;
  const reportedAt = new Date().toLocaleString('en-LK');
  const result = await run(
    'INSERT INTO issues (fruitType, issueType, urgency, description, location, reportedBy, reportedAt, status, adminResponse, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [fruitType, issueType, urgency, description, location, reportedBy, reportedAt, 'Pending', '', photo || ''],
  );
  const issue = await get('SELECT * FROM issues WHERE id = ?', [result.id]);
  res.json(issue);
});

app.put('/api/issues/:id', async (req, res) => {
  const { id } = req.params;
  const { fruitType, issueType, urgency, description, location, photo } = req.body;
  await run(
    'UPDATE issues SET fruitType = ?, issueType = ?, urgency = ?, description = ?, location = ?, photo = ? WHERE id = ?',
    [fruitType, issueType, urgency, description, location, photo || '', id],
  );
  const issue = await get('SELECT * FROM issues WHERE id = ?', [id]);
  res.json(issue);
});

app.delete('/api/issues/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM issues WHERE id = ?', [id]);
  res.json({ success: true });
});

app.post('/api/issues/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, adminResponse } = req.body;
  await run('UPDATE issues SET status = ?, adminResponse = ? WHERE id = ?', [status, adminResponse || '', id]);
  const issue = await get('SELECT * FROM issues WHERE id = ?', [id]);
  res.json(issue);
});

app.get('/api/users', async (req, res) => {
  res.json(await all('SELECT * FROM users ORDER BY id DESC'));
});

app.post('/api/users', async (req, res) => {
  const { name, email, role, dateJoined, status, phone, nic, password } = req.body;
  const result = await run(
    'INSERT INTO users (name, email, role, dateJoined, status, phone, nic, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, role, dateJoined || new Date().toLocaleDateString('en-LK'), status || 'Active', phone, nic, password || ''],
  );
  const user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
  res.json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, dateJoined, status, phone, nic, password } = req.body;
  // Only update password if a new one is provided
  if (password && password.trim()) {
    await run(
      'UPDATE users SET name = ?, email = ?, role = ?, dateJoined = ?, status = ?, phone = ?, nic = ?, password = ? WHERE id = ?',
      [name, email, role, dateJoined, status, phone, nic, password, id],
    );
  } else {
    await run(
      'UPDATE users SET name = ?, email = ?, role = ?, dateJoined = ?, status = ?, phone = ?, nic = ? WHERE id = ?',
      [name, email, role, dateJoined, status, phone, nic, id],
    );
  }
  const user = await get('SELECT * FROM users WHERE id = ?', [id]);
  res.json(user);
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM users WHERE id = ?', [id]);
  res.json({ success: true });
});

// Fruits endpoints
app.get('/api/fruits', async (req, res) => {
  const fruits = await all('SELECT * FROM fruits ORDER BY id DESC');
  res.json(fruits);
});

app.post('/api/fruits', async (req, res) => {
  const { name, description, category, seasonStart, seasonEnd, unitPrice, minStock } = req.body;
  const createdAt = new Date().toLocaleString('en-LK');
  const price = parseFloat(unitPrice) || 0;
  const min = parseFloat(minStock) || 0;
  const result = await run(
    'INSERT INTO fruits (name, description, category, seasonStart, seasonEnd, unitPrice, minStock, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, description, category, seasonStart, seasonEnd, price, min, createdAt],
  );
  const fruit = await get('SELECT * FROM fruits WHERE id = ?', [result.id]);

  // Auto-upsert inventory
  let inventory = await get('SELECT * FROM inventory WHERE fruitId = ? OR variety = ?', [fruit.id, name]);
  const now = new Date().toLocaleString('en-LK');
  if (inventory) {
    const updatedStatus = buildInventoryStatus(inventory.stock, min);
    await run(
      'UPDATE inventory SET fruitId = ?, fruitType = ?, variety = ?, unitPrice = ?, minStock = ?, status = ?, lastUpdated = ? WHERE id = ?',
      [fruit.id, name, name, price, min, updatedStatus, now, inventory.id],
    );
    inventory = await get('SELECT * FROM inventory WHERE id = ?', [inventory.id]);
  } else {
    await run(
      'INSERT INTO inventory (fruitId, fruitType, variety, stock, unitPrice, status, lastUpdated, minStock) VALUES (?, ?, ?, 0, ?, ?, ?, ?)',
      [fruit.id, name, name, price, 'Out of Stock', now, min],
    );
    inventory = await get('SELECT * FROM inventory WHERE fruitId = ?', [fruit.id]);
  }

  res.json({ fruit, inventory });
});

app.put('/api/fruits/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, seasonStart, seasonEnd, unitPrice, minStock } = req.body;
  const price = parseFloat(unitPrice) || 0;
  const min = parseFloat(minStock) || 0;
  await run(
    'UPDATE fruits SET name = ?, description = ?, category = ?, seasonStart = ?, seasonEnd = ?, unitPrice = ?, minStock = ? WHERE id = ?',
    [name, description, category, seasonStart, seasonEnd, price, min, id]
  );
  const fruit = await get('SELECT * FROM fruits WHERE id = ?', [id]);

  // Auto-upsert inventory
  let inventory = await get('SELECT * FROM inventory WHERE fruitId = ? OR variety = ?', [id, name]);
  const now = new Date().toLocaleString('en-LK');
  if (inventory) {
    const updatedStatus = buildInventoryStatus(inventory.stock, min);
    await run(
      'UPDATE inventory SET fruitId = ?, fruitType = ?, variety = ?, unitPrice = ?, minStock = ?, status = ?, lastUpdated = ? WHERE id = ?',
      [id, name, name, price, min, updatedStatus, now, inventory.id],
    );
    inventory = await get('SELECT * FROM inventory WHERE id = ?', [inventory.id]);
  } else {
    await run(
      'INSERT INTO inventory (fruitId, fruitType, variety, stock, unitPrice, status, lastUpdated, minStock) VALUES (?, ?, ?, 0, ?, ?, ?, ?)',
      [id, name, name, price, 'Out of Stock', now, min],
    );
    inventory = await get('SELECT * FROM inventory WHERE id = ?', [id]);
  }

  res.json({ fruit, inventory });
});

app.delete('/api/fruits/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM fruits WHERE id = ?', [id]);
  res.json({ success: true });
});

// Orchard Blocks endpoints
app.get('/api/orchardBlocks', async (req, res) => {
  const blocks = await all('SELECT * FROM orchardBlocks ORDER BY id DESC');
  res.json(blocks);
});

app.post('/api/orchardBlocks', async (req, res) => {
  const { name, location, area, elevation, soilType, waterSource, assignedFruit, numberOfTrees, plantingYear, status, notes } = req.body;
  const createdAt = new Date().toLocaleString('en-LK');
  const result = await run(
    'INSERT INTO orchardBlocks (name, location, area, elevation, soilType, waterSource, assignedFruit, numberOfTrees, plantingYear, status, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, location, parseFloat(area) || 0, parseFloat(elevation) || 0, soilType, waterSource, assignedFruit || '', parseInt(numberOfTrees) || 0, plantingYear || '', status || 'Active', notes || '', createdAt],
  );
  const block = await get('SELECT * FROM orchardBlocks WHERE id = ?', [result.id]);
  res.json(block);
});

app.put('/api/orchardBlocks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, area, elevation, soilType, waterSource, assignedFruit, numberOfTrees, plantingYear, status, notes } = req.body;
  await run(
    'UPDATE orchardBlocks SET name=?, location=?, area=?, elevation=?, soilType=?, waterSource=?, assignedFruit=?, numberOfTrees=?, plantingYear=?, status=?, notes=? WHERE id=?',
    [name, location, parseFloat(area) || 0, parseFloat(elevation) || 0, soilType, waterSource, assignedFruit || '', parseInt(numberOfTrees) || 0, plantingYear || '', status || 'Active', notes || '', id],
  );
  const block = await get('SELECT * FROM orchardBlocks WHERE id = ?', [id]);
  res.json(block);
});

app.delete('/api/orchardBlocks/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM orchardBlocks WHERE id = ?', [id]);
  res.json({ success: true });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
