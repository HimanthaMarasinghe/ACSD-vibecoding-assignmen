require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: "API is running" });
});

// Define the port (from environment variables or fallback to 3000)
const PORT = process.env.PORT || 3000;

// Test the database connection
const testConnection = async () => {
  try {
    // Perform a lightweight request to check connectivity.
    // Even if the table doesn't exist, a response from the Supabase API confirms it is reachable.
    const { error } = await db.from('_connection_test').select('*').limit(1);
    
    if (error) {
      if (error.message && error.message.includes('fetch failed')) {
        console.error('Database connection failed: Network error / invalid URL');
      } else if (error.status === 401 || error.code === '401' || (error.message && error.message.includes('JWT'))) {
        console.error('Database connection failed: Invalid API key (Unauthorized)');
      } else {
        // Any other database response (e.g., table not found PGRST116/PGRST204/etc.) means the endpoint is reachable and active.
        console.log('Database connected successfully (Supabase endpoint is reachable)!');
      }
    } else {
      console.log('Database connected successfully!');
    }
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
};
testConnection();


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
