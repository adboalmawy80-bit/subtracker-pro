import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const app = express();
app.use(express.json());

// ضبط مسار المجلد العام للواجهة
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// 1. جلب جميع الاشتراكات وحساب الإحصائيات
app.get('/api/subscriptions', (req, res) => {
  db.all('SELECT * FROM subscriptions ORDER BY next_payment_date ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // حساب إجمالي المصاريف الشهري والسنوي
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    rows.forEach(sub => {
      if (sub.billing_cycle === 'monthly') {
        monthlyTotal += sub.price;
        yearlyTotal += sub.price * 12;
      } else if (sub.billing_cycle === 'yearly') {
        monthlyTotal += sub.price / 12;
        yearlyTotal += sub.price;
      }
    });

    res.json({
      subscriptions: rows,
      stats: {
        monthlyTotal: monthlyTotal.toFixed(2),
        yearlyTotal: yearlyTotal.toFixed(2),
        count: rows.length
      }
    });
  });
});

// 2. إضافة اشتراك جديد
app.post('/api/subscriptions', (req, res) => {
  const { name, price, billing_cycle, next_payment_date, category } = req.body;

  if (!name || !price || !next_payment_date) {
    return res.status(400).json({ error: 'برجاء إدخال البيانات الأساسية' });
  }

  const query = `
    INSERT INTO subscriptions (name, price, billing_cycle, next_payment_date, category)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [name, price, billing_cycle || 'monthly', next_payment_date, category || 'General'], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'تم إضافة الاشتراك بنجاح', id: this.lastID });
  });
});

// 3. حذف اشتراك
app.delete('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM subscriptions WHERE id = ?', id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'تم حذف الاشتراك' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Tracker Server running on http://localhost:${PORT}`);
});