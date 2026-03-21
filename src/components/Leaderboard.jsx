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
          .limit(10);
          
        if (ratedErr) throw ratedErr;

        // 2. Fetch Top Elo
        const { data: eloData, error: eloErr } = await supabase
          .from('card_elo')
          .select('*')
          .order('elo_score', { ascending: false })
          .limit(10);
          
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

        setTopRated(ratedWithDetails);
        setTopElo(eloWithDetails);
      } catch (err) {
        console.error("Error fetching leaderboards:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex justify-center items-center gap-3">
          <Trophy className="text-purple-400" size={36} />
          Hall of Fame
        </h2>
        <p className="text-gray-400">The most legendary cards in the community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        
        {/* Top Rated Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Star className="text-pokemon-gold fill-pokemon-gold" size={24} />
            <h3 className="text-2xl font-bold">Highest Rated</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
               <div className="text-center text-gray-400 py-8 animate-pulse">Loading ratings...</div>
            ) : topRated.length === 0 ? (
               <div className="text-center text-gray-400 py-8">No ratings yet! Be the first.</div>
            ) : (
               topRated.map((item, index) => (
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
               ))
            )}
          </div>
        </div>

        {/* Top Pit Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
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
               topElo.map((item, index) => (
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
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
