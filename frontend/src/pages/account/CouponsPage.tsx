import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { couponService } from '@/services/couponService';
import { useNavigate } from 'react-router-dom';

const CustomerCouponsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['availableCoupons'],
    queryFn: async () => {
      if (!accessToken) return null;
      const res = await couponService.getAvailableCoupons(accessToken);
      return res.data;
    },
    enabled: !!accessToken,
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add a toast here
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-3xl"></div>
          <div className="h-48 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const coupons = data || [];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-fraunces font-medium text-gray-900">My Coupons</h1>
        <p className="text-gray-500 mt-2">Available discounts and offers for your account.</p>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          Failed to load coupons. Please try again later.
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No active coupons</h2>
          <p className="text-gray-500 max-w-sm mb-6">You don't have any available coupons at the moment. Keep an eye out for future promotions!</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon: any) => (
            <div key={coupon._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
              {/* Decorative side accent */}
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-black"></div>
              
              <div className="pl-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold tracking-wider rounded-lg border border-gray-200">
                    {coupon.code}
                  </span>
                  {coupon.expiryDate && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                      Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{coupon.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{coupon.description || 'Use this code at checkout to get a discount.'}</p>
                
                <ul className="text-xs text-gray-500 mb-6 space-y-1 font-medium">
                  {coupon.discountType === 'percentage' && (
                    <li>• {coupon.discountValue}% OFF</li>
                  )}
                  {coupon.discountType === 'fixed' && (
                    <li>• ₹{coupon.discountValue} OFF</li>
                  )}
                  {coupon.discountType === 'free_shipping' && (
                    <li>• Free Shipping</li>
                  )}
                  {coupon.minPurchaseAmount > 0 && (
                    <li>• Minimum order ₹{coupon.minPurchaseAmount}</li>
                  )}
                  {coupon.maxDiscountAmount > 0 && (
                    <li>• Max discount ₹{coupon.maxDiscountAmount}</li>
                  )}
                </ul>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex-1 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition active:scale-95"
                  >
                    Copy Code
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition active:scale-95"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerCouponsPage;
