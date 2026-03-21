import { useState, useEffect } from 'react';
import { fetchAllCards, fetchRareCards, getRandomCard, getCardDetails } from '../lib/tcgdex';

export function useCards() {
  const [cardList, setCardList] = useState([]);
  const [rareCardList, setRareCardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initCards() {
      setLoading(true);
      try {
        const cachedList = localStorage.getItem('tcgCardList_v2');
        const cachedRareList = localStorage.getItem('tcgRareCardList_v2');
        
        // Load standard cards
        let list = [];
        if (cachedList) {
          list = JSON.parse(cachedList);
        } else {
          list = await fetchAllCards();
          list = list.filter(c => c.image);
          localStorage.setItem('tcgCardList_v2', JSON.stringify(list));
        }
        setCardList(list);

        // Load rare cards
        let rList = [];
        if (cachedRareList) {
          rList = JSON.parse(cachedRareList);
        } else {
          rList = await fetchRareCards();
          rList = rList.filter(c => c.image);
          localStorage.setItem('tcgRareCardList_v2', JSON.stringify(rList));
        }
        setRareCardList(rList);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initCards();
  }, []);

  const getNewRandomCard = async (mode = 'all') => {
    const activeList = mode === 'rare' ? rareCardList : cardList;
    if (activeList.length === 0) return null;
    
    const randomCardBase = getRandomCard(activeList);
    if (!randomCardBase) return null;
    
    // Fetch full details to get the high-res image
    const fullDetails = await getCardDetails(randomCardBase.id);
    return fullDetails;
  };

  return { cardList, rareCardList, loading, error, getNewRandomCard };
}
