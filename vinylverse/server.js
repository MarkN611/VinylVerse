require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());

// DB pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Items API
app.get('/api/items', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM ORDER BY ITEM_NUMBER'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

app.get('/api/items/:itemNumber', async (req, res, next) => {
  try {
    const num = Number(req.params.itemNumber);
    const [rows] = await pool.query(
      'SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM WHERE ITEM_NUMBER = ?',
      [num]
    );
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.post('/api/items/:itemNumber/reserve', async (req, res, next) => {
  const num = Number(req.params.itemNumber);
  const qty = Math.max(0, Number(req.query.qty || 0));
  if (!qty) return res.status(400).json({ error: 'qty must be > 0' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      'UPDATE ITEM SET AVAILABLE_QUANTITY = AVAILABLE_QUANTITY - ? WHERE ITEM_NUMBER = ? AND AVAILABLE_QUANTITY - ? >= 0',
      [qty, num, qty]
    );
    if (r.affectedRows === 0) { await conn.rollback(); return res.status(400).json({ error: 'Insufficient stock or item not found' }); }
    const [rows] = await conn.execute(
      'SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM WHERE ITEM_NUMBER = ?',
      [num]
    );
    await conn.commit();
    res.json(rows[0]);
  } catch (e) { try { await conn.rollback(); } catch {} next(e); }
  finally { conn.release(); }
});

app.post('/api/items/:itemNumber/release', async (req, res, next) => {
  const num = Number(req.params.itemNumber);
  const qty = Math.max(0, Number(req.query.qty || 0));
  if (!qty) return res.status(400).json({ error: 'qty must be > 0' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      'UPDATE ITEM SET AVAILABLE_QUANTITY = AVAILABLE_QUANTITY + ? WHERE ITEM_NUMBER = ?',
      [qty, num]
    );
    if (r.affectedRows === 0) { await conn.rollback(); return res.status(400).json({ error: 'Item not found' }); }
    const [rows] = await conn.execute(
      'SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM WHERE ITEM_NUMBER = ?',
      [num]
    );
    await conn.commit();
    res.json(rows[0]);
  } catch (e) { try { await conn.rollback(); } catch {} next(e); }
  finally { conn.release(); }
});

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
