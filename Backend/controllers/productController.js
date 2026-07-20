import { supabase, isMockMode } from '../config/supabase.js';
import { seedProducts } from '../data/seedProducts.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    if (isMockMode) {
      let filtered = [...seedProducts];
      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      return res.json(filtered);
    }

    let query = supabase.from('products').select('*');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMockMode) {
      const product = seedProducts.find(p => p.id === id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.json(product);
    }

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
