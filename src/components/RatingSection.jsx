import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function RatingSection() {
  const { cardList, rareCardList, loading: loadingList, getNewRandomCard } = useCards();
  const [mode, setMode] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const loadNextCard = async (currentMode) => {
    setLoadingCard(true);
    setHasRated(false);
    const card = await getNewRandomCard(currentMode);
    setCurrentCard(card);
    setLoadingCard(false);
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    loadNextCard(selectedMode);
  };

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
        loadNextCard(mode);
      }, 500);

    } catch (err) {
      console.error('Error recording rating:', err);
      setTimeout(() => {
        loadNextCard(mode);
      }, 500);
    }
  };

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pokemon-gold to-yellow-200 bg-clip-text text-transparent">Select Mode</h2>
          <p className="text-gray-400">Choose which types of cards you want to rate</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-12">
          <button 
            onClick={() => selectMode('all')}
            disabled={loadingList}
            className={`glass-panel group relative w-64 h-80 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-pokemon-blue shadow-[0_0_20px_rgba(30,144,255,0.1)] hover:shadow-[0_0_30px_rgba(30,144,255,0.4)] ${loadingList ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-pokemon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="w-20 h-20 rounded-full bg-pokemon-blue/20 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-pokemon-blue/30 transition-all">
              🃏
            </div>
            <h3 className="text-2xl font-bold text-white relative z-10">All Cards</h3>
            <p className="text-gray-400 text-sm text-center px-6 relative z-10">Rate any Pokémon card from the entire TCG history.</p>
            {loadingList && <span className="text-pokemon-blue text-xs font-bold animate-pulse mt-2">Loading...</span>}
          </button>

          <button 
            onClick={() => selectMode('rare')}
            disabled={loadingList}
            className={`glass-panel group relative w-64 h-80 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-pokemon-gold shadow-[0_0_20px_rgba(240,192,16,0.1)] hover:shadow-[0_0_30px_rgba(240,192,16,0.4)] ${loadingList ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-pokemon-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="w-20 h-20 rounded-full bg-pokemon-gold/20 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-pokemon-gold/30 transition-all drop-shadow-[0_0_10px_rgba(240,192,16,0.5)]">
              ✨
            </div>
            <h3 className="text-2xl font-bold text-white relative z-10">Rare Cards</h3>
            <p className="text-gray-400 text-sm text-center px-6 relative z-10">Rate only Double Rares, Ultra Rares, and Special Illustrations!</p>
            {loadingList && <span className="text-pokemon-gold text-xs font-bold animate-pulse mt-2">Loading...</span>}
          </button>
        </div>
      </div>
    );
  }

  const isLoading = loadingList || loadingCard || !currentCard;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-8 relative">
      <button 
        onClick={() => setMode(null)} 
        className="absolute top-0 left-0 sm:-left-4 md:-left-12 flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-white/5"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:block font-semibold">Back</span>
      </button>

      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pokemon-gold to-yellow-200 bg-clip-text text-transparent">
          {mode === 'rare' ? 'Rate Rare Cards' : 'Rate Cards'}
        </h2>
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

      <div className={`glass-panel p-2 sm:p-3 rounded-full flex flex-wrap justify-center gap-1 sm:gap-2 transition-opacity duration-300 max-w-full ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {[...Array(10)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handleRate(i + 1)}
            disabled={hasRated || isLoading}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full font-bold text-base sm:text-lg bg-white/5 hover:bg-pokemon-gold hover:text-black transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,16,0.5)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
