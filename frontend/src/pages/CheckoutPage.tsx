import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Typography } from '../components/atoms/Typography';
import { Button } from '../components/atoms/Button';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

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
    // Basic local application to update UI before backend does the real check
    if (coupon.toUpperCase() === 'DISCOUNT10') {
      const newDiscount = subtotal * 0.1;
      setDiscount(newDiscount);
      setGrandTotal(subtotal - newDiscount);
      setError(null);
    } else {
      setError('Invalid coupon code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const billing = sameAsShipping ? shippingAddress : billingAddress;

    try {
      const response = await fetch('/api/v1/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          shippingAddress,
          billingAddress: billing,
          items: items.map(i => ({ product: i.id, quantity: i.quantity })),
          paymentMethod,
          couponCode: coupon,
          notes,
        })
      });

      const data = await response.json();
      
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
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
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
              <AddressFields values={shippingAddress} onChange={setShippingAddress} statePlaceholder="State/Province" />
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
                <PaymentOption value="Credit Card" selected={paymentMethod} onChange={setPaymentMethod}>
                  Credit Card (Dummy)
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
              <input type="text" placeholder="Coupon Code (try DISCOUNT10)" value={coupon} onChange={e => setCoupon(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors" />
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
