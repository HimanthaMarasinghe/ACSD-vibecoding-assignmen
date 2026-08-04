import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    // 1. Parse and sanitize page/limit
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    // 2. Calculate offset range for Supabase
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // 3. Build query and request exact count of filtered items
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Filter by category
    if (category && category !== 'All') {
      query = query.ilike('category', category);
    }

    // Search by product name
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 4. Apply ordering & range pagination
    query = query
      .order('id', { ascending: true })
      .range(from, to);

    // 5. Execute query
    const { data: products, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // 6. Return products along with pagination metadata
    res.json({
      products,
      pagination: {
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch a single product matching the ID
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock, source } = req.body;

    // Basic field validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    // Insert new product into Supabase
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || '',
          price: parseFloat(price),
          category,
          image_url: image_url || '',
          stock: parseInt(stock, 10) || 0,
          source: source || 'CeylonCart',
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product: ' + error.message });
  }
};