import React from 'react';
import { Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { Star, Swords } from 'lucide-react';

export default function LandingPage() {
  const { cardList, loading } = useCards();

  const RowCards = ({ cards, reverse }) => {
    if (!cards || cards.length === 0) return null;
    return (
      <div className={`flex w-max gap-4 py-2 ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`}>
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
      <div className="absolute inset-0 z-0 flex flex-col justify-center gap-4 opacity-40 pointer-events-none transform -rotate-6 scale-125">
        {!loading && cardList.length > 30 ? (
          <>
            <RowCards cards={cardList.slice(0, 15)} />
            <RowCards cards={cardList.slice(15, 30)} reverse />
            <RowCards cards={cardList.slice(30, 45)} />
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
      <div className="relative z-10 glass-panel p-8 md:p-12 rounded-3xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border-white/20 backdrop-blur-xl">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
          Pokémon Card Rater
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 font-medium">
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
