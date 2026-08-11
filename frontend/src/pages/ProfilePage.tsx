import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '../components/organisms/ProfileCard';
import { ProfileSettingsList, type SettingItem } from '../components/organisms/ProfileSettingsList';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { customerOrderService, type CustomerOrder } from '../services/customerOrderService';
import { Button } from '../components/atoms/Button';

type Tab = 'overview' | 'orders' | 'addresses';

const ProfilePage: React.FC = () => {
  const { user, accessToken, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Address state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && accessToken) {
      fetchOrders();
    }
  }, [activeTab, accessToken]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await customerOrderService.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await authService.updateProfile({ name: editName, phone: editPhone }, accessToken);
      if (data.success && data.user) {
        updateUser(data.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully.');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      setError('');
      setSuccess('');
      const data = await authService.uploadAvatar(file, accessToken);
      if (data.success && data.user) {
        updateUser(data.user);
        setSuccess('Avatar updated successfully.');
      } else {
        setError(data.message || 'Failed to update avatar');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred updating avatar');
    }
  };
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;
    setIsSaving(true);
    
    try {
      const currentAddresses = [...(user.addresses || [])];
      if (editingAddressIndex !== null) {
        currentAddresses[editingAddressIndex] = { ...currentAddresses[editingAddressIndex], ...addressForm };
      } else {
        currentAddresses.push(addressForm);
      }
      
      const data = await authService.updateAddresses(currentAddresses, accessToken);
      if (data.success) {
        updateUser({ ...user, addresses: currentAddresses });
        setIsEditingAddress(false);
      }
    } catch (err) {
      console.error('Failed to update address:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!accessToken || !user) return;
    const currentAddresses = [...(user.addresses || [])];
    currentAddresses.splice(index, 1);
    try {
      const data = await authService.updateAddresses(currentAddresses, accessToken);
      if (data.success) {
        updateUser({ ...user, addresses: currentAddresses });
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const openAddressModal = (index: number | null = null) => {
    if (index !== null && user?.addresses) {
      setAddressForm(user.addresses[index]);
      setEditingAddressIndex(index);
    } else {
      setAddressForm({ street: '', city: '', state: '', postalCode: '', country: '' });
      setEditingAddressIndex(null);
    }
    setIsEditingAddress(true);
  };

  // SVG Icons
  const EmailIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const PhoneIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const NotificationIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const LogoutIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const settingsItems: SettingItem[] = [
    { id: 'email', label: `Email: ${user?.email || 'N/A'}`, icon: EmailIcon, type: 'link', onClick: () => {} },
    { id: 'phone', label: `Phone: ${user?.phone || 'Not provided'}`, icon: PhoneIcon, type: 'link', onClick: () => setIsEditing(true) },
    { id: 'notification', label: 'Notification', icon: NotificationIcon, type: 'toggle', isActive: notificationsEnabled },
    { id: 'logout', label: 'Sign Out', icon: LogoutIcon, type: 'link', onClick: handleLogout },
  ];

  const handleToggleChange = (id: string, newValue: boolean) => {
    if (id === 'notification') setNotificationsEnabled(newValue);
  };
  };

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8 bg-[#EAF3EB]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between md:justify-start gap-4 mb-8">
          <button 
            onClick={() => {
              setIsEditing(true);
              setSuccess('');
              setError('');
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
          >
            Edit Profile
          </button>
          <h1 className="font-fraunces font-medium text-2xl md:text-4xl text-center flex-1 md:flex-none text-gray-900">
            Account
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column: Profile Card & Sidebar */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6 md:sticky md:top-32">
            <ProfileCard 
              name={user?.name || 'User'}
              email={user?.email}
              phone={user?.phone}
              avatarUrl={user?.profileImage || ''}
              verificationProgress={verificationProgress}
              onEditProfile={() => setIsEditing(true)}
              onAvatarClick={() => fileInputRef.current?.click()}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp"
              onChange={handleAvatarChange}
            />
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-black/5 mt-4">
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#EAF3EB] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#EAF3EB] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Orders History
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'bg-[#EAF3EB] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Saved Addresses
                </button>
              </nav>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="md:col-span-7 lg:col-span-8 md:pt-16">
            
            {activeTab === 'overview' && (
              <ProfileSettingsList items={settingsItems} onToggleChange={handleToggleChange} />
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <h2 className="font-fraunces text-2xl mb-6 text-gray-900">Order History</h2>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">You haven't placed any orders yet.</p>
                    <Button onClick={() => navigate('/categories')} variant="primary">Start Shopping</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border border-black/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm font-medium mt-1">${order.grandTotal.toFixed(2)} - <span className="text-emerald-600">{order.status}</span></p>
                        </div>
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-fraunces text-2xl text-gray-900">Saved Addresses</h2>
                  <Button onClick={() => openAddressModal()} variant="outline" className="text-xs py-1.5 px-3 rounded-lg">Add New</Button>
                </div>
                
                {!user?.addresses || user.addresses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No addresses saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((address, index) => (
                      <div key={index} className="border border-black/5 rounded-2xl p-4 relative group">
                        <p className="text-sm font-medium text-gray-900 mb-1">{address.street}</p>
                        <p className="text-xs text-gray-500">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-xs text-gray-500">{address.country}</p>
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openAddressModal(index)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDeleteAddress(index)} className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-fraunces text-gray-900">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {editError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{editError}</div>}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition active:scale-95 disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-fraunces text-gray-900">{editingAddressIndex !== null ? 'Edit Address' : 'Add Address'}</h3>
              <button onClick={() => setIsEditingAddress(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Street</label>
                <input required type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">City</label>
                  <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">State</label>
                  <input required type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input required type="text" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Country</label>
                  <input required type="text" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditingAddress(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition active:scale-95 disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
