import React, { useState } from 'react';
import { SectionHeader } from '../molecules/SectionHeader';
import { CategoryTabs } from '../molecules/CategoryTabs';
import { ProductCard } from '../molecules/ProductCard';

// All product images use Cloudinary CDN — no broken local paths
const ALL_PRODUCTS: Record<string, {
  id: string; title: string; price: number;
  description: string; imageSrc: string; altText: string;
}[]> = {
  'home-furnishing': [
    {
      id: 'hf1',
      title: 'Woven Throw Blanket',
      price: 128,
      description: 'Hand-loomed cotton, soft cream.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      altText: 'Woven Throw Blanket',
    },
    {
      id: 'hf2',
      title: 'Ceramic Ivory Vase',
      price: 74,
      description: 'Wheel-thrown matte finish.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      altText: 'Ceramic Ivory Vase',
    },
    {
      id: 'hf3',
      title: 'Linen Cushion Set',
      price: 96,
      description: 'Stone-washed European linen.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      altText: 'Linen Cushion Set',
    },
    {
      id: 'hf4',
      title: 'Rattan Pendant Light',
      price: 210,
      description: 'Woven by hand in Bali.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      altText: 'Rattan Pendant Light',
    },
  ],
  'jewelry': [
    {
      id: 'he1',
      title: 'Terracotta Hoops',
      price: 449,
      description: 'Hand-formed clay, geometric shape.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      altText: 'Hand-formed terracotta clay geometric hoop earrings',
    },
    {
      id: 'he2',
      title: 'Brass Leaf Drops',
      price: 549,
      description: 'Oxidised brass, hand-hammered.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
      altText: 'Hand-hammered oxidised brass leaf drop earrings',
    },
    {
      id: 'he3',
      title: 'Labradorite Studs',
      price: 699,
      description: 'Semi-precious stone, sterling post.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      altText: 'Semi-precious labradorite stone stud earrings on sterling post',
    },
    {
      id: 'he4',
      title: 'Beaded Chandelier',
      price: 799,
      description: 'Glass beads, hand-strung gold wire.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
      altText: 'Hand-strung glass bead chandelier earrings on gold wire',
    },
  ],
  'bags': [
    {
      id: 'mb1',
      title: 'Boho Knot Tote',
      price: 1299,
      description: 'Natural cotton macrame, open weave.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      altText: 'Hand-knotted natural cotton macrame tote bag in cream',
    },
    {
      id: 'mb2',
      title: 'Jute Mini Clutch',
      price: 699,
      description: 'Handwoven jute with tassel detail.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      altText: 'Handwoven jute mini clutch with tassel in natural tan',
    },
    {
      id: 'mb3',
      title: 'Fringe Market Bag',
      price: 899,
      description: 'Open-weave cotton with fringe hem.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      altText: 'Open-weave cotton macrame market bag with fringe hem',
    },
    {
      id: 'mb4',
      title: 'Rope Shoulder Bag',
      price: 1499,
      description: 'Twisted cotton rope, structured base.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      altText: 'Twisted cotton rope shoulder bag with structured base',
    },
  ],
  'homemade-soaps': [
    {
      id: 'hc1',
      title: 'Amber & Sandalwood',
      price: 599,
      description: 'Soy wax, 40-hour burn time.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      altText: 'Handpoured soy wax candle in amber and sandalwood scent',
    },
    {
      id: 'hc2',
      title: 'Jasmine & Vetiver',
      price: 649,
      description: 'Coconut soy blend, cotton wick.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      altText: 'Handmade jasmine and vetiver scented candle with cotton wick',
    },
    {
      id: 'hc3',
      title: 'Rose & Cedarwood',
      price: 749,
      description: 'Pure beeswax, hand-dipped.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      altText: 'Hand-dipped pure beeswax candle in rose and cedarwood',
    },
    {
      id: 'hc4',
      title: 'Vanilla & Oud',
      price: 849,
      description: 'Luxury soy blend, 55-hour burn.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      altText: 'Luxury soy blend vanilla and oud candle, long burn time',
    },
  ],
  'wedding-giveaways': [
    {
      id: 'wg1',
      title: 'Miniature Candle Set',
      price: 999,
      description: 'Set of 4 soy candles, gift-boxed.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      altText: 'Set of four handpoured soy wedding favour candles in gift box',
    },
    {
      id: 'wg2',
      title: 'Potli Favour Bag',
      price: 349,
      description: 'Embroidered silk with name tag.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
      altText: 'Embroidered silk wedding favour potli bag with personalised name tag',
    },
    {
      id: 'wg3',
      title: 'Incense & Holder Set',
      price: 699,
      description: 'Natural incense + brass holder.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      altText: 'Natural incense sticks and brass holder wedding favour gift set',
    },
    {
      id: 'wg4',
      title: 'Personalised Token Box',
      price: 1299,
      description: 'Engraved wooden box + your message.',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
      altText: 'Personalised engraved wooden wedding token box with custom message',
    },
  ],
};

const CATEGORY_META: Record<string, { label: string; heading: string; accent: string }> = {
  'home-furnishing': { label: 'HOME FURNISHING', heading: 'Recommended', accent: 'Home Furnishing' },
  'bags':            { label: 'BAGS',            heading: 'Recommended', accent: 'Bags' },
  'jewelry':         { label: 'JEWELRY',         heading: 'Recommended', accent: 'Jewelry' },
  'homemade-soaps':  { label: 'HOMEMADE SOAPS',  heading: 'Recommended', accent: 'Homemade Soaps' },
};

export const ProductGridSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('home-furnishing');

  const tabs = Object.entries(CATEGORY_META).map(([id, meta]) => ({
    id,
    label: meta.label,
  }));

  const products = ALL_PRODUCTS[activeCategory] ?? [];
  const meta = CATEGORY_META[activeCategory];

  return (
    <section className="py-16 md:py-32 px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <CategoryTabs
          categories={tabs}
          activeCategoryId={activeCategory}
          onSelect={setActiveCategory}
          className="mb-12"
        />

        <SectionHeader
          subtitle="CURATED"
          title={meta.heading}
          titleAccent={meta.accent}
          actionText="SEE ALL"
          onAction={() => {}}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              description={product.description}
              imageSrc={product.imageSrc}
              altText={product.altText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


