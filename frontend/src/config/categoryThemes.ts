// ============================================================
// CATEGORY THEMES CONFIG
// Single source of truth for all five category pages.
// All hex values come from CSS custom properties — this file
// only stores display data (copy, slugs, image URLs).
// ============================================================

export type CategorySlug =
  | 'macrame-bags'
  | 'handmade-candles'
  | 'handmade-earrings'
  | 'rajasthani-vibes'
  | 'wedding-giveaway';

export type CategoryThemeKey =
  | 'macrame'
  | 'candles'
  | 'earrings'
  | 'rajasthani'
  | 'wedding';

export interface CategoryProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageSrc: string;
  altText: string;
}

export interface CategoryReview {
  id: string;
  quote: string;
  userName: string;
  userLocation: string;
  imageSrc: string;
  badge: string;
}

export interface CategoryFilterTab {
  id: string;
  label: string;
}

export interface CategoryTheme {
  slug: CategorySlug;
  themeKey: CategoryThemeKey;
  displayName: string;
  eyebrow: string;          // Uppercase eyebrow label
  heroHeading: string;      // Plain part of H1
  heroHeadingItalic: string; // Italic/em part of H1
  heroDescription: string;
  heroImage: string;        // Hero background or lifestyle image
  filterTabs: CategoryFilterTab[];
  products: CategoryProduct[];
  editorialImage: string;
  editorialHeading: string;
  editorialBody: string;
  reviews: CategoryReview[];
}

// ============================================================
// MACRAME BAGS
// ============================================================
const macrameBags: CategoryTheme = {
  slug: 'macrame-bags',
  themeKey: 'macrame',
  displayName: 'Macrame Bags',
  eyebrow: 'MACRAME BAGS',
  heroHeading: 'Woven by hand,',
  heroHeadingItalic: 'carried with pride.',
  heroDescription: 'Each macrame bag is a labour of love — hand-knotted with natural fibres, no two are ever quite the same.',
  heroImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
  filterTabs: [
    { id: 'all', label: 'ALL' },
    { id: 'totes', label: 'TOTES' },
    { id: 'clutches', label: 'CLUTCHES' },
    { id: 'mini', label: 'MINI BAGS' },
    { id: 'new', label: 'NEW ARRIVALS' },
  ],
  products: [
    {
      id: 'mb-1',
      title: 'Boho Knot Tote',
      description: 'Natural cotton macrame, open weave.',
      price: 1299,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      altText: 'Hand-knotted natural cotton macrame tote bag in cream',
    },
    {
      id: 'mb-2',
      title: 'Jute Mini Clutch',
      description: 'Handwoven jute with tassel detail.',
      price: 699,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      altText: 'Handwoven jute mini clutch with tassel in natural tan',
    },
    {
      id: 'mb-3',
      title: 'Fringe Market Bag',
      description: 'Open-weave cotton with fringe hem.',
      price: 899,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      altText: 'Open-weave cotton macrame market bag with fringe hem',
    },
    {
      id: 'mb-4',
      title: 'Rope Shoulder Bag',
      description: 'Twisted cotton rope, structured base.',
      price: 1499,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      altText: 'Twisted cotton rope shoulder bag with structured base',
    },
  ],
  editorialImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
  editorialHeading: 'The art of the knot',
  editorialBody: 'Macrame is one of the world\'s oldest textile arts — originating in 13th-century Arabia and perfected over centuries across continents. Each ElleStyle bag begins as a length of natural cotton or jute rope, hand-knotted over hours by our artisan partners. No machinery. No shortcuts. Just patience, rhythm, and craft.',
  reviews: [
    {
      id: 'r1',
      quote: 'I\'ve gotten so many compliments on this bag. It feels luxurious and earthy at the same time.',
      userName: 'Ananya R.',
      userLocation: 'MUMBAI, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      badge: 'MACRAME BAGS',
    },
    {
      id: 'r2',
      quote: 'The craftsmanship is exceptional. You can feel the care in every knot.',
      userName: 'Priya M.',
      userLocation: 'BANGALORE, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
      badge: 'MACRAME BAGS',
    },
    {
      id: 'r3',
      quote: 'Perfect for the beach, market, or just everyday errands.',
      userName: 'Sofia T.',
      userLocation: 'MILAN, IT',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg',
      badge: 'MACRAME BAGS',
    },
  ],
};

