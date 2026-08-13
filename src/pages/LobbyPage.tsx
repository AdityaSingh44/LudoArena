import {
  CheckCircle2,
  Clock,
  Copy,
  LogOut,
  Play,
  Share2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { GameChat } from '../components/LudoBoard/GameChat';
import { COLOR_THEMES } from '../components/LudoBoard/boardCoords';
import { socketService } from '../services/socket';
import { useAuth } from '../store/AuthContext';
import { useGame } from '../store/GameContext';
import { PlayerColor } from '../types/game';

export const LobbyPage: React.FC = () => {
  const { user } = useAuth();
  const { gameState, currentRoomId, toggleReady, startGame, leaveGame, sendChatMessage } = useGame();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!gameState || !currentRoomId) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <p className="text-sm text-slate-400">Loading arena lobby...</p>
      </div>
    );
  }

  const socket = socketService.getSocket();
  const myPlayer = gameState.players.find((p) => p.id === socket.id || (user && p.userId === user.id));
  const isHost = gameState.players[0]?.id === socket.id;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${currentRoomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const canStart = isHost && gameState.players.length >= 2;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner with Room Code */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            Arena Multiplayer Lobby
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Room Code: <span className="text-indigo-400 font-mono">{currentRoomId}</span></h2>
          <p className="text-xs text-slate-400 mt-1">
            Share this code or invite link with players to join your battle
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-700 text-slate-200 shadow-sm"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            {copied ? 'Code Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-900/30"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Players Grid & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color, idx) => {
              const theme = COLOR_THEMES[color];
              const player = gameState.players.find((p) => p.color === color) || gameState.players[idx];

              return (
                <div
                  key={color}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-44 ${
                    player
                      ? 'border-slate-700 bg-slate-900/80 shadow-xl'
                      : 'border-dashed border-slate-800 bg-slate-900/30'
                  }`}
                >
                  {player ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl ${theme.bg} text-white font-bold text-lg flex items-center justify-center shadow-md`}
                          >
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {player.username}
                              </span>
                              {gameState.players[0]?.id === player.id && (
                                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className={`text-xs capitalize font-semibold ${theme.text}`}>
                              {theme.name} Team
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <span className="text-xs text-slate-400 font-medium">Status</span>
                        {player.isReady ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            Waiting
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                      <div className="w-10 h-10 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 opacity-40 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">Slot {idx + 1} Open</span>
                      <span className="text-[10px] text-slate-600">Waiting for player...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <button
              onClick={leaveGame}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              Leave Lobby
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleReady}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  myPlayer?.isReady
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                }`}
              >
                {myPlayer?.isReady ? 'Cancel Ready' : "I'm Ready"}
              </button>

              {isHost && (
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Match
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Lobby Chat */}
        <div>
          <GameChat
            messages={gameState.chatMessages || []}
            onSendMessage={sendChatMessage}
            currentUserId={user?.id}
            currentUserName={user?.username || 'You'}
          />
        </div>
      </div>
    </div>
  );
};
