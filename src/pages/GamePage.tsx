import {
  Activity,
  Dices,
  LogOut,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Dice3D } from '../components/LudoBoard/Dice3D';
import { GameChat } from '../components/LudoBoard/GameChat';
import { LudoBoard } from '../components/LudoBoard/LudoBoard';
import { PlayerCard } from '../components/LudoBoard/PlayerCard';
import { VictoryModal } from '../components/LudoBoard/VictoryModal';
import { COLOR_THEMES } from '../components/LudoBoard/boardCoords';
import { socketService } from '../services/socket';
import { useAuth } from '../store/AuthContext';
import { useGame } from '../store/GameContext';

export const GamePage: React.FC = () => {
  const { user } = useAuth();
  const {
    gameState,
    currentRoomId,
    rollDice,
    moveToken,
    sendChatMessage,
    leaveGame,
    isLocalMode,
    isRolling,
    setActiveTab,
  } = useGame();

  // Spacebar to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target === document.body || (e.target as HTMLElement)?.tagName === 'BUTTON')) {
        e.preventDefault();
        rollDice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rollDice]);

  if (!gameState) {
    return (
      <div className="max-w-md mx-auto py-24 text-center text-slate-400">
        <p className="text-sm">No active game session found.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/30 cursor-pointer"
        >
          Return to Arena
        </button>
      </div>
    );
  }

  const socket = socketService.getSocket();
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn =
    isLocalMode ||
    (activePlayer && (activePlayer.id === socket.id || (user && activePlayer.userId === user.id)));

  const canRoll = isMyTurn && !gameState.hasRolled && !isRolling && !activePlayer?.isAi;

  const handleSurrender = () => {
    if (window.confirm('Are you sure you want to leave and forfeit this match?')) {
      leaveGame();
    }
  };

  const handlePlayAgain = () => {
    setActiveTab('home');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Header Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                {gameState.gameMode} Arena Match
              </span>
              {currentRoomId && (
                <span className="text-[10px] bg-slate-800 text-indigo-400 border border-slate-700 px-2 py-0.5 rounded-md font-mono font-bold tracking-widest">
                  {currentRoomId}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Turn {gameState.totalTurns + 1}</span>
          </div>
        </div>

        {/* Center Current Turn Status Indicator */}
        <div className="flex items-center gap-2">
          {activePlayer && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
              <div
                className={`w-2.5 h-2.5 rounded-full ${COLOR_THEMES[activePlayer.color].bg} animate-pulse`}
              />
              <span className="text-xs font-bold text-slate-200">
                {isMyTurn ? "Your Turn!" : `${activePlayer.username}'s Turn`}
              </span>
            </div>
          )}
        </div>

        {/* Leave Match Button */}
        <button
          onClick={handleSurrender}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Leave Match</span>
        </button>
      </div>

      {/* Main 3-Column Layout: Left (Players & Activity), Center (Ludo Board), Right (Dice & Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Player Cards & Recent Activity */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Players Container */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-lg">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Players ({gameState.players.length})
            </span>

            <div className="flex flex-col gap-2">
              {gameState.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentTurn={activePlayer?.color === player.color}
                  turnStartedAt={gameState.turnStartedAt}
                  turnDuration={gameState.turnDuration}
                  isLocal={isLocalMode}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Recent Activity
            </span>

            <div className="text-[11px] space-y-2 text-slate-400 px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>
                  {activePlayer?.username} {gameState.hasRolled ? `rolled a ${gameState.diceValue}` : 'is rolling...'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span>Turn timer set to {gameState.turnDuration || 30}s</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span>Game mode: {gameState.gameMode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: 15x15 Ludo Board */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[560px] bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl p-1 sm:p-2">
            <LudoBoard
              gameState={gameState}
              onTokenClick={moveToken}
              currentPlayerId={socket.id}
              isLocalMode={isLocalMode}
            />
          </div>
        </div>

        {/* Right Column: Dice Roller Command Box & Live Chat */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Indigo Dice Command Box */}
          <div className="bg-indigo-600 rounded-2xl p-5 sm:p-6 shadow-xl shadow-indigo-950/40 flex flex-col items-center justify-center gap-3 border border-indigo-400/30">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
              Interactive Dice
            </span>

            {/* 3D Dice Face */}
            <div className="my-1">
              <Dice3D
                value={gameState.diceValue || 1}
                isRolling={isRolling}
                playerColor={activePlayer?.color || 'red'}
                onClick={canRoll ? rollDice : undefined}
                disabled={!canRoll}
              />
            </div>

            {/* Action State Button or Status */}
            <div className="w-full">
              {canRoll ? (
                <button
                  onClick={rollDice}
                  className="w-full bg-white text-indigo-700 hover:bg-slate-50 font-bold py-3 rounded-xl transition-all uppercase text-xs tracking-wider shadow-lg hover:shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Roll Dice (Space)
                </button>
              ) : gameState.hasRolled && isMyTurn ? (
                <div className="p-2.5 rounded-xl bg-indigo-700/80 border border-indigo-400/40 text-white text-xs font-bold text-center animate-pulse">
                  {gameState.validTokenMoves.length > 0
                    ? `Rolled a ${gameState.diceValue}! Select a token to move`
                    : `Rolled a ${gameState.diceValue}. No valid moves!`}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-indigo-700/60 text-indigo-200 text-xs font-medium text-center">
                  {activePlayer?.isAi
                    ? `${activePlayer.username} (AI) is thinking...`
                    : `Waiting for ${activePlayer?.username || 'opponent'}...`}
                </div>
              )}
            </div>

            {/* Hotkey hint */}
            <p className="text-[10px] text-indigo-100/70 text-center">
              Click or press{' '}
              <span className="bg-indigo-500 px-1.5 py-0.5 rounded border border-indigo-400 text-white font-mono">
                Space
              </span>{' '}
              to roll
            </p>
          </div>

          {/* In-Game Live Chat Panel */}
          <GameChat
            messages={gameState.chatMessages || []}
            onSendMessage={sendChatMessage}
            currentUserId={user?.id}
            currentUserName={user?.username || 'You'}
          />
        </div>
      </div>

      {/* Victory Celebration Modal */}
      {gameState.status === 'completed' && (
        <VictoryModal
          gameState={gameState}
          onPlayAgain={handlePlayAgain}
          onExit={() => setActiveTab('home')}
        />
      )}
    </div>
  );
};
