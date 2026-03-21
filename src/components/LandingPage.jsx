import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { Star, Swords } from 'lucide-react';

export default function LandingPage() {
  const { cardList, rareCardList, loading } = useCards();
  const [displayCards, setDisplayCards] = useState([]);

  useEffect(() => {
    if (cardList.length > 0 && rareCardList.length > 0) {
      // 150 normal cards + 150 rare cards to make 300
      const standard = cardList.slice(0, 150);
      const rare = rareCardList.slice(0, 150);
      const combined = [...standard, ...rare];
      
      // Shuffle array so it's a random mix & starting point each time
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }
      
      setDisplayCards(combined);
    }
  }, [cardList, rareCardList]);

  const RowCards = ({ cards, reverse }) => {
    if (!cards || cards.length === 0) return null;
    return (
      <div className={`flex w-max gap-4 py-2 hover:[animation-play-state:paused] ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`}>
        {[...cards, ...cards].map((c, i) => (
          <img 
            key={`${c.id}-${i}`} 
            src={`${c.image}/high.webp`} 
            alt={c.name}
            loading="lazy"
            className="h-32 sm:h-48 md:h-64 aspect-[2.5/3.5] object-contain rounded-xl shadow-2xl border border-white/10 opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300 pointer-events-auto" 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-pokemon-dark/30">
      {/* Background Marquee Walls */}
      <div className="absolute inset-0 z-0 flex flex-col justify-center gap-4 opacity-30 pointer-events-none transform -rotate-6 scale-125">
        {!loading && displayCards.length > 200 ? (
          <>
            <RowCards cards={displayCards.slice(0, 100)} />
            <RowCards cards={displayCards.slice(100, 200)} reverse />
            <RowCards cards={displayCards.slice(200, 300)} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4 rotate-6">
               <div className="w-16 h-16 border-4 border-pokemon-red border-t-white rounded-full animate-spin"></div>
               <p className="text-gray-500 font-bold">Unpacking booster boxes...</p>
            </div>
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 bg-pokemon-darker/40 backdrop-blur-sm p-6 md:p-8 rounded-3xl max-w-xl w-[90%] text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg leading-tight lg:leading-tight">
          Pokémon Card Rater
        </h1>
        <p className="text-base md:text-lg text-gray-300 mb-8 font-medium px-4">
          The ultimate FaceMash-style ranking platform for Pokémon TCG.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/rate" 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pokemon-gold to-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(240,192,16,0.5)] transition-all duration-300"
          >
            <Star size={24} />
            Start Rating
          </Link>
          <Link 
            to="/versus" 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pokemon-red to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(238,21,21,0.5)] transition-all duration-300"
          >
            <Swords size={24} />
            Versus Mode
          </Link>
        </div>
      </div>
    </div>
  );
}
