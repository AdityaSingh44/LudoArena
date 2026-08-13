import {
  BookOpen,
  Dices,
  History,
  LogIn,
  LogOut,
  Sparkles,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useGame } from '../store/GameContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenRules }) => {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, soundEnabled, toggleSound, currentRoomId, leaveGame } = useGame();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800 bg-[#0f172a] shadow-2xl">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            if (activeTab === 'game' && currentRoomId) {
              if (window.confirm('Leave active game match?')) {
                leaveGame();
              }
            } else {
              setActiveTab('home');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
            LA
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              Ludo<span className="text-indigo-400">Arena</span>
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-0.5">
              Online Multiplayer
            </span>
          </div>
        </div>

        {/* Center Nav Links (Hidden on small mobile) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home' || activeTab === 'lobby' || activeTab === 'game'
                ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Play Arena
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            History
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Rules
          </button>
        </nav>

        {/* Right Section: Room Code Pill (if any), Sound, and User Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Active Room Code display if playing */}
          {currentRoomId && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Room Code
              </span>
              <span className="text-indigo-400 font-mono font-bold text-sm tracking-wider">
                {currentRoomId}
              </span>
            </div>
          )}

          {currentRoomId && <div className="hidden sm:block h-8 w-[1px] bg-slate-800" />}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1 pl-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-100 leading-tight">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end font-medium leading-tight mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold text-slate-100 shadow-md">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] rounded-2xl p-2 shadow-2xl border border-slate-800 z-50 animate-fadeIn">
                  <div className="p-3 border-b border-slate-800 mb-1">
                    <span className="text-xs font-bold text-slate-100 block">{user.username}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{user.email}</span>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Rating</span>
                      <span className="text-indigo-400 font-bold">{user.totalScore} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 text-left transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    My Profile & Stats
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 text-left transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    Match History
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 text-left transition-colors cursor-pointer mt-1 border-t border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
