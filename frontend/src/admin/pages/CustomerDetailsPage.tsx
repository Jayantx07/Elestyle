import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminCustomerService, type AdminCustomer } from '../services/customerService';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async (customerId: string) => {
      try {
        setLoading(true);
        const data = await adminCustomerService.getCustomerById(customerId);
        setCustomer(data);
      } catch (error) {
        console.error('Failed to fetch customer details', error);
        alert('Error loading customer');
        navigate('/admin/customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomer(id);
  }, [id, navigate]);

  const toggleCustomerStatus = async () => {
    if (!customer) return;
    const newStatus = customer.status === 'Active' ? 'Blocked' : 'Active';
    try {
      await adminCustomerService.updateCustomerStatus(customer._id, newStatus);
      setCustomer({ ...customer, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update customer status');
    }
  };

  if (loading || !customer) return <div className="p-8 text-center text-gray-500">Loading customer details...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: 'Customers', path: '/admin/customers' },
          { label: 'Details' }
        ]}
        actionButton={{
          label: customer.status === 'Active' ? 'Block Customer' : 'Unblock Customer',
          onClick: toggleCustomerStatus
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <StatusBadge 
                status={customer.status === 'Active' ? 'success' : 'error'} 
                label={customer.status} 
              />
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">Email</span>
                <span className="font-medium text-gray-900">{customer.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Phone</span>
                <span className="font-medium text-gray-900">{customer.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Joined</span>
                <span className="font-medium text-gray-900">{new Date(customer.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="block text-2xl font-semibold text-gray-900">{customer.totalOrders}</span>
                <span className="text-xs text-gray-500 uppercase">Orders</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="block text-xl font-semibold text-primary">${customer.totalSpent.toFixed(2)}</span>
                <span className="text-xs text-gray-500 uppercase">Spent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            {customer.recentOrders && customer.recentOrders.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customer.recentOrders.map((order) => (
                    <tr key={order._id} className="bg-white hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <td className="px-6 py-4 font-medium text-primary hover:underline">{order._id}</td>
                      <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge 
                          status={
                            order.status === 'Delivered' ? 'success' :
                            order.status === 'Cancelled' ? 'error' : 'info'
                          } 
                          label={order.status} 
                        />
                      </td>
                      <td className="px-6 py-4 text-right">${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">No orders found for this customer.</div>
            )}
          </div>
          
          {/* Addresses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
            </div>
            <div className="p-6">
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customer.addresses.map((addr, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Default</span>
                      )}
                      <p className="text-sm text-gray-700">{addr.street}</p>
                      <p className="text-sm text-gray-700">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-sm text-gray-700">{addr.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No addresses on file.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
