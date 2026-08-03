import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type CategorySection = {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  imageFirst: boolean;
};

const CATEGORIES: CategorySection[] = [
  {
    title: 'Royal Rajasthani Living',
    slug: 'rajasthani-vibes',
    tagline: 'Heritage decor with quiet, handcrafted character.',
    description: 'Warm textures and timeless details for rooms that feel layered and calm.',
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
    imageFirst: true,
  },
  {
    title: 'Bag Collection',
    slug: 'macrame-bags',
    tagline: 'Handmade carry pieces with a soft artisan feel.',
    description: 'Expressive bags designed for everyday use, gifting, and easy styling.',
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
    imageFirst: false,
  },
  {
    title: 'Jewelry Collection',
    slug: 'handmade-earrings',
    tagline: 'Minimal jewelry with a handcrafted edge.',
    description: 'Light, refined pieces that finish everyday dressing with ease.',
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
    imageFirst: true,
  },
  {
    title: 'Artisans Candles',
    slug: 'handmade-candles',
    tagline: 'Soft ambiance and scent, made with intention.',
    description: 'Calming candles that bring warmth, fragrance, and visual softness.',
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
    imageFirst: false,
  },
  {
    title: 'Wedding Collections',
    slug: 'wedding-giveaway',
    tagline: 'Thoughtful keepsakes for celebrations and gifting.',
    description: 'A curated range of wedding-ready pieces that feel personal and festive.',
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
    imageFirst: true,
  },
];

const CategoriesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 md:pb-16" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl mb-8 md:mb-10">
          <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-black/35 mb-3">
            Categories
          </p>
          <h1 className="font-fraunces text-4xl md:text-5xl lg:text-6xl leading-[0.95] text-charcoal">
            Discover the collection families
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-[14px] md:text-[15px] leading-relaxed text-black/50">
            Browse the categories in a calm, storefront-style layout and open each collection directly from here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 xl:gap-8">
          {CATEGORIES.map((category, index) => {
            const isWide = index === CATEGORIES.length - 1;

            return (
              <section
                key={category.slug}
                className={`overflow-hidden rounded-[28px] border border-black/5 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] ${isWide ? 'lg:col-span-2' : ''}`}
              >
                <div className={`grid grid-cols-1 ${isWide ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'md:grid-cols-[1.05fr_0.95fr]'} items-stretch`}>
                  <div className={`${category.imageFirst ? '' : 'lg:order-2'} min-h-[210px] md:min-h-[240px] lg:min-h-[260px]`}>
                    <div className="relative h-full w-full bg-[#f7f4ef]">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className={`${category.imageFirst ? 'lg:order-2' : ''} flex items-center`}>
                    <div className="w-full max-w-xl mx-auto p-5 md:p-7 lg:p-9 xl:p-10">
                      <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-black/30 mb-3">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="font-fraunces text-3xl md:text-4xl lg:text-5xl leading-none text-charcoal">
                        {category.title}
                      </h2>
                      <p className="mt-3 font-sans text-[12px] md:text-[13px] uppercase tracking-[0.18em] text-black/45">
                        {category.tagline}
                      </p>
                      <p className="mt-3 max-w-md font-sans text-[14px] md:text-[15px] leading-relaxed text-black/55">
                        {category.description}
                      </p>

                      <div className="mt-6 md:mt-7">
                        <Link
                          to={`/shop/${category.slug}`}
                          className="group inline-flex h-12 items-stretch overflow-hidden rounded-[20px] bg-[#03989E] text-white transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03989E]/30"
                        >
                          <span className="flex min-w-[168px] items-center justify-center whitespace-nowrap px-6 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Explore Collection
                          </span>
                          <span className="flex w-12 items-center justify-center border-l border-white/20 bg-white">
                            <ArrowRight className="h-4 w-4 text-[#03989E] transition-transform duration-300 group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;