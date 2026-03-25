import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGame } from "../context/GameContext";
import { ChevronRight, Users, Loader2 } from "lucide-react";
import { saveRoom } from "../api/rooms";

export function GameCreatedScreen() {
  const navigate = useNavigate();
  const { game } = useGame();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (game.phase !== "playing") {
      navigate("/");
    }
  }, [game.phase, navigate]);

  if (game.phase !== "playing") return null;

  /**
   * When the host presses "Start Game":
   * 1. Save the full game state to the server (KV store)
   * 2. Navigate to /game/:roomId — this URL IS the shareable link
   */
  const handleStart = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveRoom(game);
      navigate(`/game/${game.gameId}`);
    } catch (e) {
      console.error("Failed to save room:", e);
      setSaveError("Could not save the game. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col px-5 pt-12 pb-10">
      {/* Success header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-[#1A1A2E] mb-1">Game Ready!</h1>
        <p className="text-[#6B7280] text-sm">
          Press Start — you'll get a shareable link on the next screen
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* How sharing works */}
        <div className="bg-[#EEF2FF] rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">🔗</span>
          <div>
            <p className="text-[#1A1A2E] text-sm font-medium mb-0.5">How to share</p>
            <p className="text-[#6366F1] text-sm leading-relaxed">
              After starting, you'll get a unique game link. Share it via WhatsApp or any app — friends open it on their own phones and tap their name to see their secret role.
            </p>
          </div>
        </div>

        {/* Game info row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm text-center">
            <p className="text-[#9CA3AF] text-xs">Room ID</p>
            <p className="text-[#1A1A2E] font-mono mt-0.5">{game.gameId}</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm text-center">
            <p className="text-[#9CA3AF] text-xs">Category</p>
            <p className="text-[#1A1A2E] text-sm mt-0.5 truncate">{game.category}</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm text-center">
            <p className="text-[#9CA3AF] text-xs">Impostor{game.impostorCount > 1 ? "s" : ""}</p>
            <p className="text-[#1A1A2E] mt-0.5">{game.impostorCount}</p>
          </div>
        </div>

        {/* Players list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
            <Users size={14} className="text-[#9CA3AF]" />
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">
              Players · {game.players.length}
            </p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {game.players.map((player, i) => (
              <div key={player.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EEF2FF] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6366F1] text-xs" style={{ fontWeight: 600 }}>
                    {i + 1}
                  </span>
                </div>
                <span className="text-[#1A1A2E] text-sm flex-1">{player.name}</span>
                <div className="w-2 h-2 bg-[#D1FAE5] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl px-4 py-3">
            <p className="text-[#DC2626] text-sm">{saveError}</p>
          </div>
        )}
      </div>

      {/* Start button */}
      <div className="mt-6">
        <button
          onClick={handleStart}
          disabled={saving}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving game…
            </>
          ) : (
            <>
              Start Game
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
