import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  ChevronRight, 
  MapPin, 
  Mail, 
  Phone, 
  ShoppingCart, 
  UserCheck, 
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30days');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');

  // UI Interactive States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/orders'),
        api.get('/products')
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatusId(orderId);
      const response = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      const updatedOrder = response.data;
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      // Refresh stats in background to keep data consistent
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading && !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Gathering real-time store statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Data Load Failed</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // --- FILTERED DATA FOR TABLES ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.id.toLowerCase().includes(productSearch.toLowerCase());
    
    const matchesCategory = productCatFilter === 'All' || product.category === productCatFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCustomers = (stats?.customers || []).filter(customer => {
    return (
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.phone && customer.phone.includes(customerSearch))
    );
  });

  // --- SVG CHART CONFIGURATION ---
  const activeTrend = timeRange === '7days' ? stats.salesTrend.slice(-7) : stats.salesTrend;
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const revenues = activeTrend.map(t => t.revenue);
  const maxRevenue = Math.max(...revenues, 10000);
  const minRevenue = Math.min(...revenues, 0);
  const revRange = maxRevenue - minRevenue;

  // Calculate coordinates for lines
  const points = activeTrend.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2) / (activeTrend.length - 1 || 1));
    const y = chartHeight - paddingY - ((d.revenue - minRevenue) * (chartHeight - paddingY * 2) / revRange);
    return { x, y, data: d };
  });

  // SVG Line path string
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // SVG Gradient Area path string (goes down to baseline)
  let areaPath = '';
  if (points.length > 0) {
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
  }

  // Count low stock products count
  const lowStockCount = products.filter(p => p.stock < 50).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-green-700" />
            Admin Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time shop sales, customer metrics, inventory alerts, and order management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 text-gray-600 hover:text-green-700 bg-white hover:bg-green-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'overview' && (
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1 shadow-sm">
              <button 
                onClick={() => setTimeRange('7days')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  timeRange === '7days' 
                    ? 'bg-green-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setTimeRange('30days')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  timeRange === '30days' 
                    ? 'bg-green-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                30 Days
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <nav className="flex space-x-8 min-w-[500px]" aria-label="Tabs">
          {[
            { id: 'overview', label: 'Overview & Insights', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'products', label: `Inventory (${products.length})`, icon: Package },
            { id: 'customers', label: 'Customer DB', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* --- OVERVIEW TAB CONTENT --- */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Total Revenue</span>
                <span className="text-2xl font-black text-gray-900 block">
                  Rs. {stats.statsSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  {stats.statsSummary.revenueGrowth} <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Total Orders</span>
                <span className="text-2xl font-black text-gray-900 block">
                  {stats.statsSummary.totalOrders}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  {stats.statsSummary.ordersGrowth} <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Avg Order Value</span>
                <span className="text-2xl font-black text-gray-900 block">
                  Rs. {stats.statsSummary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  {stats.statsSummary.aovGrowth} <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Active Customers */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Active Customers</span>
                <span className="text-2xl font-black text-gray-900 block">
                  {stats.statsSummary.totalCustomers}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  {stats.statsSummary.customersGrowth} <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Low Stock Toast Alert Banner */}
          {lowStockCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Inventory Notice: Low Stock Items Detected</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    There are {lowStockCount} products that have fallen below the stock warning threshold (50 units). Restock recommended.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab('products'); setProductCatFilter('All'); setProductSearch(''); }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                View Inventory
              </button>
            </div>
          )}

          {/* Main Charts & Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Trend Chart (2/3 width on wide screen) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs lg:col-span-2 relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Sales Value Trend</h3>
                  <p className="text-xs text-gray-400">Aggregated daily revenue figures over selected timeframe</p>
                </div>
                <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-150 px-2.5 py-1 rounded-lg">
                  {timeRange === '7days' ? 'Showing 7 days' : 'Showing 30 days'}
                </span>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative w-full h-[220px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline Grids */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = paddingY + ratio * (chartHeight - paddingY * 2);
                    const val = maxRevenue - ratio * revRange;
                    return (
                      <g key={index} className="opacity-40">
                        <line 
                          x1={paddingX} 
                          y1={y} 
                          x2={chartWidth - paddingX} 
                          y2={y} 
                          className="stroke-gray-250 stroke-1" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={paddingX - 10} 
                          y={y + 3} 
                          className="text-[9px] fill-gray-400 text-right font-semibold"
                          textAnchor="end"
                        >
                          {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Under Line */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-300" />
                  )}

                  {/* Thick Curved/Straight Line */}
                  {linePath && (
                    <path 
                      d={linePath} 
                      fill="none" 
                      className="stroke-emerald-500 transition-all duration-300" 
                      strokeWidth={3} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Interactive Nodes */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredChartPoint === idx;
                    // Only render circles for all in 7days, or spaced ones for 30days to avoid clutter (unless hovered)
                    const shouldRenderCircle = timeRange === '7days' || isHovered || idx % 4 === 0 || idx === points.length - 1;
                    
                    return (
                      <g key={idx}>
                        {shouldRenderCircle && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 3.5}
                            className={`${
                              isHovered 
                                ? 'fill-emerald-600 stroke-white stroke-2' 
                                : 'fill-white stroke-emerald-500 stroke-2'
                            } transition-all duration-150`}
                          />
                        )}
                        {/* Large invisible circle to catch hover gestures */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={14}
                          className="fill-transparent cursor-pointer"
                          onMouseEnter={() => setHoveredChartPoint(idx)}
                          onMouseLeave={() => setHoveredChartPoint(null)}
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Date Labels */}
                  {points.map((p, idx) => {
                    // Reduce labels on 30days view to prevent overlap
                    const showLabel = timeRange === '7days' 
                      ? true 
                      : (idx % 6 === 0 || idx === points.length - 1);
                    
                    if (!showLabel) return null;

                    return (
                      <text
                        key={idx}
                        x={p.x}
                        y={chartHeight - 10}
                        className="text-[9px] fill-gray-400 font-semibold"
                        textAnchor="middle"
                      >
                        {p.data.formattedDate}
                      </text>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredChartPoint !== null && points[hoveredChartPoint] && (
                  <div 
                    className="absolute bg-gray-900/95 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-gray-800 z-10 pointer-events-none transition-all duration-100 flex flex-col gap-0.5"
                    style={{
                      left: `${(points[hoveredChartPoint].x / chartWidth) * 100}%`,
                      top: `${(points[hoveredChartPoint].y / chartHeight) * 100 - 10}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <span className="font-extrabold text-emerald-400">
                      Rs. {points[hoveredChartPoint].data.revenue.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {points[hoveredChartPoint].data.formattedDate} ({points[hoveredChartPoint].data.orders} orders)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown (1/3 width) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Sales by Category</h3>
                <p className="text-xs text-gray-400 mb-6">Distribution of sales volume across store categories</p>
                
                {/* Category Bars */}
                <div className="space-y-4">
                  {stats.categorySales.map((cat, idx) => {
                    const colorMap = {
                      emerald: 'bg-emerald-500 text-emerald-700',
                      amber: 'bg-amber-500 text-amber-700',
                      orange: 'bg-orange-500 text-orange-700',
                      indigo: 'bg-indigo-500 text-indigo-700',
                    };
                    const colorClass = colorMap[cat.color] || 'bg-gray-500 text-gray-700';

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${colorClass.split(' ')[0]}`}></span>
                            {cat.category}
                          </span>
                          <span className="font-bold text-gray-900">
                            {cat.percentage}% <span className="text-gray-400 font-medium ml-1">({cat.count} items)</span>
                          </span>
                        </div>
                        
                        {/* Progress Bar Track */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${colorClass.split(' ')[0]} transition-all duration-500`}
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-[10px] font-semibold text-gray-400">
                            Rs. {cat.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Aggregated Sales</span>
                <span className="font-bold text-gray-900 text-sm">
                  Rs. {stats.categorySales.reduce((acc, c) => acc + c.value, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Top Products & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Top Selling Products</h3>
                <p className="text-xs text-gray-400 mb-5">Most popular Sri Lankan products sorted by units sold</p>
                
                <div className="divide-y divide-gray-100">
                  {stats.topProducts.map((p, idx) => (
                    <div key={p.id} className="py-3.5 flex items-center justify-between group hover:bg-gray-50/50 rounded-xl px-2 -mx-2 transition-all duration-200">
                      <div className="flex items-center gap-3.5">
                        <span className="text-xs font-black text-gray-400 w-4">{idx + 1}</span>
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-2xs group-hover:scale-105 transition-transform" 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=80&q=80';
                          }}
                        />
                        <div className="max-w-[200px] sm:max-w-xs">
                          <h4 className="text-xs font-bold text-gray-800 truncate" title={p.name}>{p.name}</h4>
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-gray-900 block">{p.unitsSold} sold</span>
                        <span className="text-[10px] text-gray-400 block font-medium">Rs. {p.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 mt-4">
                <button 
                  onClick={() => { setActiveTab('products'); setProductSearch(''); setProductCatFilter('All'); }}
                  className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Manage inventory catalog <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Activities Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Recent Activity Log</h3>
                <p className="text-xs text-gray-400 mb-5">Audit trail of transactions, stock events, and system logs</p>
                
                <div className="space-y-4">
                  {stats.recentActivity.map((act) => {
                    const activityStyles = {
                      order_success: { bg: 'bg-green-50 text-green-700', border: 'border-green-200' },
                      order_failed: { bg: 'bg-red-50 text-red-700', border: 'border-red-200' },
                      order_pending: { bg: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
                      stock_warning: { bg: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
                      system: { bg: 'bg-gray-50 text-gray-600', border: 'border-gray-200' },
                      user_login: { bg: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' }
                    };

                    const style = activityStyles[act.type] || { bg: 'bg-gray-50 text-gray-600', border: 'border-gray-200' };

                    return (
                      <div key={act.id} className="flex gap-3 text-xs items-start">
                        {/* Circular dot */}
                        <div className={`mt-0.5 p-1 rounded-full border ${style.bg} ${style.border} flex-shrink-0`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold text-gray-800 truncate">{act.title}</span>
                            <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0 ml-2">{act.timeAgo}</span>
                          </div>
                          <p className="text-gray-500 leading-normal font-medium">{act.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 mt-4">
                <button 
                  onClick={() => { setActiveTab('orders'); setOrderSearch(''); setOrderStatusFilter('All'); }}
                  className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View full order ledger <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDERS TAB CONTENT --- */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          {/* Table Utilities Bar */}
          <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Store Orders Ledger</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all bg-white"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all cursor-pointer font-semibold text-gray-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Processing">Processing</option>
                  <option value="Failed">Failed</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold mb-1">No orders found matching criteria.</p>
              <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr className="text-left text-xs font-bold text-gray-450 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Order ID</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Customer</th>
                    <th scope="col" className="px-6 py-4">Total Amount</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-150">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-green-700 hover:underline">
                        #{order.id.substring(0, 8).toUpperCase()}...
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-gray-900 truncate max-w-[200px]" title={order.customer_name}>
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-gray-450 font-medium">{order.email}</div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-black text-gray-900">
                        Rs. {Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : order.status === 'Failed' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- PRODUCTS TAB CONTENT --- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          {/* Utilities Bar */}
          <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Product Inventory Status</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product code or name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all bg-white"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all cursor-pointer font-semibold text-gray-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Tea">Tea</option>
                  <option value="Spices">Spices</option>
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="Apparel">Apparel</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold mb-1">No products found matching criteria.</p>
              <p className="text-xs text-gray-400">Verify filters or try typing another search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr className="text-left text-xs font-bold text-gray-450 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Item Code</th>
                    <th scope="col" className="px-6 py-4">Product Info</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4 text-right">Price</th>
                    <th scope="col" className="px-6 py-4">Stock Level</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-150">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock < 50;
                    const isCritical = p.stock < 20;
                    
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                          #{p.id.padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.image_url} 
                              alt={p.name} 
                              className="w-11 h-11 object-cover rounded-lg border border-gray-200 shadow-2xs flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=80&q=80';
                              }}
                            />
                            <div className="max-w-xs md:max-w-md">
                              <div className="text-sm font-extrabold text-gray-900 truncate" title={p.name}>{p.name}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="font-semibold">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 text-right">
                          Rs. {Number(p.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <div className="flex justify-between items-center text-[10px] mb-1 font-bold text-gray-650">
                              <span>{p.stock} units</span>
                              <span>{Math.round((p.stock / 150) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-150 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCritical 
                                    ? 'bg-red-500' 
                                    : isLow 
                                      ? 'bg-amber-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, (p.stock / 150) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCritical 
                              ? 'bg-red-100 text-red-800' 
                              : isLow 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {isCritical ? 'Critical Stock' : isLow ? 'Low Stock' : 'Good Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- CUSTOMERS TAB CONTENT --- */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          {/* Utilities Bar */}
          <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Customer Intelligence Database</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer email, name, phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredCustomers.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold mb-1">No customers match search term.</p>
              <p className="text-xs text-gray-400">Try searching for alternative names or domains.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr className="text-left text-xs font-bold text-gray-450 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Customer Name</th>
                    <th scope="col" className="px-6 py-4">Contact Details</th>
                    <th scope="col" className="px-6 py-4">Location</th>
                    <th scope="col" className="px-6 py-4 text-center">Placed Orders</th>
                    <th scope="col" className="px-6 py-4 text-right">Total Expenditure</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-150">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.email} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-150 text-green-800 rounded-full flex items-center justify-center font-extrabold text-sm shadow-2xs">
                            {customer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="text-sm font-extrabold text-gray-900 max-w-[200px] truncate" title={customer.name}>
                            {customer.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="text-[11px] text-gray-450 font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {customer.location}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {customer.ordersCount}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-black text-emerald-600 text-right">
                        Rs. {Number(customer.totalSpend).toFixed(2)}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" /> Verified Buyer
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- ORDER DETAILS SLIDE-OUT DRAWER --- */}
      {selectedOrder && (
        <>
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 z-50 opacity-100" 
            onClick={() => setSelectedOrder(null)} 
          />
          
          {/* Drawer Body */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 transform translate-x-0 transition-transform duration-300 ease-out flex flex-col h-full border-l border-gray-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Order Ledger Details</h3>
                <span className="text-xs text-gray-550 font-semibold block mt-0.5">
                  ID: <span className="font-mono text-[10px] text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded-sm">{selectedOrder.id}</span>
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status Controls */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Order Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'Success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : selectedOrder.status === 'Failed' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                    {selectedOrder.status}
                  </span>
                </div>
                
                {/* Admin Status update triggers */}
                <div className="flex items-center gap-2">
                  {['Processing', 'Success', 'Failed'].map((statusOption) => (
                    <button
                      key={statusOption}
                      disabled={updatingStatusId !== null || selectedOrder.status === statusOption}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, statusOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedOrder.status === statusOption
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed shadow-2xs'
                          : statusOption === 'Success'
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                            : statusOption === 'Failed'
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                              : 'bg-yellow-550 hover:bg-yellow-600 text-white shadow-xs'
                      } ${updatingStatusId !== null ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {updatingStatusId === selectedOrder.id ? 'Saving...' : `Mark ${statusOption}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details card */}
              <div className="space-y-3.5 bg-white border border-gray-150 rounded-xl p-5 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Customer Dossier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-450 block font-semibold mb-0.5">Full Name</span>
                    <span className="text-xs font-bold text-gray-800">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block font-semibold mb-0.5">Email Address</span>
                    <span className="text-xs font-semibold text-gray-850 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {selectedOrder.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block font-semibold mb-0.5">Contact Phone</span>
                    <span className="text-xs font-semibold text-gray-850 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {selectedOrder.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block font-semibold mb-0.5">Order Time</span>
                    <span className="text-xs font-semibold text-gray-850 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-450 block font-semibold mb-0.5">Shipping Destination</span>
                  <span className="text-xs font-semibold text-gray-800 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    {selectedOrder.address}
                  </span>
                </div>
              </div>

              {/* Items Summary card */}
              <div className="space-y-4 bg-white border border-gray-150 rounded-xl p-5 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Purchased Items</h4>
                <div className="divide-y divide-gray-100">
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-3xs"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=80&q=80';
                          }}
                        />
                        <div className="max-w-[200px] sm:max-w-xs">
                          <h5 className="text-xs font-bold text-gray-800 truncate">{item.name}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                            {item.quantity} x Rs. {Number(item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-gray-900">
                        Rs. {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-550">
                  <span>Subtotal Amount</span>
                  <span>Rs. {Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-550">
                  <span>Simulated Processing Tax</span>
                  <span>Rs. 0.00</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-550">
                  <span>Standard Shipping</span>
                  <span className="text-green-700 font-bold">FREE</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                  <span>Grand Total Amount</span>
                  <span className="text-green-700 text-base">Rs. {Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-white border border-gray-250 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