// ============================================================
// HANDMADE CANDLES
// ============================================================
const handmadeCandles: CategoryTheme = {
  slug: 'handmade-candles',
  themeKey: 'candles',
  displayName: 'Handmade Candles',
  eyebrow: 'HANDMADE CANDLES',
  heroHeading: 'Light a moment,',
  heroHeadingItalic: 'hold it still.',
  heroDescription: 'Small-batch candles poured with natural soy wax and pure essential oils. Every flame tells a story of slow craft.',
  heroImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
  filterTabs: [
    { id: 'all', label: 'ALL' },
    { id: 'soy', label: 'SOY WAX' },
    { id: 'beeswax', label: 'BEESWAX' },
    { id: 'scented', label: 'SCENTED' },
    { id: 'unscented', label: 'UNSCENTED' },
  ],
  products: [
    {
      id: 'hc-1',
      title: 'Amber & Sandalwood',
      description: 'Soy wax, 40-hour burn time.',
      price: 599,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      altText: 'Handpoured soy wax candle in amber and sandalwood scent',
    },
    {
      id: 'hc-2',
      title: 'Jasmine & Vetiver',
      description: 'Coconut soy blend, cotton wick.',
      price: 649,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      altText: 'Handmade jasmine and vetiver scented candle with cotton wick',
    },
    {
      id: 'hc-3',
      title: 'Rose & Cedarwood',
      description: 'Pure beeswax, hand-dipped.',
      price: 749,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      altText: 'Hand-dipped pure beeswax candle in rose and cedarwood',
    },
    {
      id: 'hc-4',
      title: 'Vanilla & Oud',
      description: 'Luxury soy blend, 55-hour burn.',
      price: 849,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      altText: 'Luxury soy blend vanilla and oud candle, long burn time',
    },
  ],
  editorialImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
  editorialHeading: 'Poured in small batches',
  editorialBody: 'Every ElleStyle candle begins with a recipe. Our makers blend natural waxes at precise temperatures, fold in botanically-derived essential oils, and pour each vessel by hand. The result is a candle that burns evenly, cleanly, and fills your space with something you won\'t find in a department store.',
  reviews: [
    {
      id: 'r1',
      quote: 'The Amber & Sandalwood is my daily ritual now. It smells incredible and lasts forever.',
      userName: 'Meera K.',
      userLocation: 'DELHI, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      badge: 'CANDLES',
    },
    {
      id: 'r2',
      quote: 'These make the most thoughtful gifts. The packaging alone is beautiful.',
      userName: 'Hana Y.',
      userLocation: 'TOKYO, JP',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      badge: 'CANDLES',
    },
    {
      id: 'r3',
      quote: 'Clean burn, no soot, perfect scent throw. Worth every rupee.',
      userName: 'Rekha S.',
      userLocation: 'PUNE, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      badge: 'CANDLES',
    },
  ],
};

