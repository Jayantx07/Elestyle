import React from 'react';

const ShippingPage: React.FC = () => {
  return (
    <div className="bg-[#FCFAF8] text-[#2c2a28] font-sans min-h-screen">
      <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-16 lg:py-24">
        
        {/* Main Title */}
        <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl text-[#03989E] font-bold mb-12 text-center tracking-wide">
          Shipping, Delivery & Return
        </h1>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-6">
              Shipping – Made to Celebrate Craftsmanship
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed font-normal">
              Every product is handcrafted with attention to detail. Slight variations are a natural part of the handmade process, and dispatch may take 3–7 business days.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-6">
              Refund, Cancellation & Exchange Policy
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed mb-8 font-normal">
              At Ellestyle, your satisfaction and happiness are our top priorities. Every product is carefully handcrafted with love and attention to detail. Please read our policy before placing your order.
            </p>

            <div className="space-y-8 pl-0 sm:pl-4">
              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#03989E] font-bold mb-4">
                  Refund Policy
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed font-normal">
                  <li>We do not offer refunds on purchased products.</li>
                  <li>Refunds will only be processed if your order cannot be fulfilled due to the product being out of stock.</li>
                  <li>Eligible refunds will be credited to the original payment method.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#03989E] font-bold mb-4">
                  Cancellation Policy
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed font-normal">
                  Once an order is placed, it cannot be cancelled, as we begin processing and preparing your handcrafted product immediately.
                </p>
              </div>

              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#03989E] font-bold mb-4">
                  Exchange Policy
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed mb-4 font-normal">
                  We gladly offer exchanges only in the case of a damaged or defective product.
                </p>
                <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed font-normal">
                  <li>The product must be unused, unwashed, and in the same condition as received.</li>
                  <li>The product must be returned in its original packaging with all tags and accessories intact.</li>
                  <li>An unboxing/opening video recorded from the moment the sealed package is opened is mandatory to support any damage or defect claim.</li>
                  <li>Claims without an opening video may not be accepted.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#03989E] font-bold mb-4">
                  Exchange Process
                </h3>
                <ul className="list-decimal pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed font-normal">
                  <li>Contact us via WhatsApp on the number provided on our website.</li>
                  <li>Share your order details, opening video, and clear photos/videos of the damaged or defective product.</li>
                  <li>Our team will review your request and respond within 2–3 business days.</li>
                  <li>Once your exchange request is approved, please return the item as instructed and place a new order for the desired product.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Closing Note */}
          <section className="pt-8 mt-12 border-t border-[#EAE2D6]">
            <p className="text-[16px] sm:text-[18px] text-[#59524a] leading-relaxed italic text-center">
              Thank you for choosing handcrafted products and for supporting traditional artisans. We truly appreciate your trust in Ellestyle.
            </p>
          </section>

        </div>
      </section>
    </div>
  );
};

export default ShippingPage;
