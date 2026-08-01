import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./subscriptions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ SQLite Database connected.');
  }
});

// إنشاء جدول الاشتراكات تلقائياً لو مش موجود
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      billing_cycle TEXT NOT NULL,
      next_payment_date TEXT NOT NULL,
      category TEXT DEFAULT 'General'
    )
  `);
});

export default db;