import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Copy, ArrowLeft, Cog } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PlayerBubbles } from './PlayerBubbles';
import { toast } from 'react-hot-toast';
import { Background } from './Background';
import { subscribeToRoom } from '../services/pusher';
import { LobbySettings } from './LobbySettings';
import type { Difficulty } from '../utils/difficulty';

export const MultiplayerLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { profile, room, setGameMode, createRoom, joinRoom, leaveRoom, addPlayer, updateRoomSettings } = useGameStore();

  useEffect(() => {
    if (room?.id) {
      const unsubscribe = subscribeToRoom(room.id, {
        onPlayerJoined: (player) => {
          addPlayer(player);
          toast.success(`${player.name} joined the room!`);
        },
        onGameStart: () => {
          setGameMode('playing');
        }
      });

      return () => unsubscribe();
    }
  }, [room?.id]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name first!');
      return;
    }

    try {
      setIsCreating(true);
      const roomId = await createRoom(playerName.trim());
      toast.success('Room created! Share the code with your friends.');
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      toast.error('Please enter your name first!');
      return;
    }
    if (!joinCode.trim()) {
      toast.error('Please enter a room code!');
      return;
    }

    try {
      await joinRoom(joinCode.trim().toUpperCase());
      toast.success('Successfully joined room!');
    } catch (error) {
      toast.error('Failed to join room. Please check the code and try again.');
    }
  };

  const copyRoomCode = () => {
    if (room?.id) {
      navigator.clipboard.writeText(room.id);
      toast.success('Room code copied to clipboard!');
    }
  };

  const handleUpdateSettings = async (settings: { maxPlayers: number; difficulty: Difficulty }) => {
    try {
      updateRoomSettings(settings);
      toast.success('Room settings updated!');
    } catch (error) {
      toast.error('Failed to update settings. Please try again.');
    }
  };

  const handleAbandonLobby = () => {
    leaveRoom();
    setGameMode('menu');
    toast.success('You have left the lobby.');
  };

  return (
    <div className="ocean-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      <Background />
      
      <div className="relative z-10 max-w-md w-full px-4">
        <div className="menu-card rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Multiplayer</h2>
            <div className="flex items-center gap-2">
              {room && profile?.name === room.host && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <Cog className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setGameMode('menu')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          {room ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={copyRoomCode}
                  className="flex items-center gap-2 px-4 py-2 menu-button rounded-lg
                           hover:scale-102 transition-all duration-200"
                >
                  <span className="font-mono font-bold text-white">{room.id}</span>
                  <Copy size={16} className="text-blue-300" />
                </button>
                <div className="text-white text-sm">
                  Players: {room.players.length}/{room.settings.maxPlayers}
                </div>
              </div>

              <div className="grid gap-4">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className="menu-button p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center text-2xl">
                        {player.avatar.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {player.name} {player.name === room.host && '(Host)'}
                        </p>
                        <PlayerBubbles bubbles={3} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {room.players.length >= 2 && room.host === profile?.name && (
                <button
                  onClick={() => setGameMode('playing')}
                  className="w-full menu-button py-3 rounded-lg hover:scale-102
                           transition-all duration-200 text-white font-semibold"
                >
                  Start Game
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20
                         focus:border-blue-400 focus:ring focus:ring-blue-400/20 text-white
                         placeholder-blue-200"
                maxLength={20}
              />

              {showJoinForm ? (
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20
                             focus:border-blue-400 focus:ring focus:ring-blue-400/20 text-white
                             placeholder-blue-200"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="flex-1 menu-button py-3 rounded-lg hover:scale-102
                               transition-all duration-200"
                    >
                      <span className="text-white">Back</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 menu-button py-3 rounded-lg hover:scale-102
                               transition-all duration-200"
                    >
                      <span className="text-white">Join Room</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full menu-button flex items-center justify-center gap-2 py-3
                             rounded-lg hover:scale-102 transition-all duration-200
                             disabled:opacity-50"
                  >
                    <UserPlus size={20} className="text-blue-300" />
                    <span className="text-white">
                      {isCreating ? 'Creating Room...' : 'Create Room'}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full menu-button flex items-center justify-center gap-2 py-3
                             rounded-lg hover:scale-102 transition-all duration-200"
                  >
                    <Users size={20} className="text-blue-300" />
                    <span className="text-white">Join Room</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSettings && room && (
        <LobbySettings
          onClose={() => setShowSettings(false)}
          onSave={handleUpdateSettings}
          onAbandon={handleAbandonLobby}
          currentSettings={{
            maxPlayers: room.settings.maxPlayers,
            difficulty: room.settings.difficulty
          }}
        />
      )}
    </div>
  );
};