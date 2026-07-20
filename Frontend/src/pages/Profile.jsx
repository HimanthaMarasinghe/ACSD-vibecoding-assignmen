import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Check, Save, 
  ShoppingBag, RefreshCw, ChevronDown, ChevronUp, Lock, FileText, X
} from 'lucide-react';
import { updateProfile } from '../api/profileApi';
import api from '../services/api';

const Profile = () => {
  const { user, profile, updateProfileState, loadingProfile } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: ''
  });
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders');
      const userOrders = response.data.filter(
        order => order.email.toLowerCase() === user.email.toLowerCase()
      );
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load user orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await updateProfile(user.email, formData);
      updateProfileState(updated);
      setIsEditing(false);
      setSuccessMsg('Your profile has been updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile. Please check connection and try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomAvatar = () => {
    const randomSeeds = ['Amber', 'Sasha', 'Jack', 'Milo', 'Leo', 'Zoe', 'Luna', 'Oliver', 'Mia', 'Bella', 'Charlie', 'Harley', 'Lulu'];
    const randomSeed = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + '-' + Math.floor(Math.random() * 1000);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
    setFormData(prev => ({ ...prev, avatar_url: newAvatar }));
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 pb-16">
      {/* Banner */}
      <div className="h-48 w-full bg-gradient-to-r from-green-700 via-green-600 to-teal-600 relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center">
              <div className="relative w-36 h-36 mx-auto group">
                <img 
                  src={formData.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
                  alt="User Avatar" 
                  className="w-full h-full rounded-2xl bg-green-50 border-4 border-white shadow-md object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {isEditing && (
                  <button 
                    type="button"
                    onClick={generateRandomAvatar}
                    className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-green-700 transition-all hover:scale-110 active:scale-95 group/btn"
                    title="Generate Random Avatar"
                  >
                    <RefreshCw className="w-4 h-4 animate-none group-hover/btn:rotate-180 transition-transform duration-500" />
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                {profile?.name || user.name || 'CeylonCart User'}
              </h2>
              <p className="text-sm text-gray-500 font-medium">{user.email}</p>
              
              {profile?.bio && (
                <p className="text-gray-600 text-sm mt-3 px-4 py-2 bg-gray-50 rounded-xl italic">
                  "{profile.bio}"
                </p>
              )}

              <div className="border-t border-gray-100 my-6"></div>

              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'July 2026'}</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Profile Fields & Order History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Alerts */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-xl flex items-center shadow-sm">
                <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl flex items-center shadow-sm">
                <X className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Profile Fields Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100/70"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) {
                          setFormData({
                            name: profile.name || '',
                            phone: profile.phone || '',
                            address: profile.address || '',
                            bio: profile.bio || '',
                            avatar_url: profile.avatar_url || ''
                          });
                        }
                      }}
                      className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 ${
                          isEditing 
                            ? 'bg-white border-gray-300 text-gray-900 shadow-sm' 
                            : 'bg-gray-50/50 border-gray-150 text-gray-700'
                        }`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      Email Address 
                      <span className="ml-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Locked</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="email" 
                        value={user.email} 
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/70 text-gray-500 rounded-xl text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-450">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 ${
                          isEditing 
                            ? 'bg-white border-gray-300 text-gray-900 shadow-sm' 
                            : 'bg-gray-50/50 border-gray-150 text-gray-700'
                        }`}
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  {/* Bio field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Short Bio</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 ${
                          isEditing 
                            ? 'bg-white border-gray-300 text-gray-900 shadow-sm' 
                            : 'bg-gray-50/50 border-gray-150 text-gray-700'
                        }`}
                        placeholder="Tea lover, Sri Lankan craft enthusiast"
                      />
                    </div>
                  </div>

                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Default Shipping Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 ${
                        isEditing 
                          ? 'bg-white border-gray-300 text-gray-900 shadow-sm' 
                          : 'bg-gray-50/50 border-gray-150 text-gray-700'
                      }`}
                      placeholder="123 Galle Road, Colombo 03, Sri Lanka"
                    />
                  </div>
                </div>

                {/* Save button (Only when editing) */}
                {isEditing && (
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center justify-center bg-green-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-green-700 shadow-sm hover:shadow-md transition-all disabled:bg-green-400 flex-shrink-0"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Order History Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                  My Orders
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {orders.length} orders
                </span>
              </div>

              <div className="p-6">
                {loadingOrders ? (
                  <div className="py-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-700">No orders yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start exploring our Ceylon specialties to place your first order!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      return (
                        <div 
                          key={order.id} 
                          className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-gray-250 transition-all bg-white"
                        >
                          {/* Order Header Summary */}
                          <div 
                            onClick={() => toggleOrderExpand(order.id)}
                            className="px-5 py-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">
                                  #{order.id.substring(6, 14).toUpperCase()}...
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <span className="text-xs text-gray-500 block">Total Amount</span>
                                <span className="text-sm font-bold text-gray-900">Rs. {Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>

                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                order.status === 'Success' 
                                  ? 'bg-green-150 text-green-800' 
                                  : order.status === 'Failed' 
                                    ? 'bg-red-50 text-red-700' 
                                    : 'bg-yellow-50 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>

                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="px-5 pb-5 border-t border-gray-50 bg-gray-50/20 pt-4">
                              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Items</h5>
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                    <div className="flex items-center space-x-3">
                                      {item.image_url && (
                                        <img 
                                          src={item.image_url} 
                                          alt={item.name} 
                                          className="w-11 h-11 object-cover rounded-lg border border-gray-150"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Rs. {Number(item.price).toFixed(2)} × {item.quantity}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      Rs. {Number(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                                <div>
                                  <p className="font-semibold text-gray-500 mb-1">Shipping Details</p>
                                  <p className="font-medium text-gray-800">{order.customer_name}</p>
                                  <p>{order.phone}</p>
                                  <p>{order.address}</p>
                                </div>
                                <div className="md:text-right flex flex-col justify-end">
                                  <p className="text-gray-500">Payment status: <span className="font-bold text-gray-800">{order.status === 'Success' ? 'Paid' : 'Pending/Failed'}</span></p>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
