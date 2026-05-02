/**
 * Expense Categorization Service
 *
 * Classifies expenses into: Food, Transport, Bills, Shopping, Entertainment, Other
 * Uses keyword-based matching with weighted scoring.
 * Falls back to "Other" if no confident match is found.
 */

const CATEGORIES = {
  Food: {
    keywords: [
      'pizza', 'burger', 'coffee', 'tea', 'restaurant', 'food', 'lunch',
      'dinner', 'breakfast', 'snack', 'meal', 'eat', 'grocery', 'groceries',
      'fruit', 'vegetable', 'chicken', 'rice', 'noodles', 'momo', 'dal',
      'bhat', 'curry', 'biryani', 'sandwich', 'cake', 'bakery', 'milk',
      'bread', 'egg', 'meat', 'fish', 'drink', 'juice', 'soda', 'water',
      'sweets', 'chocolate', 'ice cream', 'cafe', 'canteen', 'tiffin',
      'khaja', 'chiya', 'dine', 'order', 'zomato', 'foodmandu',
    ],
    weight: 1.0,
  },
  Transport: {
    keywords: [
      'uber', 'taxi', 'bus', 'fuel', 'petrol', 'diesel', 'gas', 'ride',
      'train', 'flight', 'ticket', 'fare', 'auto', 'rickshaw', 'metro',
      'parking', 'toll', 'travel', 'commute', 'cab', 'pathao', 'indrive',
      'vehicle', 'bike', 'car', 'scooter', 'transport', 'drive',
    ],
    weight: 1.0,
  },
  Bills: {
    keywords: [
      'bill', 'electricity', 'water', 'internet', 'wifi', 'phone',
      'mobile', 'recharge', 'rent', 'insurance', 'tax', 'emi', 'loan',
      'subscription', 'netflix', 'spotify', 'premium', 'fee', 'fees',
      'tuition', 'hospital', 'medicine', 'doctor', 'pharmacy', 'medical',
      'health', 'gym', 'membership', 'utility', 'maintenance',
    ],
    weight: 1.0,
  },
  Shopping: {
    keywords: [
      'shop', 'shopping', 'buy', 'purchase', 'amazon', 'daraz', 'online',
      'clothes', 'clothing', 'shirt', 'pants', 'shoes', 'bag', 'watch',
      'electronics', 'phone', 'laptop', 'gadget', 'accessories',
      'furniture', 'decor', 'home', 'kitchen', 'appliance', 'gift',
      'cosmetic', 'beauty', 'perfume', 'mall', 'store', 'market',
    ],
    weight: 1.0,
  },
  Entertainment: {
    keywords: [
      'movie', 'cinema', 'theatre', 'concert', 'game', 'gaming', 'party',
      'club', 'bar', 'pub', 'hangout', 'outing', 'trip', 'vacation',
      'holiday', 'picnic', 'fun', 'play', 'sport', 'music', 'show',
      'event', 'festival', 'amusement', 'park', 'zoo', 'museum',
      'bowling', 'karaoke', 'netflix', 'youtube', 'streaming',
    ],
    weight: 1.0,
  },
};

/**
 * Categorize an expense description using keyword matching
 * @param {string} description - The expense description
 * @returns {string} - The matched category
 */
function categorize(description) {
  if (!description || typeof description !== 'string') {
    return 'Other';
  }

  const lowerDesc = description.toLowerCase().trim();
  const scores = {};

  for (const [category, config] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (lowerDesc.includes(keyword)) {
        // Longer keyword matches are more specific → higher score
        score += keyword.length * config.weight;
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }

  // No matches → Other
  if (Object.keys(scores).length === 0) {
    return 'Other';
  }

  // Return the category with the highest score
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Get all valid categories
 */
function getCategories() {
  return [...Object.keys(CATEGORIES), 'Other'];
}

module.exports = { categorize, getCategories };
