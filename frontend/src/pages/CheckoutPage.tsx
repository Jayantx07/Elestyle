import { apiClient } from '@/lib/apiClient';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Typography } from '../components/atoms/Typography';
import { Button } from '../components/atoms/Button';
import { useAuth } from '../contexts/AuthContext';
import { cartService } from '../services/cartService';
import { useCart, type CartItem } from '../contexts/CartContext';

type AddressValues = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const sectionClass = 'bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100';
const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors';

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;

  return <input {...rest} className={`${inputClass} ${className}`.trim()} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;

  return <textarea {...rest} className={`${inputClass} ${className}`.trim()} />;
}

function AddressFields({
  values,
  onChange,
  statePlaceholder,
}: {
  values: AddressValues;
  onChange: (next: AddressValues) => void;
  statePlaceholder: string;
}) {
  const update = (key: keyof AddressValues) => (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [key]: event.target.value });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextInput required type="text" placeholder="Address Line 1" value={values.addressLine1} onChange={update('addressLine1')} className="md:col-span-2" />
      <TextInput type="text" placeholder="Address Line 2 (Optional)" value={values.addressLine2} onChange={update('addressLine2')} className="md:col-span-2" />
      <TextInput required type="text" placeholder="City" value={values.city} onChange={update('city')} />
      <TextInput required type="text" placeholder={statePlaceholder} value={values.state} onChange={update('state')} />
      <TextInput required type="text" placeholder="Postal Code" value={values.postalCode} onChange={update('postalCode')} />
      <TextInput required type="text" placeholder="Country" value={values.country} onChange={update('country')} />
    </div>
  );
}