// ============================================================
// HANDMADE EARRINGS
// ============================================================
const handmadeEarrings: CategoryTheme = {
  slug: 'handmade-earrings',
  themeKey: 'earrings',
  displayName: 'Handmade Earrings',
  eyebrow: 'HANDMADE EARRINGS',
  heroHeading: 'Small details,',
  heroHeadingItalic: 'loud statements.',
  heroDescription: 'Delicate, hand-formed earrings crafted from brass, terracotta, and natural stone. One-of-a-kind pieces for every mood.',
  heroImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
  filterTabs: [
    { id: 'all', label: 'ALL' },
    { id: 'hoops', label: 'HOOPS' },
    { id: 'studs', label: 'STUDS' },
    { id: 'drops', label: 'DROPS' },
    { id: 'statement', label: 'STATEMENT' },
  ],
  products: [
    {
      id: 'he-1',
      title: 'Terracotta Hoops',
      description: 'Hand-formed clay, geometric shape.',
      price: 449,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      altText: 'Hand-formed terracotta clay geometric hoop earrings in burnt orange',
    },
    {
      id: 'he-2',
      title: 'Brass Leaf Drops',
      description: 'Oxidised brass, hand-hammered.',
      price: 549,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
      altText: 'Hand-hammered oxidised brass leaf drop earrings',
    },
    {
      id: 'he-3',
      title: 'Stone Stud Set',
      description: 'Semi-precious labradorite, sterling post.',
      price: 699,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      altText: 'Semi-precious labradorite stone stud earrings on sterling post',
    },
    {
      id: 'he-4',
      title: 'Beaded Chandelier',
      description: 'Glass beads, hand-strung on gold wire.',
      price: 799,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
      altText: 'Hand-strung glass bead chandelier earrings on gold wire',
    },
  ],
  editorialImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
  editorialHeading: 'Crafted from the earth',
  editorialBody: 'Our earrings celebrate natural materials — terracotta fired in small kilns, brass hammered on hand anvils, stones sourced from ethical gem markets. Each piece takes between 30 minutes and 3 hours to complete. The maker\'s fingerprints, quite literally, remain in the clay.',
  reviews: [
    {
      id: 'r1',
      quote: 'I wore these to a wedding and got stopped three times to say where they came from.',
      userName: 'Divya N.',
      userLocation: 'CHENNAI, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      badge: 'EARRINGS',
    },
    {
      id: 'r2',
      quote: 'Lightweight, beautiful, and unlike anything else I own.',
      userName: 'Laila P.',
      userLocation: 'DUBAI, AE',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
      badge: 'EARRINGS',
    },
    {
      id: 'r3',
      quote: 'The terracotta hoops are so unique. Perfect for everyday wear.',
      userName: 'Sana Q.',
      userLocation: 'KARACHI, PK',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
      badge: 'EARRINGS',
    },
  ],
};

// ============================================================
// RAJASTHANI VIBES
// ============================================================
const rajasthaniVibes: CategoryTheme = {
  slug: 'rajasthani-vibes',
  themeKey: 'rajasthani',
  displayName: 'Rajasthani Vibes',
  eyebrow: 'RAJASTHANI VIBES',
  heroHeading: 'Heritage in every thread,',
  heroHeadingItalic: 'colour in every stitch.',
  heroDescription: 'Bags and women\'s accessories steeped in the rich textile traditions of Rajasthan — bold colour, intricate craft, timeless spirit.',
  heroImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
  filterTabs: [
    { id: 'all', label: 'ALL' },
    { id: 'bags', label: 'BAGS' },
    { id: 'scarves', label: 'SCARVES' },
    { id: 'jewellery', label: 'JEWELLERY' },
    { id: 'accessories', label: 'ACCESSORIES' },
  ],
  products: [
    {
      id: 'rv-1',
      title: 'Bandhani Potli Bag',
      description: 'Tie-dye silk, drawstring closure.',
      price: 1199,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg',
      altText: 'Handmade Bandhani tie-dye silk potli bag in vibrant pink and gold',
    },
    {
      id: 'rv-2',
      title: 'Phulkari Embroidered Clutch',
      description: 'Hand-embroidered cotton, gold thread.',
      price: 1499,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
      altText: 'Hand-embroidered Phulkari cotton clutch with gold thread detailing',
    },
    {
      id: 'rv-3',
      title: 'Leheriya Silk Scarf',
      description: 'Wave-dyed silk, hand-rolled hem.',
      price: 899,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg',
      altText: 'Hand-dyed Leheriya wave-pattern silk scarf with rolled hem',
    },
    {
      id: 'rv-4',
      title: 'Mirror Work Tote',
      description: 'Canvas with hand-stitched mirrors.',
      price: 1899,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
      altText: 'Canvas tote bag with hand-stitched Rajasthani mirror work',
    },
  ],
  editorialImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg',
  editorialHeading: 'Where colour is a language',
  editorialBody: 'Rajasthani textiles are among the most storied in the world. From the swirling tie-dyes of Bandhani to the mirrored embroidery of Shisha work, every technique carries generations of knowledge. ElleStyle works with family workshops in Jaipur and Jodhpur to bring these living traditions to modern wardrobes.',
  reviews: [
    {
      id: 'r1',
      quote: 'The mirror work tote is an absolute showstopper. Got it for my sister\'s wedding and she loved it.',
      userName: 'Kavitha R.',
      userLocation: 'JAIPUR, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg',
      badge: 'RAJASTHANI',
    },
    {
      id: 'r2',
      quote: 'So vibrant, so beautifully made. You can feel the heritage in every stitch.',
      userName: 'Fatima A.',
      userLocation: 'ABU DHABI, AE',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
      badge: 'RAJASTHANI',
    },
    {
      id: 'r3',
      quote: 'The Bandhani potli is the prettiest thing I own. Worth every rupee.',
      userName: 'Shreya B.',
      userLocation: 'KOLKATA, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg',
      badge: 'RAJASTHANI',
    },
  ],
};

