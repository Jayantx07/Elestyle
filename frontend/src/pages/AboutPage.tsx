import React from 'react';
import { Typography } from '../components/atoms/Typography';
import {
  BadgeCheck,
  Gem,
  Headphones,
  MessageCircleMore,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Truck,
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const features = [
    {
      label: 'Handmade quality',
      description: 'Each piece is crafted by skilled artisans for authentic, detailed workmanship.',
      icon: Sparkles,
    },
    {
      label: 'Premium materials',
      description: 'We use carefully selected, high-grade materials to ensure long-lasting elegance.',
      icon: Gem,
    },
    {
      label: 'Secure payments',
      description: 'Encrypted, trusted payment gateways keep every transaction safe.',
      icon: ShieldCheck,
    },
    {
      label: 'Fast shipping',
      description: 'Your order is dispatched quickly with reliable carriers and real-time tracking.',
      icon: Truck,
    },
    {
      label: 'Customer support & clear policies',
      description: 'Friendly support with transparent return and exchange policies you can trust.',
      icon: Headphones,
    },
    {
      label: 'Safe doorstep delivery & WhatsApp support',
      description: 'Packed with care, delivered safely to your door, with WhatsApp updates and assistance.',
      icon: MessageCircleMore,
    },
  ];

  const communityColumns = [
    {
      icon: Users,
      title: 'Join Us',
      subtitle: 'and grow with us',
      description: 'Be part of the ElleStyle family and celebrate beautiful craftsmanship with us.',
    },
    {
      icon: ShoppingBag,
      title: 'Join Our',
      subtitle: 'reseller community',
      description: 'Start your own business with our handcrafted collections and grow with confidence.',
    },
    {
      icon: Store,
      title: 'We Empower',
      subtitle: 'small businesses',
      description: 'Supporting artisans, creators, and entrepreneurs through meaningful opportunities.',
    },
  ];

  return (
    <div className="bg-[#FAF9F6] text-black font-sans min-h-screen pb-12">
      <div className="overflow-hidden">
        <section className="relative w-full bg-[#EBE3D5] overflow-hidden">
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
            <path d="M0,0 C300,100 400,500 800,600 L0,600 Z" fill="#E2D4C0" opacity="0.5" />
            <path d="M1440,0 C1100,50 1000,400 600,600 L1440,600 Z" fill="#F4EFE6" opacity="0.6" />
            <path d="M-100,200 C300,300 400,100 800,400 C1200,700 1500,200 1600,300" stroke="#C5B6A1" strokeWidth="1" fill="none" />
            <path d="M-100,400 C200,600 500,300 900,500 C1200,600 1400,400 1600,500" stroke="#C5B6A1" strokeWidth="1" fill="none" />
            <path d="M1200,-100 C1000,200 1300,400 1000,650" stroke="#C5B6A1" strokeWidth="1" fill="none" />
          </svg>

          <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1200px] items-center justify-center px-4 pt-28 pb-24 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28">
            <div className="max-w-3xl text-center">
              <h1 className="font-fraunces text-4xl leading-[1.08] tracking-wider text-[#2c2a28] uppercase sm:text-5xl lg:text-[58px]">
                Where tradition meets elegance
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-[11px] font-bold uppercase tracking-[0.22em] text-[#4a4744] sm:text-[12px]">
                Handmade details, thoughtful craftsmanship, and a refined experience for everyday living.
              </p>
              <div className="mt-10 flex justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2c2a28] shadow-[0_0_0_10px_rgba(44,42,40,0.08)]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#E6DCC9]">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <Typography variant="h2" className="font-fraunces text-[28px] uppercase tracking-widest text-[#2c2a28] sm:text-[30px]">
                Why Choose Us
              </Typography>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#4a4744]">
                A calm, premium experience with careful craftsmanship, reliable service, and delivery you can trust.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="group flex h-full flex-col gap-4 rounded-[1.75rem] border border-black/5 bg-white/80 px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/10 hover:bg-white hover:shadow-[0_18px_40px_rgba(44,42,40,0.08)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2c2a28] text-white transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[15px] font-semibold text-[#2c2a28]">
                        {feature.label}
                      </p>
                      <p className="text-sm leading-7 text-[#5a5754]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div className="space-y-5">
                <Typography variant="h2" className="font-fraunces text-2xl uppercase tracking-widest text-[#2c2a28] sm:text-[28px]">
                  About
                </Typography>
                <p className="max-w-3xl text-[15px] leading-8 text-[#4a4744] sm:text-[16px]">
                  ElleStyle is built for customers who value refined craftsmanship, timeless styling, and a calm shopping experience. Every collection is curated to feel warm, elegant, and easy to wear, with attention to quality that holds up beyond the first impression.
                </p>
                <p className="max-w-3xl text-[15px] leading-8 text-[#4a4744] sm:text-[16px]">
                  From handmade details to reliable service, the goal is simple: create products and experiences that feel personal, polished, and trustworthy from discovery to delivery.
                </p>
              </div>

              <div className="rounded-[2rem] border border-[#E7E1D7] bg-[#FAF9F6] p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {['Curated collections', 'Thoughtful packaging', 'Responsive support', 'Elegant presentation'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
                      <BadgeCheck className="h-5 w-5 shrink-0 text-[#2c2a28]" strokeWidth={1.8} />
                      <span className="text-sm font-medium text-[#2c2a28]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#F8F3EA]">
          <svg className="pointer-events-none absolute left-0 top-0 hidden h-full w-28 text-[#E6D9C0] lg:block" viewBox="0 0 120 520" fill="none" aria-hidden="true">
            <path d="M54 500C26 434 12 368 14 304C16 240 32 178 60 118" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M42 450C22 422 16 392 18 360" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M62 396C86 366 98 336 98 304" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M34 338C12 308 4 274 8 238" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M70 286C94 260 104 230 102 196" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M38 230C18 208 12 182 14 152" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <svg className="pointer-events-none absolute right-0 top-0 hidden h-full w-28 text-[#E6D9C0] lg:block" viewBox="0 0 120 520" fill="none" aria-hidden="true">
            <path d="M66 500C94 434 108 368 106 304C104 240 88 178 60 118" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M78 450C98 422 104 392 102 360" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M58 396C34 366 22 336 22 304" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M86 338C108 308 116 274 112 238" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M50 286C26 260 16 230 18 196" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M82 230C102 208 108 182 106 152" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>

          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <Typography variant="h2" className="font-fraunces text-[28px] uppercase tracking-[0.12em] text-[#2c2a28] sm:text-[30px]">
                Grow Together With ElleStyle
              </Typography>
              <div className="mt-3 flex items-center justify-center gap-3 text-[#B9985A]" aria-hidden="true">
                <span className="h-px w-14 bg-current/60" />
                <span className="text-lg">✽</span>
                <span className="h-px w-14 bg-current/60" />
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-0 overflow-hidden rounded-[2rem] border border-[#eadfcf] bg-white/70 shadow-[0_18px_45px_rgba(44,42,40,0.06)] lg:grid-cols-3">
              {communityColumns.map((column, index) => {
                const Icon = column.icon;

                return (
                  <div
                    key={column.title}
                    className={`flex h-full flex-col items-center px-8 py-10 text-center ${index < communityColumns.length - 1 ? 'border-b border-[#ece1d4] lg:border-b-0 lg:border-r' : ''}`}
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ead9] text-[#B88932] shadow-inner shadow-white/60">
                      <Icon className="h-9 w-9" strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-6 font-fraunces text-[26px] uppercase tracking-[0.08em] text-[#2c2a28] sm:text-[28px]">
                      {column.title}
                    </h3>
                    <p className="mt-1 font-fraunces italic text-[22px] leading-none text-[#B88932] sm:text-[24px]">
                      {column.subtitle}
                    </p>
                    <p className="mt-5 max-w-sm text-[14px] leading-7 text-[#59524a]">
                      {column.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#eadfcf] bg-[#FBF7EF] shadow-[0_10px_30px_rgba(44,42,40,0.05)]">
              <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1.3fr_0.7fr]">
                <div className="flex flex-col justify-center gap-3 border-b border-[#eadfcf] px-7 py-8 lg:border-b-0 lg:border-r lg:px-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2c2a28]">
                    Join Our Reseller Community
                  </p>
                  <p className="max-w-xl text-sm leading-7 text-[#59524a]">
                    Be part of our growing network and start your journey with us.
                  </p>
                </div>

                <div className="flex items-center justify-center px-7 py-8 lg:px-10">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-full border border-[#B9985A] bg-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2c2a28] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fcf7ee] hover:shadow-[0_8px_20px_rgba(185,152,90,0.18)]"
                  >
                    Join Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black text-white">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
              <div>
                <Typography variant="h2" className="font-fraunces text-3xl uppercase tracking-widest leading-tight sm:text-4xl">
                  Join Us
                </Typography>
                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-300 sm:text-[15px]">
                  Sign up to receive new arrivals, exclusive offers, and updates from ElleStyle. Stay connected to the latest handmade collections and special drops.
                </p>
                <a
                  href="#"
                  className="mt-8 inline-flex items-center border-b border-white pb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-gray-300"
                >
                  Learn More
                </a>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
                <form className="grid gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-[13px] text-black outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-[13px] text-black outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-[13px] text-black outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  />
                  <button
                    type="button"
                    className="mt-1 inline-flex w-fit items-center justify-center rounded-full bg-[#D1C3AD] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-white"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
