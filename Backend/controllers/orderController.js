import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const getDb = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const saveDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const createOrder = async (req, res) => {
  try {
    const { customer_name, email, address, phone, total_amount, items } = req.body;
    const db = getDb();

    const newOrder = {
      id: 'order-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      customer_name,
      email,
      address,
      phone,
      total_amount,
      items,
      status: 'Processing',
      created_at: new Date().toISOString()
    };

    db.orders.push(newOrder);
    saveDb(db);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const db = getDb();
    // Sort by created_at descending
    const sortedOrders = db.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(sortedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
