import { useState, useEffect } from 'react';
import { fetchAllCards, getRandomCard, getCardDetails } from '../lib/tcgdex';

export function useCards() {
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initCards() {
      setLoading(true);
      try {
        const cachedList = localStorage.getItem('tcgCardList');
        let list = [];
        if (cachedList) {
          list = JSON.parse(cachedList);
        } else {
          list = await fetchAllCards();
          // Filter out cards without images early
          list = list.filter(c => c.image);
          localStorage.setItem('tcgCardList', JSON.stringify(list));
        }
        setCardList(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initCards();
  }, []);

  const getNewRandomCard = async () => {
    if (cardList.length === 0) return null;
    const randomCardBase = getRandomCard(cardList);
    if (!randomCardBase) return null;
    
    // Fetch full details to get the high-res image
    const fullDetails = await getCardDetails(randomCardBase.id);
    return fullDetails;
  };

  return { cardList, loading, error, getNewRandomCard };
}
