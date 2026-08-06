import React from 'react';
import { Typography } from '../components/atoms/Typography';
import { Clock3, Mail, MapPin, MessageCircleMore, PhoneCall, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const ContactPage: React.FC = () => {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Visit us',
      details: ['ElleStyle India', 'Jaipur, Rajasthan, India'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['ellestylecom@gmail.com', 'Replies within 1-2 business days'],
    },
    {
      icon: PhoneCall,
      title: 'Phone / WhatsApp',
      details: ['+91 98765 43210', 'Chat for order support and updates'],
    },
    {
      icon: Clock3,
      title: 'Support hours',
      details: ['Mon to Sat', '10:00 AM to 7:00 PM IST'],
    },
  ];

  const servicePoints = [
    {
      icon: Sparkles,
      title: 'Curated handmade collections',
      description: 'Thoughtfully selected products with a calm, premium presentation.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure assistance',
      description: 'Reliable support for orders, payments, and post-purchase questions.',
    },
    {
      icon: Truck,
      title: 'Shipping guidance',
      description: 'Get help with delivery timelines, tracking, and packing updates.',
    },
    {
      icon: MessageCircleMore,
      title: 'WhatsApp support',
      description: 'Fast help for quick order queries and collection recommendations.',
    },
  ];

  return (
    <div className="bg-[#FAF9F6] text-black font-sans min-h-screen pb-12">
      <section className="relative overflow-hidden bg-[#EBE3D5]">
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
          <path d="M0,0 C280,120 420,460 820,560 L0,560 Z" fill="#E2D4C0" opacity="0.5" />
          <path d="M1440,0 C1110,70 1040,360 620,560 L1440,560 Z" fill="#F4EFE6" opacity="0.65" />
          <path d="M-120,180 C300,260 420,110 800,380 C1180,650 1500,210 1620,290" stroke="#C5B6A1" strokeWidth="1" fill="none" />
          <path d="M-120,410 C220,610 540,290 910,510 C1210,610 1420,390 1620,510" stroke="#C5B6A1" strokeWidth="1" fill="none" />
        </svg>

        <div className="relative z-10 mx-auto flex min-h-[420px] max-w-[1200px] items-center justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
          <div className="max-w-3xl text-center">
            <h1 className="font-fraunces text-4xl leading-[1.08] tracking-wider text-[#2c2a28] uppercase sm:text-5xl lg:text-[58px]">
              Let’s talk
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[11px] font-bold uppercase tracking-[0.22em] text-[#4a4744] sm:text-[12px]">
              Reach out for orders, wholesale inquiries, product guidance, or support.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <Typography variant="h2" className="font-fraunces text-[28px] uppercase tracking-widest text-[#2c2a28] sm:text-[30px]">
                Contact details
              </Typography>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a4744]">
                We keep communication simple and reliable. Use the details below for direct support, or send a message using the form and we’ll get back to you promptly.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {contactDetails.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-[1.5rem] border border-[#E7E1D7] bg-[#FAF9F6] p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2c2a28] text-white">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <p className="mt-4 text-[14px] font-semibold text-[#2c2a28]">{item.title}</p>
                      <div className="mt-2 space-y-1 text-sm leading-7 text-[#5a5754]">
                        {item.details.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#E7E1D7] bg-[#FBF7EF] p-6 shadow-[0_18px_45px_rgba(44,42,40,0.06)] sm:p-8">
              <Typography variant="h2" className="font-fraunces text-[26px] uppercase tracking-widest text-[#2c2a28] sm:text-[28px]">
                Send a message
              </Typography>
              <p className="mt-3 text-sm leading-7 text-[#4a4744]">
                Tell us what you are looking for and we’ll help with product details, availability, and the next steps.
              </p>

              <form className="mt-8 grid gap-4" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4a4744]">Name</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-[#E2D8C9] bg-white px-4 py-3 text-[14px] text-[#2c2a28] outline-none transition-colors placeholder:text-[#8A817A] focus:border-[#03989E]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4a4744]">Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      className="w-full rounded-2xl border border-[#E2D8C9] bg-white px-4 py-3 text-[14px] text-[#2c2a28] outline-none transition-colors placeholder:text-[#8A817A] focus:border-[#03989E]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4a4744]">Message</span>
                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Share the collection or order details you need help with"
                    className="w-full rounded-2xl border border-[#E2D8C9] bg-white px-4 py-3 text-[14px] text-[#2c2a28] outline-none transition-colors placeholder:text-[#8A817A] focus:border-[#03989E] resize-y"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-[#2c2a28] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#413d3a]"
                  >
                    Send enquiry
                  </button>
                  <p className="text-sm leading-6 text-[#5a5754]">
                    Prefer WhatsApp? Use the number listed above for quicker support.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F3EA]">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <Typography variant="h2" className="font-fraunces text-[28px] uppercase tracking-widest text-[#2c2a28] sm:text-[30px]">
              Why customers reach out
            </Typography>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#4a4744]">
              We help with collection recommendations, custom order questions, shipping updates, and wholesale conversations.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {servicePoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.title} className="group flex h-full flex-col gap-4 rounded-[1.75rem] border border-black/5 bg-white/85 px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/10 hover:bg-white hover:shadow-[0_18px_40px_rgba(44,42,40,0.08)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2c2a28] text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[15px] font-semibold text-[#2c2a28]">{point.title}</p>
                    <p className="text-sm leading-7 text-[#5a5754]">{point.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;