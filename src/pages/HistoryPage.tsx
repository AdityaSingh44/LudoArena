import {
  Calendar,
  Clock,
  Crown,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { COLOR_THEMES } from '../components/LudoBoard/boardCoords';
import { api } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { GameHistoryItem } from '../types/game';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGameHistory(30);
      setHistory(data);
    } catch (err) {
      console.warn('Error fetching match history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const filteredHistory = history.filter((item) => {
    if (filterMode === 'all') return true;
    return item.gameMode === filterMode;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            Arena Match Archives
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Match History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review recent battle results, player rosters, and turn analytics.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['all', 'online', 'ai', 'local'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filterMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-300">
              No Matches Found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Completed matches will automatically be recorded here.
            </p>
          </div>
        ) : (
          filteredHistory.map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">
                      {game.winner} Won the Match
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
                      {game.gameMode}
                    </span>
                  </div>

                  {/* Players list */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <span className="font-medium text-slate-500">Players:</span>
                    {game.players.map((p) => {
                      const theme = COLOR_THEMES[p.color];
                      const isWinner = p.username === game.winner;

                      return (
                        <span
                          key={p.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            isWinner
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold'
                              : 'bg-slate-800/80 border border-slate-700/60 text-slate-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.bg}`} />
                          {p.username}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Match Stats (Duration & Date) */}
              <div className="flex items-center gap-4 text-right self-end sm:self-center text-xs text-slate-400">
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <RotateCcw className="w-3 h-3 text-indigo-400" />
                    {game.totalTurns} Turns
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {Math.floor(game.duration / 60)}m {game.duration % 60}s
                  </span>
                </div>

                <div className="flex flex-col items-end border-l border-slate-800 pl-4">
                  <span className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {new Date(game.completedAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(game.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
