import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { supabase } from '../lib/supabase';
import { calculateElo } from '../utils/elo';
import { ArrowLeft } from 'lucide-react';

export default function PitSection() {
  const { cardList, rareCardList, loading: loadingList, getNewRandomCard } = useCards();
  const [mode, setMode] = useState(null);
  const [cardA, setCardA] = useState(null);
  const [cardB, setCardB] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadMatchup = async (currentMode) => {
    setLoadingCards(true);
    
    // Fetch two different cards
    let c1 = await getNewRandomCard(currentMode);
    let c2 = await getNewRandomCard(currentMode);
    
    // Ensure they are not the same
    while (c1 && c2 && c1.id === c2.id) {
       c2 = await getNewRandomCard(currentMode);
    }
    
    setCardA(c1);
    setCardB(c2);
    setLoadingCards(false);
    setIsProcessing(false);
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    loadMatchup(selectedMode);
  };

  const handleVote = async (winner) => {
    if (!cardA || !cardB || isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Fetch current Elo for both cards (default 1200)
      const fetchElo = async (id) => {
        const { data, error } = await supabase
          .from('card_elo')
          .select('elo_score')
          .eq('card_id', id)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        return data ? data.elo_score : 1200;
      };

      const ratingA = await fetchElo(cardA.id);
      const ratingB = await fetchElo(cardB.id);

      // 2. Calculate new Elos
      const aWon = winner === 'A';
      const { newRatingA, newRatingB } = calculateElo(ratingA, ratingB, aWon);

      // 3. Update or Insert Card A
      await supabase.from('card_elo').upsert({
        card_id: cardA.id,
        elo_score: newRatingA
      }, { onConflict: 'card_id' });

      // 4. Update or Insert Card B
      await supabase.from('card_elo').upsert({
        card_id: cardB.id,
        elo_score: newRatingB
      }, { onConflict: 'card_id' });

    } catch (err) {
      console.error('Error updating elo:', err);
    }
    
    // Load next matchup
    loadMatchup(mode);
  };

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pokemon-red to-orange-400 bg-clip-text text-transparent">Versus Mode</h2>
          <p className="text-gray-400">Choose which types of cards will battle!</p>
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
            <p className="text-gray-400 text-sm text-center px-6 relative z-10">Pit any Pokémon from the entire TCG history against each other.</p>
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
            <p className="text-gray-400 text-sm text-center px-6 relative z-10">Let only Double Rares, Ultra Rares, and Special Illustrations face off!</p>
            {loadingList && <span className="text-pokemon-gold text-xs font-bold animate-pulse mt-2">Loading...</span>}
          </button>
        </div>
      </div>
    );
  }

  const isLoading = loadingList || loadingCards || !cardA || !cardB;

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
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pokemon-red to-orange-400 bg-clip-text text-transparent">
          {mode === 'rare' ? 'Rare Versus Mode' : 'Versus Mode'}
        </h2>
        <p className="text-gray-400">Choose the better card</p>
      </div>

      <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 w-full mt-8 relative px-2 sm:px-4">
        
        {isLoading ? (
          <div className="w-full h-40 sm:h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pokemon-red"></div>
          </div>
        ) : (
          <>
            {/* Card A */}
            <button 
              onClick={() => handleVote('A')}
              disabled={isProcessing}
              className={`relative group w-40 sm:w-60 md:w-72 lg:w-80 aspect-[2.5/3.5] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(30,144,255,0.4)] border-2 border-transparent hover:border-pokemon-blue ${isProcessing ? 'opacity-50 blur-sm pointer-events-none' : ''}`}
            >
              <div className="absolute inset-0 bg-pokemon-dark/80 backdrop-blur-md"></div>
              <img 
                src={`${cardA?.image}/high.webp`} 
                alt={cardA?.name || 'Card A'}
                className="w-full h-full object-contain p-4 relative z-10 hover:scale-110 transition-transform duration-500"
              />
            </button>

            {/* VS Badge */}
            <div className={`glass-panel w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center z-10 shrink-0 shadow-[0_0_20px_rgba(238,21,21,0.5)] bg-pokemon-darker transition-opacity ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
              <span className="font-black italic text-pokemon-red text-lg sm:text-2xl">VS</span>
            </div>

            {/* Card B */}
            <button 
              onClick={() => handleVote('B')}
              disabled={isProcessing}
              className={`relative group w-40 sm:w-60 md:w-72 lg:w-80 aspect-[2.5/3.5] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(240,192,16,0.4)] border-2 border-transparent hover:border-pokemon-gold ${isProcessing ? 'opacity-50 blur-sm pointer-events-none' : ''}`}
            >
              <div className="absolute inset-0 bg-pokemon-dark/80 backdrop-blur-md"></div>
              <img 
                src={`${cardB?.image}/high.webp`} 
                alt={cardB?.name || 'Card B'}
                className="w-full h-full object-contain p-4 relative z-10 hover:scale-110 transition-transform duration-500"
              />
            </button>
          </>
        )}

      </div>
    </div>
  );
}
