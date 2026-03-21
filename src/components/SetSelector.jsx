import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { fetchSets } from '../lib/tcgdex';

export default function SetSelector({ onConfirm, onCancel }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadSets() {
      const data = await fetchSets();
      
      // Sort sets recursively or just by release date descending
      // TCGdex provides releaseDate natively for sets. Let's try handling it if exists
      const sorted = data.sort((a, b) => {
         if (a.releaseDate && b.releaseDate) {
            return new Date(b.releaseDate) - new Date(a.releaseDate);
         }
         return a.name.localeCompare(b.name);
      });
      
      setSets(sorted);
      setLoading(false);
    }
    loadSets();
  }, []);

  const toggleSet = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(setId => setId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredSets = sets.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col items-center w-full min-h-[60vh] gap-6 relative">
      <button 
        onClick={onCancel} 
        className="absolute top-0 left-0 sm:-left-4 md:-left-12 flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-white/5"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:block font-semibold">Back</span>
      </button>

      <div className="text-center mb-4">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Select Sets</h2>
        <p className="text-gray-400">Choose the expansions you want to pull cards from.</p>
      </div>

      <div className="flex w-full max-w-2xl px-4 gap-4 items-center mb-2">
         <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
               type="text" 
               placeholder="Search explicitly by set name..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-12 pr-6 text-white outline-none focus:border-blue-400 transition-colors"
            />
         </div>
         <button 
            onClick={() => onConfirm(selectedIds)}
            disabled={selectedIds.length === 0}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 font-bold rounded-full transition-colors flex items-center gap-2"
         >
            <Check size={20} /> Start Game
         </button>
      </div>

      <div className="glass-panel w-full max-w-4xl p-6 rounded-2xl h-[60vh] overflow-y-auto custom-scrollbar">
        {loading ? (
           <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400 font-bold">
              Loading available sets...
           </div>
        ) : (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {filteredSets.map(set => {
                const isSelected = selectedIds.includes(set.id);
                return (
                   <button
                     key={set.id}
                     onClick={() => toggleSet(set.id)}
                     className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 overflow-hidden min-h-[100px] gap-2 ${isSelected ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                   >
                     {set.logo ? (
                        <img src={`${set.logo}.png`} alt={set.name} className="h-10 object-contain drop-shadow-lg" />
                     ) : (
                        <div className="text-2xl opacity-50">🎴</div>
                     )}
                     <span className="text-xs font-semibold text-center line-clamp-2 px-1">{set.name}</span>
                     
                     {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                           <Check size={12} className="text-white" />
                        </div>
                     )}
                   </button>
                );
             })}
           </div>
        )}
      </div>
    </div>
  );
}
