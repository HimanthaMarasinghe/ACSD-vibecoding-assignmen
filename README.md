# CeylonCart - E-Commerce MVP

CeylonCart is a fully functional Minimum Viable Product (MVP) web application for an online store selling Sri Lankan products (Ceylon Tea, Spices, Handicrafts, and Apparel).

## Features
- **Product Catalog**: View products by category or search by keyword.
- **Product Details**: View product details in an interactive modal.
- **Shopping Cart**: Dynamic drawer to add, remove, and update quantities (persisted in local storage).
- **Checkout**: Form for shipping details and contact info.
- **Mock Payment Gateway**: Securely processes a mock payment, handling success/failure simulations.
- **Order Confirmation**: Displays order summary and generated ID upon successful payment.
- **Admin Dashboard**: View all placed orders, protected by a mock login system.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide-React, Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: Mock in-memory fallback (automatically active if Supabase keys are absent). Fully compatible with Supabase if configured.

---

## 🚀 Setup Instructions

### 1. Environment Configuration

If you have a Supabase project, update the `Backend/.env` file:
```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```
*(If you leave these as the defaults or blank, the app will automatically run in **Mock Mode** using seeded data and an in-memory array for orders. The app will NEVER crash due to missing DB credentials.)*

### 2. Start the Backend

Open a terminal and navigate to the `Backend` directory:
```bash
cd Backend
npm install
npm run dev
```
*The backend will run on `http://localhost:3000`.*

### 3. Start the Frontend

Open a new terminal and navigate to the `Frontend` directory:
```bash
cd Frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## Testing the App
1. Go to `http://localhost:5173`.
2. Browse products, filter by categories (e.g., "Tea"), and add items to your cart.
3. Proceed to checkout, fill in mock details, and use the payment page. 
4. **Important**: The payment page has a "Simulate Success" toggle to test successful vs. failed payments.
5. To test the Admin Dashboard, click "Login" in the Navbar. Enter *any* email and password to access the mock admin dashboard and view placed orders.

## Database Schema (Optional)
If you wish to configure a real Supabase database, execute the SQL found in `schema.sql` at the root of the project to create the `products` and `orders` tables, and to seed the initial 10 products.
