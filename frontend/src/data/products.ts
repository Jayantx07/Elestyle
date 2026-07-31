import type { IProduct } from '../lib/search/types';

export const PRODUCTS: IProduct[] = [
  {
    id: 'p1',
    title: 'Macrame Everyday Tote',
    slug: 'macrame-everyday-tote',
    category: 'macrame-bags',
    description: 'Handwoven macrame tote for daily carry and casual outings.',
    price: 1499,
    images: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
    ],
    tags: ['tote', 'bag', 'macrame'],
    searchKeywords: ['macrame', 'tote', 'bag', 'woven bag', 'handbag'],
    synonyms: ['hand bag'],
    isFeatured: true,
  },
  {
    id: 'p2',
    title: 'Soy Candle Set',
    slug: 'soy-candle-set',
    category: 'handmade-candles',
    description: 'A calming candle set with warm, earthy fragrance notes.',
    price: 899,
    images: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg'
    ],
    tags: ['candle', 'home fragrance'],
    searchKeywords: ['candle', 'soy candle', 'scented candle', 'home fragrance'],
    synonyms: [],
  },
  {
    id: 'p3',
    title: 'Textured Drop Earrings',
    slug: 'textured-drop-earrings',
    category: 'handmade-earrings',
    description: 'Lightweight handcrafted earrings with a subtle textured finish.',
    price: 699,
    images: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg'
    ],
    tags: ['earrings', 'jewelry'],
    searchKeywords: ['earrings', 'drop earrings', 'jewelry', 'accessories'],
    synonyms: ['jewellery'],
  },
  {
    id: 'p4',
    title: 'Heritage Cushion Cover',
    slug: 'heritage-cushion-cover',
    category: 'rajasthani-vibes',
    description: 'Decorative home furnishing inspired by Rajasthani heritage motifs.',
    price: 1299,
    images: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
    ],
    tags: ['cushion', 'decor', 'home furnishing'],
    searchKeywords: ['cushion', 'home decor', 'furnishing', 'rajasthani'],
    synonyms: ['home decor'],
  },
  {
    id: 'p5',
    title: 'Wedding Favor Box',
    slug: 'wedding-favor-box',
    category: 'wedding-giveaway',
    description: 'Thoughtful return gift box for weddings and special occasions.',
    price: 399,
    images: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
    ],
    tags: ['gift', 'wedding', 'favors'],
    searchKeywords: ['wedding favor', 'return gift', 'gift box', 'giveaway'],
    synonyms: ['gifts', 'favours'],
  },
];