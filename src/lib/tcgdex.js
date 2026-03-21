const API_BASE = 'https://api.tcgdex.net/v2/en';

/**
 * Fetches the basic list of all cards (id, name, image).
 * This endpoint can be used to cache available cards to pick randomly from.
 */
export async function fetchAllCards() {
  try {
    const res = await fetch(`${API_BASE}/cards`);
    if (!res.ok) throw new Error('Failed to fetch cards');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return [];
  }
}

/**
 * Fetches cards strictly matching high-tier rarities to compose a 'Rare Cards' list
 */
export async function fetchRareCards() {
  const targetRarities = [
    'Double rare',
    'Ultra Rare',
    'Illustration rare',
    'Special illustration rare',
    'Hyper rare',
    'Secret Rare'
  ];

  try {
    // Fetch all requested rarities in parallel
    const fetches = targetRarities.map(rarity => 
      fetch(`${API_BASE}/cards?rarity=${encodeURIComponent(rarity)}`).then(r => r.ok ? r.json() : [])
    );
    
    const results = await Promise.all(fetches);
    
    // Flatten the results into a single array
    const combinedCards = results.flat();
    
    // Remove potential duplicates by id
    const uniqueCards = Array.from(new Map(combinedCards.map(c => [c.id, c])).values());
    
    return uniqueCards;
  } catch (error) {
    console.error('Error fetching rare cards:', error);
    return [];
  }
}

/**
 * Fetches detailed info about a specific card (including high res image URLs).
 */
export async function getCardDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/cards/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch card ${id}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching card ${id}:`, error);
    return null;
  }
}

/**
 * Helper to get a random card id from a cached list of cards.
 * Use this to fetch the actual card details later.
 */
export function getRandomCard(cardList) {
  if (!cardList || cardList.length === 0) return null;
  
  // Filter cards to make sure they have an image available
  const cardsWithImages = cardList.filter(card => card.image);
  if (cardsWithImages.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * cardsWithImages.length);
  return cardsWithImages[randomIndex];
}