// ============================================================
// WEDDING GIVEAWAYS
// ============================================================
const weddingGiveaway: CategoryTheme = {
  slug: 'wedding-giveaway',
  themeKey: 'wedding',
  displayName: 'Wedding Giveaways',
  eyebrow: 'WEDDING GIVEAWAYS',
  heroHeading: 'Love, wrapped',
  heroHeadingItalic: 'with intention.',
  heroDescription: 'Thoughtful, beautifully packaged gifts that carry the warmth of your celebration into every guest\'s home.',
  heroImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
  filterTabs: [
    { id: 'all', label: 'ALL' },
    { id: 'candles', label: 'CANDLES' },
    { id: 'hampers', label: 'HAMPERS' },
    { id: 'personalised', label: 'PERSONALISED' },
    { id: 'bulk', label: 'BULK ORDERS' },
  ],
  products: [
    {
      id: 'wg-1',
      title: 'Miniature Candle Set',
      description: 'Set of 4 soy candles, gift-boxed.',
      price: 999,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      altText: 'Set of four handpoured soy wedding favour candles in gift box',
    },
    {
      id: 'wg-2',
      title: 'Potli Favour Bag',
      description: 'Embroidered silk with name tag.',
      price: 349,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
      altText: 'Embroidered silk wedding favour potli bag with personalised name tag',
    },
    {
      id: 'wg-3',
      title: 'Incense & Holder Gift Set',
      description: 'Natural incense sticks + brass holder.',
      price: 699,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      altText: 'Natural incense sticks and brass holder wedding favour gift set',
    },
    {
      id: 'wg-4',
      title: 'Personalised Token Box',
      description: 'Engraved wooden box + your message.',
      price: 1299,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
      altText: 'Personalised engraved wooden wedding token box with custom message',
    },
  ],
  editorialImage: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
  editorialHeading: 'Every guest deserves a memory',
  editorialBody: 'A wedding giveaway is more than a favour — it\'s a thank-you, a memory, a piece of the day that travels home with every guest. ElleStyle\'s curated gifts are designed to be kept, not discarded: beautifully packaged, thoughtfully made, and unique to your celebration.',
  reviews: [
    {
      id: 'r1',
      quote: 'Ordered 150 potli bags for our wedding. Every single one was perfect. Guests were so moved.',
      userName: 'Ritika & Arjun',
      userLocation: 'UDAIPUR, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      badge: 'WEDDING',
    },
    {
      id: 'r2',
      quote: 'The packaging was stunning. Three months later guests are still mentioning the candles.',
      userName: 'Nidhi & Vikram',
      userLocation: 'MUMBAI, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
      badge: 'WEDDING',
    },
    {
      id: 'r3',
      quote: 'Quick custom order, no hassle, beautiful result. Highly recommend for bulk wedding orders.',
      userName: 'Zara & Faisal',
      userLocation: 'HYDERABAD, IN',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
      badge: 'WEDDING',
    },
  ],
};

// ============================================================
// EXPORT MAP — keyed by URL slug
// ============================================================
export const CATEGORY_THEMES: Record<CategorySlug, CategoryTheme> = {
  'macrame-bags': macrameBags,
  'handmade-candles': handmadeCandles,
  'handmade-earrings': handmadeEarrings,
  'rajasthani-vibes': rajasthaniVibes,
  'wedding-giveaway': weddingGiveaway,
};
