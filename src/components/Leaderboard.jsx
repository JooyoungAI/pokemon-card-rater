import React, { useState, useEffect } from 'react';
import { Trophy, Star, Swords } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCardDetails } from '../lib/tcgdex';

export default function Leaderboard() {
  const [topRated, setTopRated] = useState([]);
  const [topElo, setTopElo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      try {
        // 1. Fetch Top Rated (highest average score, min 5 votes to be fair)
        // Since we may not have complex queries, we'll just sort by average_score
        const { data: ratedData, error: ratedErr } = await supabase
          .from('card_ratings')
          .select('*')
          .order('average_score', { ascending: false })
          .limit(20);
          
        if (ratedErr) throw ratedErr;

        // 2. Fetch Top Elo
        const { data: eloData, error: eloErr } = await supabase
          .from('card_elo')
          .select('*')
          .order('elo_score', { ascending: false })
          .limit(20);
          
        if (eloErr) throw eloErr;

        // 3. Hydrate with TCGdex data
        const hydrateCards = async (items) => {
           if (!items) return [];
           const hydrated = await Promise.all(items.map(async (item) => {
              const details = await getCardDetails(item.card_id);
              return { ...item, details };
           }));
           return hydrated.filter(item => item.details);
        };

        const ratedWithDetails = await hydrateCards(ratedData);
        const eloWithDetails = await hydrateCards(eloData);

        // Slice up to exactly 10 cards, buffering against any dropped or test cards
        setTopRated(ratedWithDetails.slice(0, 10));
        setTopElo(eloWithDetails.slice(0, 10));
      } catch (err) {
        console.error("Error fetching leaderboards:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, []);

  const Podium = ({ items, type }) => {
    if (!items || items.length < 3) return null;
    const getScore = (item) => type === 'rating' ? (item.average_score?.toFixed(1) || '0.0') : item.elo_score;
    const getScoreColor = () => type === 'rating' ? 'text-pokemon-gold' : 'text-pokemon-red';

    return (
      <div className="flex items-end justify-center gap-2 sm:gap-4 mt-12 mb-8 px-2">
        {/* 2nd Place - Silver */}
        <div className="flex flex-col items-center w-1/3 max-w-[120px] animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-xl font-bold text-gray-300 mb-2">2nd</div>
          <img src={`${items[1].details.image}/high.webp`} className="w-full aspect-[2.5/3.5] bg-pokemon-darker border border-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform object-contain" alt={items[1].details.name} />
          <div className={`mt-2 font-black text-xl sm:text-2xl ${getScoreColor()}`}>{getScore(items[1])}</div>
          <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg mt-2 flex justify-center border-t-4 border-gray-300"></div>
        </div>

        {/* 1st Place - Gold */}
        <div className="flex flex-col items-center z-10 w-[40%] max-w-[150px] animate-fade-in-up">
          <div className="text-2xl sm:text-3xl font-black text-yellow-400 mb-2 drop-shadow-md">🏆 1st</div>
          <img src={`${items[0].details.image}/high.webp`} className="w-full aspect-[2.5/3.5] bg-pokemon-darker border border-white/10 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:scale-110 transition-transform ring-4 ring-yellow-400/50 object-contain mx-auto" alt={items[0].details.name} />
          <div className={`mt-2 font-black text-2xl sm:text-3xl ${getScoreColor()}`}>{getScore(items[0])}</div>
          <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-yellow-700 to-yellow-500 rounded-t-lg mt-2 flex justify-center border-t-4 border-yellow-300"></div>
        </div>

        {/* 3rd Place - Bronze */}
        <div className="flex flex-col items-center w-1/3 max-w-[110px] animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="text-lg font-bold text-orange-400 mb-2">3rd</div>
          <img src={`${items[2].details.image}/high.webp`} className="w-full aspect-[2.5/3.5] bg-pokemon-darker border border-white/10 rounded-xl shadow-[0_0_15px_rgba(251,146,60,0.2)] hover:scale-105 transition-transform object-contain" alt={items[2].details.name} />
          <div className={`mt-2 font-black text-lg sm:text-xl ${getScoreColor()}`}>{getScore(items[2])}</div>
          <div className="w-full h-12 sm:h-16 bg-gradient-to-t from-orange-800 to-orange-600 rounded-t-lg mt-2 flex justify-center border-t-4 border-orange-400"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex justify-center items-center gap-3">
          <Trophy className="text-purple-400" size={36} />
          Hall of Fame
        </h2>
        <p className="text-gray-400">The most legendary cards in the community</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
        
        {/* Top Rated Panel */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Star className="text-pokemon-gold fill-pokemon-gold" size={24} />
            <h3 className="text-2xl font-bold border-b-2 border-transparent">Highest Rated</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
               <div className="text-center text-gray-400 py-8 animate-pulse">Loading ratings...</div>
            ) : topRated.length === 0 ? (
               <div className="text-center text-gray-400 py-8">No ratings yet! Be the first.</div>
            ) : (
               <>
                 <Podium items={topRated} type="rating" />
                 {topRated.slice(topRated.length >= 3 ? 3 : 0).map((item, i) => {
                    const index = topRated.length >= 3 ? i + 3 : i;
                    return (
                      <div key={item.card_id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="font-black text-xl text-gray-500 w-6">{index + 1}</div>
                        <img 
                          src={`${item.details.image}/low.webp`} 
                          alt={item.details.name}
                          className="w-12 h-16 object-contain rounded-md shrink-0 border border-white/10 bg-pokemon-darker"
                        />
                        <div className="flex-grow">
                           <p className="font-bold line-clamp-1">{item.details.name}</p>
                           <p className="text-sm text-gray-400">{item.count} Votes</p>
                        </div>
                        <div className="font-black text-pokemon-gold text-lg">
                          {item.average_score?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                    )
                 })}
               </>
            )}
          </div>
        </div>

        {/* Top Pit Panel */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Swords className="text-pokemon-red" size={24} />
            <h3 className="text-2xl font-bold">Top Fighters</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
               <div className="text-center text-gray-400 py-8 animate-pulse">Loading battles...</div>
            ) : topElo.length === 0 ? (
               <div className="text-center text-gray-400 py-8">No battles yet! Start a fight.</div>
            ) : (
               <>
                 <Podium items={topElo} type="elo" />
                 {topElo.slice(topElo.length >= 3 ? 3 : 0).map((item, i) => {
                    const index = topElo.length >= 3 ? i + 3 : i;
                    return (
                      <div key={item.card_id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="font-black text-xl text-gray-500 w-6">{index + 1}</div>
                        <img 
                          src={`${item.details.image}/low.webp`} 
                          alt={item.details.name}
                          className="w-12 h-16 object-contain rounded-md shrink-0 border border-white/10 bg-pokemon-darker"
                        />
                        <div className="flex-grow">
                           <p className="font-bold line-clamp-1">{item.details.name}</p>
                           <p className="text-sm text-gray-400">Elo Ranking</p>
                        </div>
                        <div className="font-black text-pokemon-red text-lg">
                          {item.elo_score}
                        </div>
                      </div>
                    )
                 })}
               </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
