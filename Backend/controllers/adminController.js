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

export const getAdminStats = async (req, res) => {
  try {
    const db = getDb();
    const orders = db.orders || [];
    const products = db.products || [];

    // Filter valid orders (Success or Processing)
    const validOrders = orders.filter(o => o.status !== 'Failed');

    // 1. Calculate Real Totals from DB
    const realRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const realOrdersCount = validOrders.length;

    // 2. Combine with Baseline Mock Stats for Enterprise Appearance
    const baseRevenue = 158400; // Baseline sales
    const baseOrdersCount = 42; // Baseline orders
    const totalRevenue = baseRevenue + realRevenue;
    const totalOrders = baseOrdersCount + realOrdersCount;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    // Active customers: Unique customer emails + some dummy ones
    const uniqueCustomerEmails = new Set(orders.map(o => o.email.toLowerCase()));
    const baseCustomersCount = 38;
    const totalCustomers = baseCustomersCount + uniqueCustomerEmails.size;

    // Growth rates (dummy values)
    const statsSummary = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      revenueGrowth: '+14.2%',
      ordersGrowth: '+8.6%',
      aovGrowth: '+5.1%',
      customersGrowth: '+11.8%'
    };

    // 3. Generate 30-Day Sales Trend
    // Integrate real orders into their specific dates, and seed dummy data for others
    const salesTrend = [];
    const now = new Date();
    
    // Create map of real daily sales
    const realDailySales = {};
    validOrders.forEach(order => {
      if (order.created_at) {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        if (!realDailySales[dateStr]) {
          realDailySales[dateStr] = { revenue: 0, orders: 0 };
        }
        realDailySales[dateStr].revenue += Number(order.total_amount || 0);
        realDailySales[dateStr].orders += 1;
      }
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Seed realistic dummy base sales per day (wavy curve)
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseRev = Math.floor(4000 + Math.sin(i * 0.5) * 1500 + Math.random() * 2000) * (isWeekend ? 1.2 : 0.95);
      const baseOrd = Math.floor(baseRev / 4000) || 1;

      // Merge real order data if any exists for this date
      const realDay = realDailySales[dateStr] || { revenue: 0, orders: 0 };
      
      salesTrend.push({
        date: dateStr,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(baseRev + realDay.revenue),
        orders: baseOrd + realDay.orders
      });
    }

    // 4. Category Sales Distribution
    const categorySalesMap = {
      'Tea': { value: 65000, count: 22 },
      'Spices': { value: 42000, count: 14 },
      'Handicrafts': { value: 31000, count: 8 },
      'Apparel': { value: 20400, count: 4 }
    };

    // Add real items to categories
    validOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const category = item.category || 'Tea';
          const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
          if (categorySalesMap[category]) {
            categorySalesMap[category].value += itemTotal;
            categorySalesMap[category].count += Number(item.quantity || 1);
          } else {
            categorySalesMap[category] = { value: itemTotal, count: Number(item.quantity || 1) };
          }
        });
      }
    });

    const colors = {
      'Tea': 'emerald',
      'Spices': 'amber',
      'Handicrafts': 'orange',
      'Apparel': 'indigo'
    };

    const categorySales = Object.keys(categorySalesMap).map(cat => {
      const val = categorySalesMap[cat].value;
      return {
        category: cat,
        value: val,
        count: categorySalesMap[cat].count,
        color: colors[cat] || 'gray'
      };
    });

    // Calculate percentages
    const totalCatValue = categorySales.reduce((sum, item) => sum + item.value, 0);
    categorySales.forEach(item => {
      item.percentage = totalCatValue > 0 ? Math.round((item.value / totalCatValue) * 100) : 0;
    });

    // 5. Top Selling Products
    // Seed initial dummy sales for products
    const productSalesMap = {};
    products.forEach((p, idx) => {
      // Mock initial sales base
      const seedUnits = Math.floor(10 + Math.sin(idx) * 8 + (20 - Number(p.id)) * 1.5);
      productSalesMap[p.id] = {
        product: p,
        unitsSold: Math.max(2, seedUnits),
        revenue: Math.max(2, seedUnits) * Number(p.price)
      };
    });

    // Add real sales
    validOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (productSalesMap[item.id]) {
            productSalesMap[item.id].unitsSold += Number(item.quantity || 1);
            productSalesMap[item.id].revenue += Number(item.price || 0) * Number(item.quantity || 1);
          }
        });
      }
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        image_url: item.product.image_url,
        stock: item.product.stock,
        unitsSold: item.unitsSold,
        revenue: item.revenue
      }));

    // 6. Low Stock Products
    const lowStockProducts = products
      .filter(p => p.stock < 50)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    // 7. Recent Activity Timeline
    const recentActivity = [];
    
    // Add real order events
    orders.slice(0, 5).forEach((order, idx) => {
      recentActivity.push({
        id: `act-ord-${order.id}`,
        type: order.status === 'Success' ? 'order_success' : order.status === 'Failed' ? 'order_failed' : 'order_pending',
        title: `New Order Placed`,
        description: `Customer ${order.customer_name} placed an order of Rs. ${Number(order.total_amount).toLocaleString()} (${order.status})`,
        time: order.created_at ? new Date(order.created_at) : new Date(now.getTime() - idx * 3600000)
      });
    });

    // Add dynamic stock warning notifications
    products.filter(p => p.stock < 40).slice(0, 3).forEach(p => {
      recentActivity.push({
        id: `act-stock-${p.id}`,
        type: 'stock_warning',
        title: 'Low Stock Alert',
        description: `Product "${p.name}" has only ${p.stock} units left in inventory.`,
        time: new Date(now.getTime() - Math.floor(Math.random() * 86400000))
      });
    });

    // Seed dummy system activities
    const systemActivities = [
      {
        id: 'act-sys-1',
        type: 'system',
        title: 'Payment Gateway Sync',
        description: 'Mock payment gateway connection status: Operational.',
        time: new Date(now.getTime() - 2 * 3600000)
      },
      {
        id: 'act-sys-2',
        type: 'system',
        title: 'Database Auto-Backup',
        description: 'CeylonCart local JSON fallback database successfully backed up.',
        time: new Date(now.getTime() - 12 * 3600000)
      },
      {
        id: 'act-sys-3',
        type: 'user_login',
        title: 'Admin Session Started',
        description: 'New administrator session authenticated.',
        time: new Date(now.getTime() - 15000) // 15s ago
      }
    ];

    recentActivity.push(...systemActivities);
    
    // Sort recent activities by time descending
    recentActivity.sort((a, b) => b.time - a.time);
    
    // Format times for display
    const formattedActivity = recentActivity.slice(0, 8).map(act => {
      const diffMs = now - act.time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      let timeAgo = '';
      
      if (diffMins < 1) timeAgo = 'Just now';
      else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
      else if (diffHrs < 24) timeAgo = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      else timeAgo = act.time.toLocaleDateString();

      return {
        ...act,
        timeAgo
      };
    });

    // 8. Customer List
    // Base customer list
    const customerListMap = {
      'charithasudewa@gmail.com': { name: 'Henarath Hettiarachchige Don Charitha Sudewa', phone: '0705799233', location: 'Colombo', ordersCount: 0, totalSpend: 0 },
      'dilshan@yahoo.com': { name: 'Dilshan Perera', phone: '0771234567', location: 'Kandy', ordersCount: 4, totalSpend: 15400 },
      'anura.k@gmail.com': { name: 'Anura Kumara', phone: '0719876543', location: 'Galle', ordersCount: 3, totalSpend: 12200 },
      'sanduni.w@gmail.com': { name: 'Sanduni Wijesinghe', phone: '0754443322', location: 'Negombo', ordersCount: 2, totalSpend: 8400 },
      'menaka.r@outlook.com': { name: 'Menaka Rodrigo', phone: '0721110099', location: 'Jaffna', ordersCount: 1, totalSpend: 3100 }
    };

    // Integrate real customers
    orders.forEach(order => {
      const email = order.email.toLowerCase();
      if (customerListMap[email]) {
        customerListMap[email].ordersCount += 1;
        customerListMap[email].totalSpend += Number(order.total_amount || 0);
      } else {
        customerListMap[email] = {
          name: order.customer_name,
          phone: order.phone || 'N/A',
          location: order.address.substring(0, 15) || 'Sri Lanka',
          ordersCount: 1,
          totalSpend: Number(order.total_amount || 0)
        };
      }
    });

    const customers = Object.entries(customerListMap).map(([email, details]) => ({
      email,
      ...details
    })).sort((a, b) => b.totalSpend - a.totalSpend);

    res.json({
      statsSummary,
      salesTrend,
      categorySales,
      topProducts,
      lowStockProducts,
      recentActivity: formattedActivity,
      customers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
