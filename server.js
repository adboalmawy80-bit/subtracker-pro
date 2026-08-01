import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 📦 مصفوفة تخزين الاشتراكات مؤقتاً في الذاكرة
let subscriptions = [
  {
    id: 1,
    name: "Netflix",
    price: 15,
    billing_cycle: "monthly",
    next_payment_date: "2026-08-15",
    category: "Entertainment"
  },
  {
    id: 2,
    name: "Spotify",
    price: 10,
    billing_cycle: "monthly",
    next_payment_date: "2026-08-20",
    category: "Entertainment"
  }
];

// 1. جلب البيانات والإحصائيات
app.get('/api/subscriptions', (req, res) => {
  let monthlyTotal = 0;
  let yearlyTotal = 0;

  subscriptions.forEach(sub => {
    if (sub.billing_cycle === 'monthly') {
      monthlyTotal += sub.price;
      yearlyTotal += sub.price * 12;
    } else if (sub.billing_cycle === 'yearly') {
      monthlyTotal += sub.price / 12;
      yearlyTotal += sub.price;
    }
  });

  res.json({
    subscriptions: subscriptions,
    stats: {
      monthlyTotal: monthlyTotal.toFixed(2),
      yearlyTotal: yearlyTotal.toFixed(2),
      count: subscriptions.length
    }
  });
});

// 2. إضافة اشتراك جديد
app.post('/api/subscriptions', (req, res) => {
  const { name, price, billing_cycle, next_payment_date, category } = req.body;

  if (!name || !price || !next_payment_date) {
    return res.status(400).json({ error: 'برجاء إدخال البيانات الأساسية' });
  }

  const newSub = {
    id: Date.now(),
    name,
    price: Number(price),
    billing_cycle: billing_cycle || 'monthly',
    next_payment_date,
    category: category || 'General'
  };

  subscriptions.push(newSub);
  res.json({ message: 'تم إضافة الاشتراك بنجاح', id: newSub.id });
});

// 3. حذف اشتراك (مباشر وسريع)
app.delete('/api/subscriptions/:id', (req, res) => {
  const targetId = String(req.params.id);
  
  // تصفية المصفوفة وحذف العنصر المطابق للـ ID
  subscriptions = subscriptions.filter(sub => String(sub.id) !== targetId);

  res.json({ message: 'تم حذف الاشتراك بنجاح' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});