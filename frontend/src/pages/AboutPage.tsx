import React from 'react';
import {
  Gem,
  ShoppingBag,
  Store,
  Users,
  Heart,
  Phone,
  Leaf,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const pageContent = {
  hero: {
    subtitle: "CRAFTED WITH PASSION • INSPIRED BY HERITAGE",
    titleStart: "Timeless Creations,",
    titleEnd: "Made to ",
    titleHighlight: "Inspire",
    description: "Discover thoughtfully curated jewellery, accessories, home décor and handcrafted treasures that bring elegance to every moment.",
    button: "EXPLORE COLLECTION",
    image: "https://res.cloudinary.com/gc1qeznc/image/upload/v1786619630/ellestyle/about/hero_products_aboutb.png"
  },
  grow: {
    title: "GROW TOGETHER WITH ELLESTYLE",
    columns: [
      {
        icon: Users,
        title: "JOIN US",
        subtitle: "and grow with us",
        description: "Be a part of the Ellestyle family and celebrate beautiful craftsmanship with us."
      },
      {
        icon: ShoppingBag,
        title: "JOIN OUR",
        subtitle: "reseller community",
        description: "Start your own business with our handcrafted collections and grow with confidence."
      },
      {
        icon: Store,
        title: "WE EMPOWER",
        subtitle: "small businesses",
        description: "Supporting artisans, creators and entrepreneurs through meaningful opportunities."
      }
    ],
    banner: {
      leftTitle: "JOIN OUR RESELLER COMMUNITY",
      leftDesc: "Be a part of our growing network and start your journey with us.",
      leftButton: "JOIN NOW",
      rightTitle: "FOR MORE INFORMATION",
      rightDesc: "Have questions? We're here to help!",
      rightPhone: "+91 98765 43210"
    }
  },
  about: {
    title: "ABOUT US",
    subtitle: "More Than a Brand, It's a Journey.",
    paragraphs: [
      "Ellestyle was created with a simple vision—to celebrate beautiful craftsmanship and bring thoughtfully curated products to people who appreciate quality and timeless design.",
      "Every collection is chosen with care, blending tradition with modern elegance. We believe every purchase supports creativity, skilled artisans, and the stories behind each creation."
    ],
    footer: "Thank you for being a part of our journey.",
    image: "https://res.cloudinary.com/gc1qeznc/image/upload/v1786617703/ellestyle/about/founder_mam.jpg"
  },
  features: [
    { icon: Leaf, title: "HANDCRAFTED", desc: "Made with love" },
    { icon: Gem, title: "PREMIUM QUALITY", desc: "Finest materials" },
    { icon: ShieldCheck, title: "ETHICAL & SUSTAINABLE", desc: "Conscious choices" },
    { icon: Truck, title: "SECURE DELIVERY", desc: "Pan India shipping" }
  ]
};

const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FCFAF8] text-[#2c2a28] font-sans min-h-screen">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#A67F5D]">
                {pageContent.hero.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mb-8" aria-hidden="true">
              <span className="h-[1px] w-8 bg-[#D3C1AF]" />
              <span className="text-[#D3C1AF] text-[10px]">✽</span>
              <span className="h-[1px] w-8 bg-[#D3C1AF]" />
            </div>

            <h1 className="font-fraunces text-[42px] leading-[1.1] sm:text-[54px] lg:text-[60px] text-[#2c2a28] mb-6">
              {pageContent.hero.titleStart}
              <br />
              {pageContent.hero.titleEnd}
              <span className="text-[#297373] italic font-normal">{pageContent.hero.titleHighlight}</span>
            </h1>

            <p className="text-[#59524a] text-[15px] sm:text-[16px] leading-relaxed mb-10 max-w-md">
              {pageContent.hero.description}
            </p>

            <Link to="/categories" className="inline-block bg-[#03989E] hover:bg-[#027a7e] text-white px-8 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-colors shadow-sm">
              {pageContent.hero.button}
            </Link>
          </div>

          <div className="relative w-full aspect-square sm:aspect-auto sm:h-[500px] lg:h-[650px] rounded-3xl border border-[#EAE2D6] bg-white p-2.5 sm:p-4 shadow-[0_15px_40px_rgba(44,42,40,0.06)]">
            <div className="w-full h-full relative rounded-2xl overflow-hidden">
              <img 
                src={pageContent.hero.image} 
                alt="Hero products" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GROW TOGETHER SECTION */}
      <section className="py-20 bg-[#FCFAF8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-2xl sm:text-[28px] text-[#2c2a28] tracking-[0.15em] uppercase mb-4">
              {pageContent.grow.title}
            </h2>
            <div className="flex items-center justify-center gap-2" aria-hidden="true">
              <span className="h-[1px] w-12 bg-[#D3C1AF]" />
              <span className="text-[#A67F5D] text-sm">✽</span>
              <span className="h-[1px] w-12 bg-[#D3C1AF]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
            {pageContent.grow.columns.map((col, idx) => {
              const Icon = col.icon;
              return (
                <div key={idx} className={`flex flex-col items-center text-center px-6 ${idx !== 2 ? 'md:border-r border-[#EAE2D6]' : ''}`}>
                  <div className="w-20 h-20 rounded-full border border-[#b2e5e7] bg-[#f0fafa] flex items-center justify-center mb-6 text-[#03989E]">
                    <Icon strokeWidth={1.5} size={32} />
                  </div>
                  <h3 className="font-fraunces text-[22px] tracking-[0.1em] uppercase text-[#2c2a28] mb-1">
                    {col.title}
                  </h3>
                  <p className="font-fraunces italic text-[#A67F5D] text-xl mb-5">
                    {col.subtitle}
                  </p>
                  <p className="text-[14px] text-[#59524a] leading-relaxed max-w-[260px]">
                    {col.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Banner */}
          <div className="mt-16 bg-[#FBF7EF] border border-[#EAE2D6] rounded-xl flex flex-col md:flex-row">
            <div className="flex-1 p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:border-r border-[#EAE2D6]">
              <div className="w-14 h-14 shrink-0 rounded-full border border-[#b2e5e7] bg-[#f0fafa] flex items-center justify-center text-[#03989E]">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-bold tracking-[0.1em] uppercase text-[#2c2a28] mb-2">
                  {pageContent.grow.banner.leftTitle}
                </h4>
                <p className="text-[14px] text-[#59524a]">
                  {pageContent.grow.banner.leftDesc}
                </p>
              </div>
              <button className="shrink-0 border border-[#03989E] bg-white text-[#03989E] hover:bg-[#03989E] hover:text-white transition-colors px-8 py-3 text-[11px] font-bold tracking-wider uppercase">
                {pageContent.grow.banner.leftButton}
              </button>
            </div>
            
            <div className="flex-[0.8] p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 border-t md:border-t-0 border-[#EAE2D6]">
              <div className="w-14 h-14 shrink-0 rounded-full border border-[#b2e5e7] bg-[#f0fafa] flex items-center justify-center text-[#03989E]">
                <Phone size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold tracking-[0.1em] uppercase text-[#2c2a28] mb-2">
                  {pageContent.grow.banner.rightTitle}
                </h4>
                <p className="text-[14px] text-[#59524a] mb-1">
                  {pageContent.grow.banner.rightDesc}
                </p>
                <p className="text-[#A67F5D] font-bold text-lg tracking-wide">
                  {pageContent.grow.banner.rightPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-20 bg-[#F2EDE4]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 pr-0 lg:pr-12">
              <h2 className="font-fraunces text-3xl sm:text-[34px] text-[#2c2a28] tracking-[0.15em] uppercase mb-2">
                {pageContent.about.title}
              </h2>
              <p className="font-fraunces italic text-[#A67F5D] text-2xl sm:text-[26px] mb-6">
                {pageContent.about.subtitle}
              </p>
              <div className="flex items-center gap-2 mb-8" aria-hidden="true">
                <span className="h-[1px] w-12 bg-[#D3C1AF]" />
                <span className="text-[#A67F5D] text-[10px]">♦</span>
                <span className="h-[1px] w-12 bg-[#D3C1AF]" />
              </div>
              
              <div className="space-y-6 text-[15px] sm:text-[16px] leading-relaxed text-[#59524a] mb-10">
                {pageContent.about.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Heart className="text-[#A67F5D]" size={20} fill="#A67F5D" />
                <span className="text-[#A67F5D] font-medium italic text-[17px]">
                  {pageContent.about.footer}
                </span>
              </div>
            </div>

            <div className="order-1 lg:order-2 w-full h-[450px] sm:h-[550px]">
              <img 
                src={pageContent.about.image} 
                alt="Woman making jewelry" 
                className="w-full h-full object-cover object-center shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER FEATURES */}
      <section className="border-t border-[#EAE2D6] bg-[#FCFAF8] py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#EAE2D6]">
            {pageContent.features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className={`flex flex-col items-center text-center px-4 ${idx > 1 ? 'pt-8 md:pt-0' : ''} ${idx === 1 ? 'pt-0' : ''}`}>
                  <Icon className="text-[#297373] mb-4" size={32} strokeWidth={1.5} />
                  <h4 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#2c2a28] mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-[13px] text-[#59524a]">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

