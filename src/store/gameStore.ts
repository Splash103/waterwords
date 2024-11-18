import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty } from '../utils/difficulty';
import { SeaAnimal } from '../utils/seaAnimals';
import { nanoid } from 'nanoid';

interface Profile {
  name: string;
  avatar: SeaAnimal;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  difficulty: string;
  date: number;
}

interface Player {
  id: string;
  name: string;
  avatar: SeaAnimal;
  score: number;
  bubbles: number;
}

interface Room {
  id: string;
  host: string;
  players: Player[];
  settings: {
    maxPlayers: number;
    difficulty: Difficulty;
    turnTimeLimit: number;
  };
  isPlaying: boolean;
}

interface GameState {
  gameMode: 'menu' | 'single' | 'multi' | 'playing' | 'leaderboard';
  difficulty: Difficulty;
  profile: Profile | null;
  leaderboard: LeaderboardEntry[];
  room: Room | null;
  setGameMode: (mode: GameState['gameMode']) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  updateProfile: (profile: Profile) => void;
  addToLeaderboard: (entry: Omit<LeaderboardEntry, 'date'>) => void;
  createRoom: (hostName: string) => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updateRoomSettings: (settings: Partial<Room['settings']>) => void;
}

const DEFAULT_LOBBY_SETTINGS = {
  maxPlayers: 4,
  difficulty: 'normal' as Difficulty,
  turnTimeLimit: 30
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameMode: 'menu',
      difficulty: 'normal',
      profile: null,
      leaderboard: [],
      room: null,

      setGameMode: (mode) => set({ gameMode: mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      updateProfile: (profile) => set({ profile }),

      addToLeaderboard: (entry) => set((state) => ({
        leaderboard: [...state.leaderboard, { ...entry, date: Date.now() }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      })),

      createRoom: async (hostName) => {
        const roomId = nanoid(6).toUpperCase();
        const { profile } = get();
        
        if (!profile) throw new Error('Profile not set');

        const room: Room = {
          id: roomId,
          host: hostName,
          players: [{
            id: nanoid(),
            name: hostName,
            avatar: profile.avatar,
            score: 0,
            bubbles: 3
          }],
          settings: DEFAULT_LOBBY_SETTINGS,
          isPlaying: false
        };

        set({ room });
        return roomId;
      },

      joinRoom: async (roomId) => {
        const { profile } = get();
        if (!profile) throw new Error('Profile not set');

        // In a real implementation, this would fetch room data from the server
        const room: Room = {
          id: roomId,
          host: 'Host',
          players: [],
          settings: DEFAULT_LOBBY_SETTINGS,
          isPlaying: false
        };

        set({ room });
      },

      leaveRoom: () => {
        set({ room: null });
      },

      addPlayer: (playerData) => {
        set((state) => ({
          room: state.room ? {
            ...state.room,
            players: [
              ...state.room.players,
              {
                id: nanoid(),
                ...playerData,
                score: 0,
                bubbles: 3
              }
            ]
          } : null
        }));
      },

      updateRoomSettings: (settings) => {
        set((state) => ({
          room: state.room ? {
            ...state.room,
            settings: {
              ...state.room.settings,
              ...settings
            }
          } : null
        }));
      }
    }),
    {
      name: 'word-flood-storage',
      version: 1
    }
  )
);