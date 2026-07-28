import type { ICategory } from '../lib/search/types';

export const CATEGORIES: ICategory[] = [
  {
    id: 'c1',
    title: 'Macrame Bags',
    slug: 'macrame-bags',
    description: 'Handcrafted macrame bags and totes.',
    keywords: ['bag', 'bags', 'tote', 'handbag', 'purse', 'macrame', 'woven bag', 'carry bag', 'shoulder bag', 'sling bag'],
    synonyms: ['hand bag'],
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
  },
  {
    id: 'c2',
    title: 'Handmade Candles',
    slug: 'handmade-candles',
    description: 'Aromatic handcrafted candles for your home.',
    keywords: ['candle', 'candles', 'wax', 'soy', 'scented', 'aroma', 'fragrance'],
    synonyms: [],
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg'
  },
  {
    id: 'c3',
    title: 'Handmade Earrings',
    slug: 'handmade-earrings',
    description: 'Beautiful artisanal earrings and jewelry.',
    keywords: ['earring', 'earrings', 'jewelry', 'studs', 'hoops', 'drops', 'accessories'],
    synonyms: ['jewellery'],
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg'
  },
  {
    id: 'c4',
    title: 'Rajasthani Vibes',
    slug: 'rajasthani-vibes',
    description: 'Home furnishing inspired by Rajasthani heritage.',
    keywords: ['home furnishing', 'furnishing', 'decor', 'rajasthani', 'cushion', 'throw', 'traditional', 'rug'],
    synonyms: ['home furniture', 'home decor'],
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
  },
  {
    id: 'c5',
    title: 'Wedding Giveaways',
    slug: 'wedding-giveaway',
    description: 'Thoughtful return gifts and tokens for your special day.',
    keywords: ['wedding', 'giveaway', 'gift', 'favors', 'favour', 'return gift', 'token'],
    synonyms: ['gifts', 'favours'],
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
  }
];
