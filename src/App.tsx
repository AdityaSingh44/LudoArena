/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { AiGameModal } from './components/Modals/AiGameModal';
import { AuthModal } from './components/Modals/AuthModal';
import { CreateRoomModal } from './components/Modals/CreateRoomModal';
import { JoinRoomModal } from './components/Modals/JoinRoomModal';
import { LocalGameModal } from './components/Modals/LocalGameModal';
import { RulesModal } from './components/Modals/RulesModal';
import { DashboardPage } from './pages/DashboardPage';
import { GamePage } from './pages/GamePage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LobbyPage } from './pages/LobbyPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthProvider, useAuth } from './store/AuthContext';
import { GameProvider, useGame } from './store/GameContext';
import { PlayerColor } from './types/game';

function MainApp() {
  const { user } = useAuth();
  const { activeTab, setActiveTab, createPrivateRoom, joinRoom, startAiGame, startLocalGame } = useGame();

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [joinRoomModalOpen, setJoinRoomModalOpen] = useState(false);
  const [aiGameModalOpen, setAiGameModalOpen] = useState(false);
  const [localGameModalOpen, setLocalGameModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Check URL query param for room invite link (e.g. ?room=ABCD12)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      joinRoom(roomParam.toUpperCase());
    }
  }, [joinRoom]);

  const handleCreateRoom = (preferredColor: PlayerColor) => {
    createPrivateRoom(preferredColor);
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  const handleStartAiGame = (
    playerCount: 2 | 4,
    playerColor: PlayerColor,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    startAiGame(playerCount, playerColor, difficulty);
  };

  const handleStartLocalGame = (
    players: { name: string; color: PlayerColor; avatar: string }[]
  ) => {
    startLocalGame(players);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans transition-colors selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRules={() => setRulesModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'home' && (
          user ? (
            <DashboardPage
              onOpenCreateRoom={() => setCreateRoomModalOpen(true)}
              onOpenJoinRoom={() => setJoinRoomModalOpen(true)}
              onOpenAiGame={() => setAiGameModalOpen(true)}
              onOpenLocalGame={() => setLocalGameModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          ) : (
            <LandingPage
              onOpenCreateRoom={() => setCreateRoomModalOpen(true)}
              onOpenJoinRoom={() => setJoinRoomModalOpen(true)}
              onOpenAiGame={() => setAiGameModalOpen(true)}
              onOpenLocalGame={() => setLocalGameModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenRules={() => setRulesModalOpen(true)}
            />
          )
        )}

        {activeTab === 'lobby' && <LobbyPage />}

        {activeTab === 'game' && <GamePage />}

        {activeTab === 'leaderboard' && <LeaderboardPage />}

        {activeTab === 'history' && <HistoryPage />}

        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Interactive Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <CreateRoomModal
        isOpen={createRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={joinRoomModalOpen}
        onClose={() => setJoinRoomModalOpen(false)}
        onJoin={handleJoinRoom}
      />

      <AiGameModal
        isOpen={aiGameModalOpen}
        onClose={() => setAiGameModalOpen(false)}
        onCreateAiGame={handleStartAiGame}
      />

      <LocalGameModal
        isOpen={localGameModalOpen}
        onClose={() => setLocalGameModalOpen(false)}
        onCreateLocalGame={handleStartLocalGame}
      />

      <RulesModal isOpen={rulesModalOpen} onClose={() => setRulesModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainApp />
      </GameProvider>
    </AuthProvider>
  );
}
