import React, { useEffect, useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Typography } from '../components/atoms/Typography';
import { Button } from '../components/atoms/Button';

const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlistLink, setWishlistLink] = useState('');
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setWishlistLink(window.location.href);
  }, []);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      imageSrc: item.imageSrc,
      quantity: 1,
    });
  };

  const handleAddAllToCart = () => {
    items.forEach(item => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        imageSrc: item.imageSrc,
        quantity: 1,
      });
    });
    alert('All items added to cart!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(wishlistLink);
    alert('Wishlist link copied!');
  };

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8" style={{ backgroundColor: 'var(--bg-page)' }}>


      <div className="max-w-7xl mx-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-lg shadow-sm border border-gray-100">
            <Typography variant="h3" className="mb-4">Your wishlist is empty</Typography>
            <p className="font-sans text-sm text-gray-500 mb-8">Save items you love to your wishlist.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-[#2d2d2d] text-white uppercase text-xs font-semibold tracking-wider rounded-t-lg">
              <div className="col-span-5 pl-12">Product</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-3">Stock Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 transition-colors">
                  {/* Product Info */}
                  <div className="col-span-5 flex items-center gap-4">
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      {item.color && (
                        <p className="text-sm text-gray-500">Color : {item.color.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-gray-900 font-medium">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Date Added */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {item.dateAdded || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                  {/* Stock Status & Action */}
                  <div className="col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className={`text-sm font-semibold ${item.stockStatus === 'Out of Stock' ? 'text-red-500' : 'text-green-500'}`}>
                      {item.stockStatus || 'In Stock'}
                    </span>
                    <Button 
                      variant="primary" 
                      onClick={() => handleAddToCart(item)}
                      className="!py-2 !px-6 text-sm whitespace-nowrap"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Table Footer Actions */}
            <div className="p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 whitespace-nowrap">Wishlist link:</span>
                <div className="flex w-full sm:w-auto">
                  <input 
                    type="text" 
                    value={wishlistLink}
                    readOnly
                    className="flex-1 sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-l-full focus:outline-none text-gray-600 bg-white"
                  />
                  <Button variant="primary" onClick={copyLink} className="!rounded-l-none !rounded-r-full whitespace-nowrap">
                    Copy Link
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <button 
                  onClick={clearWishlist}
                  className="text-sm font-semibold text-red-500 border-b border-red-500 hover:text-red-600 hover:border-red-600 transition-colors whitespace-nowrap"
                >
                  Clear Wishlist
                </button>
                <Button variant="primary" onClick={handleAddAllToCart} className="whitespace-nowrap">
                  Add All to Cart
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-[#03989E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Free Shipping</h4>
              <p className="text-xs text-gray-500">Free Shipping for order above $50</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-[#03989E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Flexible Payment</h4>
              <p className="text-xs text-gray-500">Multiple secure payment options</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-[#03989E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">24x7 Support</h4>
              <p className="text-xs text-gray-500">We support online all days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
