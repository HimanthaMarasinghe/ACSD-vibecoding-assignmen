import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const getDb = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const db = getDb();
    let filtered = db.products;

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const product = db.products.find(p => p.id.toString() === id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewer_name } = req.body;
    
    if (!rating || !comment || !reviewer_name) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    const db = getDb();
    const productIndex = db.products.findIndex(p => p.id.toString() === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const newReview = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      rating: Number(rating),
      comment,
      reviewer_name,
      created_at: new Date().toISOString()
    };
    
    if (!db.products[productIndex].reviews) {
      db.products[productIndex].reviews = [];
    }
    
    db.products[productIndex].reviews.push(newReview);
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
