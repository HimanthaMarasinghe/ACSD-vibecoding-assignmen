import { supabase } from '../config/supabase.js';

export const createOrder = async (req, res) => {
  try {
    const { customer_name, email, address, phone, total_amount, items, status } = req.body;

    if (!customer_name || !email || !total_amount) {
      return res.status(400).json({ message: 'Customer name, email, and total amount are required.' });
    }

    const orderId = 'order-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const newOrderPayload = {
      id: orderId,
      customer_name,
      email,
      address: address || '',
      phone: phone || '',
      total_amount: parseFloat(total_amount),
      items: items || [],
      status: status || 'Processing',
      created_at: new Date().toISOString()
    };

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([newOrderPayload])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(orders || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

