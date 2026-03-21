import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { supabase } from '../lib/supabase';

export default function RatingSection() {
  const { cardList, loading: loadingList, getNewRandomCard } = useCards();
  const [currentCard, setCurrentCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const loadNextCard = async () => {
    setLoadingCard(true);
    setHasRated(false);
    const card = await getNewRandomCard();
    setCurrentCard(card);
    setLoadingCard(false);
  };

  useEffect(() => {
    if (!loadingList && cardList.length > 0 && !currentCard) {
      loadNextCard();
    }
  }, [loadingList, cardList, currentCard]);

  const handleRate = async (score) => {
    if (!currentCard || hasRated) return;

    setHasRated(true);
    try {
      const { data, error } = await supabase
        .from('card_ratings')
        .select('*')
        .eq('card_id', currentCard.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const newTotal = data.total_score + score;
        const newCount = data.count + 1;
        await supabase
          .from('card_ratings')
          .update({
            total_score: newTotal,
            count: newCount,
            average_score: newTotal / newCount
          })
          .eq('card_id', currentCard.id);
      } else {
        await supabase
          .from('card_ratings')
          .insert({
            card_id: currentCard.id,
            total_score: score,
            count: 1,
            average_score: score
          });
      }

      setTimeout(() => {
        loadNextCard();
      }, 500);

    } catch (err) {
      console.error('Error recording rating:', err);
      setTimeout(() => {
        loadNextCard();
      }, 500);
    }
  };

  const isLoading = loadingList || loadingCard || !currentCard;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pokemon-gold to-yellow-200 bg-clip-text text-transparent">Rate the Card</h2>
        <p className="text-gray-400">What would you rate this card out of 10?</p>
      </div>

      <div className="relative group w-72 sm:w-80 md:w-96 aspect-[2.5/3.5] glass-panel rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(240,192,16,0.2)]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-pokemon-gold border-t-transparent animate-spin"></div>
            <p className="text-gray-400 font-semibold z-10 animate-pulse">Hunting for a wild card...</p>
          </div>
        ) : (
          <img 
            src={`${currentCard.image}/high.webp`} 
            alt={currentCard.name}
            className={`w-full h-full object-contain p-4 transition-opacity duration-300 ${hasRated ? 'opacity-50 blur-sm scale-95' : 'opacity-100 hover:scale-105'}`}
          />
        )}
        
        {hasRated && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-green-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transform -rotate-12 scale-110">
                Rated!
             </div>
          </div>
        )}
      </div>

      <div className={`glass-panel p-3 rounded-full flex gap-2 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {[...Array(10)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handleRate(i + 1)}
            disabled={hasRated || isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg bg-white/5 hover:bg-pokemon-gold hover:text-black transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,16,0.5)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

