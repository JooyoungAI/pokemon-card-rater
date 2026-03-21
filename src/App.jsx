import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Star, Swords, Trophy } from 'lucide-react';
import RatingSection from './components/RatingSection';
import PitSection from './components/PitSection';
import Leaderboard from './components/Leaderboard';

const NavLink = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-pokemon-blue text-white shadow-[0_0_15px_rgba(30,144,255,0.5)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold hidden sm:block">{label}</span>
    </Link>
  );
};

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-pokemon-darker flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-20">
        <div className="absolute w-[800px] h-[800px] bg-pokemon-blue/30 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute w-[600px] h-[600px] bg-pokemon-red/20 rounded-full blur-[100px] mix-blend-screen translate-x-1/2 -translate-y-1/4" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(238,21,21,0.4)] overflow-hidden border border-white/20">
              <img src="https://assets.tcgdex.net/en/me/me02.5/276/high.webp" alt="Pikachu SIR Logo" className="w-full h-full object-cover object-[center_20%]" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden md:block">
              Pokémon Card Rater
            </h1>
          </div>
          
          <div className="flex gap-2">
            <NavLink to="/" icon={Star} label="Rate" isActive={location.pathname === '/'} />
            <NavLink to="/pit" icon={Swords} label="Versus Mode" isActive={location.pathname === '/pit'} />
            <NavLink to="/leaderboard" icon={Trophy} label="Top Cards" isActive={location.pathname === '/leaderboard'} />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-6 pt-28 pb-12 z-10 flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<RatingSection />} />
          <Route path="/pit" element={<PitSection />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App;
