import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminOrderService, type AdminOrder } from '../services/orderService';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: Column<AdminOrder>[] = [
    {
      key: '_id',
      header: 'Order ID',
      render: (order) => <span className="font-medium text-gray-900">{order._id}</span>
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">{order.customerName}</div>
          <div className="text-gray-500 text-xs">{order.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (order) => new Date(order.date).toLocaleDateString()
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (order) => `$${order.totalAmount.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => {
        let badgeStatus: any = 'default';
        const s = order.status;
        if (s === 'delivered') badgeStatus = 'success';
        else if (['cancelled', 'payment_failed'].includes(s)) badgeStatus = 'error';
        else if (['pending_payment', 'refund_pending'].includes(s)) badgeStatus = 'warning';
        else if (['confirmed', 'processing', 'packed', 'shipped'].includes(s)) badgeStatus = 'info';
        
        return <StatusBadge status={badgeStatus} label={s.replace('_', ' ').toUpperCase()} />;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/orders/${order._id}`);
          }}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Orders" />

      <DataTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, name or email..."
        onRowClick={(item) => navigate(`/admin/orders/${item._id}`)}
      />
    </div>
  );
}
