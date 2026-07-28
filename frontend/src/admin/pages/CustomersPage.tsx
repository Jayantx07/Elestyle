import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminCustomerService, type AdminCustomer } from '../services/customerService';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminCustomerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns: Column<AdminCustomer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (customer) => (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-gray-500 text-xs">{customer.email}</div>
        </div>
      )
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      render: (customer) => customer.totalOrders
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (customer) => `$${customer.totalSpent.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (customer) => (
        <StatusBadge 
          status={customer.status === 'Active' ? 'success' : 'error'} 
          label={customer.status} 
        />
      )
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      render: (customer) => new Date(customer.joinedAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/customers/${customer._id}`);
          }}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Customers" />

      <DataTable
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        onRowClick={(item) => navigate(`/admin/customers/${item._id}`)}
      />
    </div>
  );
}