function PaymentOption({
  value,
  selected,
  onChange,
  children,
}: {
  value: string;
  selected: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const isSelected = selected === value;

  return (
    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-black bg-black/5' : 'border-gray-200'}`}>
      <input type="radio" name="payment" value={value} checked={isSelected} onChange={(event) => onChange(event.target.value)} className="w-5 h-5 text-black focus:ring-black" />
      <span className="font-sans font-medium">{children}</span>
    </label>
  );
}

export default function CheckoutPage() {
  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const isTempSession = searchParams.get('session') === 'temp';
  
  const { items: cartItems, subtotal: cartSubtotal, discount: cartDiscount, grandTotal: cartTotal, clearCart } = useCart();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [coupon, setCoupon] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [shippingAddress, setShippingAddress] = useState({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' });
  const [billingAddress, setBillingAddress] = useState({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);

  const { user } = useAuth();
  const addresses = user?.addresses || [];

  useEffect(() => {
    if (user) {
      setCustomer(prev => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      const defaultAddr = user.addresses?.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setShippingAddress({
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2 || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country
        });
      } else if (user.addresses && user.addresses.length > 0) {
        const firstAddr = user.addresses[0];
        setSelectedAddressId(firstAddr._id);
        setShippingAddress({
          addressLine1: firstAddr.addressLine1,
          addressLine2: firstAddr.addressLine2 || '',
          city: firstAddr.city,
          state: firstAddr.state,
          postalCode: firstAddr.postalCode,
          country: firstAddr.country
        });
      }
    }
  }, [user]);

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === 'new') {
      setShippingAddress({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' });
    } else {
      const addr = addresses.find((a: any) => a._id === val);
      if (addr) {
        setShippingAddress({
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || '',
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country
        });
      }
    }
  };

  useEffect(() => {
    if (isTempSession) {
      const tempSession = sessionStorage.getItem('temp_checkout_session');
      if (tempSession) {
        const tempItems = JSON.parse(tempSession);
        setItems(tempItems);
        const st = tempItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
        setSubtotal(st);
        setGrandTotal(st - discount); // simplify for temp session for now
      } else {
        navigate('/cart');
      }
    } else {
      setItems(cartItems);
      setSubtotal(cartSubtotal);
      setDiscount(cartDiscount);
      setGrandTotal(cartTotal);
    }
  }, [isTempSession, cartItems, cartSubtotal, cartDiscount, cartTotal, discount, navigate]);

  const handleApplyCoupon = async () => {
    setError(null);
    if (!coupon) return;
    
    try {
      const payloadItems = items.map(i => ({ productId: i.id, quantity: i.quantity }));
      const res = await cartService.validateCoupon(coupon, payloadItems, accessToken);
      
      if (res.success && res.data?.valid) {
        setDiscount(res.data.pricing.discount);
        setGrandTotal(res.data.pricing.grandTotal);
        setError(null);
      } else {
        setError(res.message || 'Invalid coupon code');
        setDiscount(0);
        setGrandTotal(subtotal);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply coupon');
      setDiscount(0);
      setGrandTotal(subtotal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const billing = sameAsShipping ? shippingAddress : billingAddress;

    try {
      if (paymentMethod === 'Razorpay') {
        const payload = {
          customer,
          shippingAddress: selectedAddressId === 'new' ? shippingAddress : undefined,
          shippingAddressId: selectedAddressId !== 'new' ? selectedAddressId : undefined,
          saveAddress: selectedAddressId === 'new' ? saveShippingAddress : false,
          billingAddress: billing,
          items: items.map(i => ({ product: i.id, quantity: i.quantity })),
          couponCode: coupon,
          notes,
        };

        const orderResponse = await apiClient('/api/v1/payments/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!orderResponse.success) {
          setError(orderResponse.message || 'Failed to create order');
          setLoading(false);
          return;
        }

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'ElleStyle',
          description: 'Secure Checkout',
          order_id: orderResponse.data.orderId,
          handler: async function (response: any) {
            try {
              setLoading(true);
              const verifyRes = await apiClient('/api/v1/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                })
              });
              
              if (verifyRes.success) {
                if (isTempSession) sessionStorage.removeItem('temp_checkout_session');
                else clearCart();
                alert('Order placed successfully! Order Number: ' + verifyRes.data.orderNumber);
                navigate('/');
              } else {
                setError(verifyRes.message || 'Payment verification failed');
                setLoading(false);
              }
            } catch (err: any) {
              setError(err.message || 'Payment verification failed');
              setLoading(false);
            }
          },
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone,
          },
          theme: { color: '#000000' }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          setError(response.error.description);
          setLoading(false);
        });
        paymentObject.open();

      } else {
        // COD Flow
        const payload = {
          customer,
          shippingAddress: selectedAddressId === 'new' ? shippingAddress : undefined,
          shippingAddressId: selectedAddressId !== 'new' ? selectedAddressId : undefined,
          saveAddress: selectedAddressId === 'new' ? saveShippingAddress : false,
          billingAddress: billing,
          items: items.map(i => ({ product: i.id, quantity: i.quantity })),
          paymentMethod,
          couponCode: coupon,
          notes,
        };

        const response = await apiClient('/api/v1/checkout/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = response;
        
        if (data.success) {
          if (isTempSession) {
            sessionStorage.removeItem('temp_checkout_session');
          } else {
            clearCart();
          }
          alert('Order placed successfully! Order Number: ' + data.data.orderNumber);
          navigate('/');
        } else {
          setError(data.message || 'Failed to process order.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
    // We don't finally setLoading(false) here because Razorpay modal might be open.
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Typography variant="h3" className="mb-4">Your order is empty</Typography>
        <Button onClick={() => navigate('/')} variant="primary" className="rounded-full">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 mt-16" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Typography variant="h1" className="mb-12 text-center">Checkout</Typography>
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
          <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-10">

            <section className={sectionClass}>
              <Typography variant="h4" className="mb-6">Contact Information</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput required type="text" placeholder="Full Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                <TextInput required type="email" placeholder="Email Address" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                <TextInput required type="tel" placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="md:col-span-2" />
              </div>
            </section>

            <section className={sectionClass}>
              <Typography variant="h4" className="mb-6">Shipping Address</Typography>
              
              {addresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Saved Addresses</label>
                  <select 
                    value={selectedAddressId} 
                    onChange={handleAddressSelect}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors"
                  >
                    {addresses.map((addr: any) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode} {addr.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                    <option value="new">+ Enter a new address</option>
                  </select>
                </div>
              )}

              {selectedAddressId === 'new' && (
                <div className="flex flex-col gap-4 mt-2">
                  <AddressFields values={shippingAddress} onChange={setShippingAddress} statePlaceholder="State/Province" />
                  {user && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={saveShippingAddress} onChange={(e) => setSaveShippingAddress(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                      <span className="font-sans text-[15px] text-gray-700">Save this address to my profile</span>
                    </label>
                  )}
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h4">Billing Address</Typography>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                <span className="font-sans text-[15px] text-gray-700">Same as shipping address</span>
              </label>

              {!sameAsShipping && (
                <div className="mt-6">
                  <AddressFields values={billingAddress} onChange={setBillingAddress} statePlaceholder="State" />
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <Typography variant="h4" className="mb-6">Payment Method</Typography>
              <div className="flex flex-col gap-3">
                <PaymentOption value="Razorpay" selected={paymentMethod} onChange={setPaymentMethod}>
                  Razorpay (Cards, UPI, NetBanking)
                </PaymentOption>
                <PaymentOption value="Cash on Delivery" selected={paymentMethod} onChange={setPaymentMethod}>
                  Cash on Delivery
                </PaymentOption>
              </div>
            </section>

            <section className={sectionClass}>
              <Typography variant="h4" className="mb-6">Order Notes</Typography>
              <TextArea placeholder="Notes about your order, e.g. special notes for delivery." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[120px] resize-y" />
            </section>

          </form>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className={`${sectionClass} flex flex-col`}>
            <Typography variant="h4" className="mb-6">Order Summary</Typography>
            
            <div className="flex flex-col gap-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-sans text-[14px] font-medium leading-tight text-gray-900 line-clamp-2">{item.title}</span>
                    <span className="font-sans text-[13px] text-gray-500 mt-1">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-sans font-bold text-[15px]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-8">
              <input type="text" placeholder="Coupon Code" value={coupon} onChange={e => setCoupon(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors" />
              <Button onClick={handleApplyCoupon} variant="outline" className="rounded-xl px-6 whitespace-nowrap">Apply</Button>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[15px] text-gray-600">Subtotal</span>
                <span className="font-sans font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-sans text-[15px]">Discount</span>
                  <span className="font-sans font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-sans text-[15px] text-gray-600">Shipping</span>
                <span className="font-sans font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="font-sans text-[18px] font-bold">Total</span>
                <span className="font-sans text-[24px] font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" form="checkout-form" disabled={loading} variant="primary" className="w-full rounded-full py-4 mt-8 text-[16px] flex justify-center items-center">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Confirm Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
