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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-fraunces font-medium text-gray-900">My Wishlist</h1>
        <p className="text-gray-500 mt-2">Saved items you want to buy later.</p>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <Typography variant="h3" className="mb-2">Your wishlist is empty</Typography>
            <p className="font-sans text-gray-500 mb-6">Save items you love to your wishlist.</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
              <div className="col-span-5 pl-12">Product</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-3">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50/50 transition-colors">
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
                    <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                      {item.color && (
                        <p className="text-sm text-gray-500">Color: {item.color.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-gray-900 font-medium">
                    ₹{item.price.toFixed(2)}
                  </div>

                  {/* Date Added */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {item.dateAdded || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  {/* Stock Status & Action */}
                  <div className="col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button 
                      variant="primary" 
                      onClick={() => handleAddToCart(item)}
                      className="!py-2 !px-4 text-sm whitespace-nowrap w-full sm:w-auto !rounded-xl"
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
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">Share Wishlist:</span>
                <div className="flex w-full sm:w-auto">
                  <input 
                    type="text" 
                    value={wishlistLink}
                    readOnly
                    className="flex-1 sm:w-48 px-4 py-2 text-sm border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 bg-white"
                  />
                  <button onClick={copyLink} className="px-4 py-2 bg-gray-200 text-gray-900 text-sm font-medium rounded-r-xl hover:bg-gray-300 transition whitespace-nowrap">
                    Copy Link
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <button 
                  onClick={clearWishlist}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
                <Button variant="primary" onClick={handleAddAllToCart} className="whitespace-nowrap !rounded-xl !px-6">
                  Add All to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
