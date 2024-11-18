import React from 'react';
import { X } from 'lucide-react';
import { Difficulty } from '../utils/difficulty';

interface LobbySettingsProps {
  onClose: () => void;
  onSave: (settings: { maxPlayers: number; difficulty: Difficulty }) => void;
  onAbandon: () => void;
  currentSettings: {
    maxPlayers: number;
    difficulty: Difficulty;
  };
}

export const LobbySettings: React.FC<LobbySettingsProps> = ({
  onClose,
  onSave,
  onAbandon,
  currentSettings
}) => {
  const [maxPlayers, setMaxPlayers] = React.useState(currentSettings.maxPlayers);
  const [difficulty, setDifficulty] = React.useState<Difficulty>(currentSettings.difficulty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ maxPlayers, difficulty });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full mx-4 shadow-xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Lobby Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Players
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border-2 border-white/20
                       focus:border-blue-400 focus:ring focus:ring-blue-400/20"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num} className="bg-gray-800">
                  {num} Players
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Game Difficulty
            </label>
            <div className="space-y-2">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                <label
                  key={diff}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/10
                           border-2 border-white/20 cursor-pointer hover:bg-white/20
                           transition-colors"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff}
                    checked={difficulty === diff}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="text-blue-500 focus:ring-blue-400"
                  />
                  <span className="capitalize">{diff}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 menu-button py-3 rounded-lg hover:scale-102
                       transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onAbandon}
              className="flex-1 bg-red-500/50 hover:bg-red-500/70 text-white font-semibold
                       py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Abandon Lobby
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};