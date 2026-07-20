# CeylonCart - E-Commerce MVP

Welcome to **CeylonCart**, a fully functional Minimum Viable Product (MVP) web application for an online store specializing in authentic Sri Lankan products, including Ceylon Tea, Spices, Handicrafts, and Apparel. 

This project is built using a modern full-stack architecture with **React (Vite)** on the frontend and **Node.js (Express)** on the backend. It is designed to be easily runnable out of the box with a "Mock Mode" fallback, ensuring you never run into database connection crashes when starting up for the first time.

---

## 🌟 Key Features

- **Dynamic Product Catalog**: Browse products, filter by category (Tea, Spices, Handicrafts, Apparel), or search by keyword.
- **Interactive Product Details**: View complete details for each product via a sleek modal interface.
- **Shopping Cart Management**: A dynamic, slide-out cart drawer allows you to add items, adjust quantities, and remove products. Cart state is persisted in your browser's local storage.
- **Checkout Process**: A responsive form to collect shipping and contact information.
- **Payment Gateway Simulation**: Includes a mock payment gateway that processes simulated payments. You can toggle between successful and failed payment scenarios for testing.
- **Order Confirmation**: Displays a detailed order summary and a generated order ID upon successful checkout.
- **Admin Dashboard**: A protected admin area (accessed via a mock login) to view all placed orders in real-time.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide-React
- **API Requests**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Client**: Supabase JS, MySQL2 (Fallback capabilities)
- **Other**: CORS, Dotenv

---

## 📁 Project Structure

The repository is divided into two main directories:

```
ACSD-vibecoding-assignmen/
│
├── Backend/                 # Node.js & Express Backend
│   ├── config/              # Configuration files (e.g., database)
│   ├── controllers/         # Request handlers (productController, orderController)
│   ├── data/                # Mock data fallback
│   ├── models/              # Database models
│   ├── routes/              # API routing (productRoutes, orderRoutes)
│   ├── .env.example         # Example environment variables
│   ├── package.json
│   └── server.js            # Main backend entry point
│
├── Frontend/                # React & Vite Frontend
│   ├── public/              # Static assets
│   ├── src/                 # Application source code
│   │   ├── api/             # API configuration and endpoints
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable UI components (Navbar, CartDrawer, etc.)
│   │   ├── context/         # React Context for state management
│   │   ├── pages/           # Page components (Home, Checkout, AdminDashboard, etc.)
│   │   ├── services/        # Business logic services
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # React DOM entry point
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts       # Vite configuration
│
├── schema.sql               # Database schema and seed data
└── README.md                # Project documentation
```

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

### 1. Environment Configuration

By default, the application runs in **Mock Mode** using in-memory data, which means it will work perfectly without any database setup!

If you want to connect it to a real [Supabase](https://supabase.com/) project, create a `.env` file in the `Backend` directory (copy from `.env.example`):

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```
*(If these variables are left blank, the backend automatically uses seeded mock data. The app will NEVER crash due to missing DB credentials.)*

### 2. Start the Backend Server

Open a terminal, navigate to the `Backend` directory, install dependencies, and start the development server:

```bash
cd Backend
npm install
npm run dev
```
> The backend server will start on `http://localhost:3000`.

### 3. Start the Frontend Application

Open a **new** terminal window, navigate to the `Frontend` directory, install dependencies, and start Vite:

```bash
cd Frontend
npm install
npm run dev
```
> The frontend application will start on `http://localhost:5173`.

---

## 🧪 Testing the Application

Once both servers are running, follow this flow to experience the app:

1. **Visit the Store**: Open your browser and go to `http://localhost:5173`.
2. **Shop**: Browse the products, filter by categories (e.g., "Tea", "Spices"), and click "Add to Cart".
3. **Cart Drawer**: Open the cart (icon in the top right), modify quantities, and click "Checkout".
4. **Checkout & Payment**: Fill in any mock details on the checkout form. On the payment page, you can use the **"Simulate Success"** toggle switch to test both successful and failed payment behaviors.
5. **Admin Access**: To view the Admin Dashboard, click "Login" in the top Navbar. Enter *any* email and password (it's a mock authentication system) to gain access and view all the orders you just placed!

---

## 🗄️ Database Schema (Optional)

If you are setting up a real Supabase database, you can run the SQL script provided in the root directory (`schema.sql`). 

It includes:
- The `products` table schema.
- The `orders` table schema.
- SQL `INSERT` statements to seed the database with 10 authentic Sri Lankan dummy products.

```sql
-- Example schema snippet:
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
```

---

## 🔌 API Endpoints Summary

If you wish to test the backend API directly (e.g., via Postman):

- **GET** `/api/products` - Retrieve all products
- **GET** `/api/products/:id` - Retrieve a single product by ID
- **POST** `/api/orders` - Create a new order
- **GET** `/api/orders` - Retrieve all orders (used by Admin Dashboard)
- **GET** `/api/orders/:id` - Retrieve a specific order
