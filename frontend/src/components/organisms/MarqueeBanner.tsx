import React from 'react';

export const MarqueeBanner: React.FC = () => {
  const items = [
    'Handmade',
    'Rajasthani Vibes',
    'Sustainable',
    'Handmade Earrings',
    'Macrame Bags',
    'Handmade Soaps',
    'Wedding Giveaways',
  ];

  return (
    <div
      className="w-full overflow-hidden py-12 md:py-16"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="whitespace-nowrap flex items-center animate-marquee">
        {/* Triple array to create seamless loop */}
        {[...items, ...items, ...items].map((item, index) => (
          <React.Fragment key={index}>
            <span
              className="font-sans font-semibold tracking-[0.12em] uppercase text-xl px-8"
              style={{ color: 'var(--accent)' }}
            >
              {item}
            </span>
            <span style={{ color: 'var(--accent)', opacity: 0.3 }}>✦</span>
          </React.Fragment>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </div>
  );
};
