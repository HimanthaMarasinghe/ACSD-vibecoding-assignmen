import { supabase, isMockMode } from '../config/supabase.js';

// In-memory store for mock mode
const mockOrders = [];

export const createOrder = async (req, res) => {
  try {
    const { customer_name, email, address, phone, total_amount, items } = req.body;

    if (isMockMode) {
      const newOrder = {
        id: 'mock-order-' + Date.now(),
        customer_name,
        email,
        address,
        phone,
        total_amount,
        items,
        status: 'Processing',
        created_at: new Date().toISOString()
      };
      mockOrders.push(newOrder);
      return res.status(201).json(newOrder);
    }

    const { data, error } = await supabase.from('orders').insert([
      { customer_name, email, address, phone, total_amount, items, status: 'Processing' }
    ]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    if (isMockMode) {
      return res.json(mockOrders);
    }

    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
