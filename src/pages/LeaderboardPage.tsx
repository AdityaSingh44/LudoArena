import {
  Award,
  Crown,
  Flame,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserStats } from '../types/game';

export const LeaderboardPage: React.FC = () => {
  const [leaders, setLeaders] = useState<UserStats[]>([]);
  const [filter, setFilter] = useState<'score' | 'wins' | 'winrate'>('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLeaderboard(50);
      setLeaders(data);
    } catch (err) {
      console.warn('Error fetching full leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const sortedLeaders = [...leaders].sort((a, b) => {
    if (filter === 'score') return b.totalScore - a.totalScore;
    if (filter === 'wins') return b.gamesWon - a.gamesWon;
    if (filter === 'winrate') return b.winPercentage - a.winPercentage;
    return 0;
  });

  const filteredLeaders = sortedLeaders.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = sortedLeaders[0];
  const top2 = sortedLeaders[1];
  const top3 = sortedLeaders[2];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5" />
          Hall of Champions
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Global Leaderboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Rankings update dynamically after every completed arena match and tournament.
        </p>
      </div>

      {/* Podium Cards for Top 3 */}
      {leaders.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-8">
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-center relative order-2 md:order-1 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center mb-3 shadow">
                #2
              </div>
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center mb-3 shadow-inner border border-slate-700">
                {top2.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-sm text-white mb-1">
                {top2.username}
              </h3>
              <span className="text-xs font-bold text-indigo-400 block mb-2">
                {top2.totalScore} Score
              </span>
              <span className="text-[11px] text-slate-400">
                {top2.gamesWon} wins ({top2.winPercentage}%)
              </span>
            </div>
          )}

          {/* 1st Place (Gold Podium - Elevated) */}
          {top1 && (
            <div className="p-8 rounded-2xl bg-[#0f172a] border-2 border-amber-400 shadow-2xl text-center relative order-1 md:order-2 flex flex-col items-center -mt-6">
              <Crown className="w-7 h-7 text-amber-400 absolute -top-3.5 animate-bounce" />
              <div className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center mb-3 shadow-lg">
                #1
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-2xl flex items-center justify-center mb-3 shadow-lg">
                {top1.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                {top1.username}
              </h3>
              <span className="text-sm font-bold text-amber-400 block mb-2">
                {top1.totalScore} Score
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {top1.gamesWon} wins ({top1.winPercentage}%)
              </span>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-center relative order-3 md:order-3 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center mb-3 shadow">
                #3
              </div>
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center mb-3 shadow-inner border border-slate-700">
                {top3.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-sm text-white mb-1">
                {top3.username}
              </h3>
              <span className="text-xs font-bold text-amber-500 block mb-2">
                {top3.totalScore} Score
              </span>
              <span className="text-[11px] text-slate-400">
                {top3.gamesWon} wins ({top3.winPercentage}%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search champion..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl w-full sm:w-auto border border-slate-700">
          <button
            onClick={() => setFilter('score')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'score'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Highest Rating
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'wins'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Most Wins
          </button>
          <button
            onClick={() => setFilter('winrate')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'winrate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Win Rate %
          </button>
        </div>

        <button
          onClick={fetchLeaders}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700"
          title="Refresh Leaderboard"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4 text-center">Matches</th>
                <th className="py-3 px-4 text-center">Wins / Losses</th>
                <th className="py-3 px-4 text-center">Win Rate</th>
                <th className="py-3 px-4 text-right">Rating Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeaders.map((user, idx) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                            ? 'bg-slate-300 text-slate-900'
                            : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-white">
                        {user.username}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">
                    {user.gamesPlayed}
                  </td>

                  <td className="py-3.5 px-4 text-center font-medium">
                    <span className="text-emerald-400 font-bold">{user.gamesWon}W</span>
                    <span className="text-slate-600 mx-1.5">/</span>
                    <span className="text-rose-400 font-bold">{user.gamesLost}L</span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {user.winPercentage}%
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-amber-400 text-sm">
                    {user.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
