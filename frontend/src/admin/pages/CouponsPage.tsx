import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminCouponService, type AdminCoupon } from '../services/couponService';

export default function CouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<AdminCoupon | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminCouponService.getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, coupon: AdminCoupon) => {
    e.stopPropagation();
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await adminCouponService.deleteCoupon(couponToDelete._id);
      setCoupons(coupons.filter(c => c._id !== couponToDelete._id));
    } catch (error) {
      console.error('Failed to delete coupon', error);
    } finally {
      setDeleteModalOpen(false);
      setCouponToDelete(null);
    }
  };

  const columns: Column<AdminCoupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: (coupon) => <span className="font-medium text-primary tracking-wider bg-primary/10 px-2 py-1 rounded">{coupon.code}</span>
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (coupon) => (
        <span>
          {coupon.discountType === 'percentage' 
            ? `${coupon.discountValue}%` 
            : `$${coupon.discountValue.toFixed(2)}`}
        </span>
      )
    },
    {
      key: 'minPurchase',
      header: 'Min. Purchase',
      render: (coupon) => `$${coupon.minPurchaseAmount.toFixed(2)}`
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      render: (coupon) => new Date(coupon.expiryDate).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      render: (coupon) => (
        <StatusBadge 
          status={coupon.status === 'Active' ? 'success' : 'error'} 
          label={coupon.status} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (coupon) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/coupons/${coupon._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, coupon)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Coupons"
        actionButton={{
          label: 'Add Coupon',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/admin/coupons/new')
        }}
      />

      <DataTable
        data={filteredCoupons}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search coupon codes..."
        onRowClick={(item) => navigate(`/admin/coupons/${item._id}`)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${couponToDelete?.code}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
