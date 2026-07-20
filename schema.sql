-- Create products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  reviewer_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  total_amount numeric NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL DEFAULT 'Processing',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert 10 Sri Lankan dummy products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Premium Ceylon Tea (BOP)', 'Finest grade Broken Orange Pekoe Ceylon tea with a rich flavor and golden color.', 12.50, 'Tea', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800', 100),
('Ceylon Earl Grey', 'Classic Ceylon black tea infused with natural bergamot oil.', 14.00, 'Tea', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800', 80),
('Organic Ceylon Cinnamon', 'True Ceylon cinnamon sticks, hand-peeled and sun-dried for the perfect aroma.', 8.99, 'Spices', 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?auto=format&fit=crop&q=80&w=800', 150),
('Black Pepper Corns', 'Bold and pungent black pepper corns sourced directly from Kandy.', 6.50, 'Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800', 200),
('Roasted Curry Powder', 'Traditional Sri Lankan dark roasted curry powder for authentic meat dishes.', 5.25, 'Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800', 120),
('Handwoven Dumbara Mat', 'Intricately handwoven decorative mat featuring traditional Dumbara motifs.', 35.00, 'Handicrafts', 'https://images.unsplash.com/photo-1605335914619-20ffde18f78a?auto=format&fit=crop&q=80&w=800', 20),
('Wooden Elephant Carving', 'Hand-carved wooden elephant statue made from sustainable mahogany wood.', 45.00, 'Handicrafts', 'https://images.unsplash.com/photo-1582560469792-563d76e7300c?auto=format&fit=crop&q=80&w=800', 15),
('Traditional Raksha Mask', 'Colorful, hand-painted wooden mask traditionally used in Sri Lankan dances to ward off evil.', 55.00, 'Handicrafts', 'https://images.unsplash.com/photo-1602717983693-8b776269ebf9?auto=format&fit=crop&q=80&w=800', 10),
('Batik Wrap Dress', 'Beautiful handcrafted batik wrap dress in vibrant tropical colors.', 28.50, 'Apparel', 'https://images.unsplash.com/photo-1515347619362-e67493a0558b?auto=format&fit=crop&q=80&w=800', 30),
('Handloom Cotton Sarong', 'Comfortable and breathable traditional handloom cotton sarong for casual wear.', 18.00, 'Apparel', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', 50);
