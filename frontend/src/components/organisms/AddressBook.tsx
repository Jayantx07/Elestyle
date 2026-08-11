import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';

export const AddressBook: React.FC = () => {
  const { user, accessToken, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addresses = user?.addresses || [];

  const handleEdit = (addr: any) => {
    setEditingId(addr._id);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
    setIsDefault(false);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError('');

    const payload = { addressLine1, addressLine2, city, state, postalCode, country, isDefault };

    try {
      const endpoint = editingId ? `/api/v1/auth/addresses/${editingId}` : '/api/v1/auth/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiClient(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.success && res.addresses) {
        if (user) updateUser({ ...user, addresses: res.addresses });
        setIsEditing(false);
      } else {
        setError(res.message || 'Failed to save address');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await apiClient(`/api/v1/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.success && res.addresses) {
        if (user) updateUser({ ...user, addresses: res.addresses });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!accessToken) return;
    try {
      const res = await apiClient(`/api/v1/auth/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.success && res.addresses) {
        if (user) updateUser({ ...user, addresses: res.addresses });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-fraunces text-xl font-medium">Address Book</h3>
        {!isEditing && (
          <button 
            onClick={handleAddNew}
            className="px-4 py-2 bg-black text-white text-sm rounded-xl font-medium hover:bg-black/80 transition"
          >
            Add New Address
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Address Line 1" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 md:col-span-2 text-sm focus:outline-none focus:border-black" />
            <input placeholder="Address Line 2 (Optional)" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 md:col-span-2 text-sm focus:outline-none focus:border-black" />
            <input required placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:outline-none focus:border-black" />
            <input required placeholder="State/Province" value={state} onChange={e => setState(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:outline-none focus:border-black" />
            <input required placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:outline-none focus:border-black" />
            <input required placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:outline-none focus:border-black" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium">Set as default address</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">You have not saved any addresses yet.</p>
          ) : (
            addresses.map((addr: any) => (
              <div key={addr._id} className="border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-sans font-medium text-[15px]">{addr.addressLine1}</h4>
                    {addr.isDefault && <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="font-sans text-[13px] text-gray-600">
                    {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                    {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="text-[12px] font-medium text-blue-600 hover:underline px-2">Set Default</button>
                  )}
                  <button onClick={() => handleEdit(addr)} className="text-[12px] font-medium text-gray-600 hover:underline px-2">Edit</button>
                  <button onClick={() => handleDelete(addr._id)} className="text-[12px] font-medium text-red-600 hover:underline px-2">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
