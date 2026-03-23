import { useState, useEffect } from 'react';
import { fetchAllCards, fetchRareCards, fetchCardsBySets, getRandomCard, getCardDetails } from '../lib/tcgdex';

export function useCards() {
  const [cardList, setCardList] = useState([]);
  const [rareCardList, setRareCardList] = useState([]);
  const [customCardList, setCustomCardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initCards() {
      setLoading(true);
      try {
        // Clear all older versions of cache to strictly enforce maximum 5MB browser Quota limit
        Object.keys(localStorage).forEach(key => {
           if (key.startsWith('tcg') && !key.endsWith('_v3')) {
              localStorage.removeItem(key);
           }
        });

        const cachedList = localStorage.getItem('tcgCardList_v3');
        const cachedRareList = localStorage.getItem('tcgRareCardList_v3');
        
        // Load standard cards
        let list = [];
        if (cachedList) {
          list = JSON.parse(cachedList);
        } else {
          list = await fetchAllCards();
          list = list.filter(c => c.image);
          localStorage.setItem('tcgCardList_v3', JSON.stringify(list));
        }
        setCardList(list);

        // Load rare cards
        let rList = [];
        if (cachedRareList) {
          rList = JSON.parse(cachedRareList);
        } else {
          rList = await fetchRareCards();
          rList = rList.filter(c => c.image);
          localStorage.setItem('tcgRareCardList_v3', JSON.stringify(rList));
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

  const loadCustomSets = async (setIds) => {
    setCustomLoading(true);
    try {
       let cList = await fetchCardsBySets(setIds);
       cList = cList.filter(c => c.image);
       setCustomCardList(cList);
       return cList;
    } catch(err) {
       console.error("Error loading custom sets:", err);
       return [];
    } finally {
       setCustomLoading(false);
    }
  };

  const getNewRandomCard = async (mode = 'all', overridePool = null) => {
    let activeList = overridePool;
    if (!activeList) {
       activeList = cardList;
       if (mode === 'rare') activeList = rareCardList;
       if (mode === 'sets') activeList = customCardList;
    }

    if (!activeList || activeList.length === 0) {
       activeList = cardList; // fallback
    }

    let validCard = null;
    let attempts = 0;
    
    while (!validCard && attempts < 5) {
      const randomCardBase = getRandomCard(activeList);
      if (!randomCardBase) break;
      
      const fullDetails = await getCardDetails(randomCardBase.id);
      if (fullDetails && fullDetails.image) {
        validCard = fullDetails;
      }
      attempts++;
    }
    return validCard;
  };

  return { cardList, rareCardList, customCardList, loading, customLoading, error, getNewRandomCard, loadCustomSets };
}
