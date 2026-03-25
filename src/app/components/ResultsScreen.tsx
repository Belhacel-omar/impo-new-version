import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGame } from "../context/GameContext";
import { RotateCcw, Loader2 } from "lucide-react";
import { getRoom } from "../api/rooms";

export function ResultsScreen() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { game, hydrateGame, resetGame } = useGame();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // If we arrived here without game state in memory (e.g. page refresh, or
  // another player followed the results link), load from the server.
  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
    if (game.phase === "results" && game.gameId === roomId) return; // already loaded

    setLoading(true);
    setLoadError(null);
    getRoom(roomId)
      .then((data) => {
        if (!data) {
          setLoadError("Room not found.");
          return;
        }
        hydrateGame(data);
        // If game isn't over yet, send them to the game screen
        if (data.phase !== "results") {
          navigate(`/game/${roomId}`, { replace: true });
        }
      })
      .catch((e) => {
        console.error("Failed to load room for results:", e);
        setLoadError("Could not load results. Check your connection.");
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleStartOver = () => {
    resetGame();
    navigate("/");
  };

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-center gap-4 px-5">
        <Loader2 size={36} className="text-[#6366F1] animate-spin" />
        <p className="text-[#6B7280] text-sm">Loading results…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="text-4xl">😕</span>
        <p className="text-[#1A1A2E] font-medium">Could not load results</p>
        <p className="text-[#6B7280] text-sm">{loadError}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-sm font-medium"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (game.phase !== "results") return null;

  const impostors = game.players.filter((p) => p.role === "impostor");
  const wordMasters = game.players.filter((p) => p.role === "word-master");

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col px-5 pt-12 pb-10">

      {/* Header */}
      <div className="text-center mb-7">
        <div className="text-5xl mb-4">🎭</div>
        <h1 className="text-[#1A1A2E] mb-1">Game Over</h1>
        <p className="text-[#9CA3AF] text-sm">Here's how it all played out</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">

        {/* The Word */}
        <div className="bg-[#1A1A2E] rounded-2xl px-5 py-6 text-center">
          <p className="text-[#6B7280] text-xs uppercase tracking-widest mb-2">
            The Secret Word Was
          </p>
          <p className="text-white mb-1" style={{ fontSize: "36px", fontWeight: 700, lineHeight: 1 }}>
            {game.word}
          </p>
          <p className="text-[#4B5563] text-xs mt-2">Category: {game.category}</p>
        </div>

        {/* Impostor(s) */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#FEF2F2] px-5 py-3.5 flex items-center gap-2">
            <span className="text-base">🦹</span>
            <span className="text-[#DC2626] text-sm" style={{ fontWeight: 600 }}>
              {impostors.length > 1 ? "Impostors" : "Impostor"}
            </span>
            <span className="ml-auto bg-[#FEE2E2] text-[#F87171] text-xs px-2 py-0.5 rounded-full">
              {impostors.length} of {game.players.length}
            </span>
          </div>
          {impostors.map((player, i) => (
            <div
              key={player.id}
              className={`px-5 py-4 flex items-center gap-3 ${
                i < impostors.length - 1 ? "border-b border-[#FEF2F2]" : ""
              }`}
            >
              <div className="w-9 h-9 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base">🦹</span>
              </div>
              <div>
                <p className="text-[#1A1A2E] text-sm">{player.name}</p>
                <p className="text-[#F87171] text-xs">Was bluffing all along</p>
              </div>
            </div>
          ))}
        </div>

        {/* Word Masters */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#F0FDF4] px-5 py-3.5 flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span className="text-[#16A34A] text-sm" style={{ fontWeight: 600 }}>
              Word Masters
            </span>
            <span className="ml-auto bg-[#DCFCE7] text-[#34D399] text-xs px-2 py-0.5 rounded-full">
              {wordMasters.length} of {game.players.length}
            </span>
          </div>
          {wordMasters.map((player, i) => (
            <div
              key={player.id}
              className={`px-5 py-4 flex items-center gap-3 ${
                i < wordMasters.length - 1 ? "border-b border-[#F0FDF4]" : ""
              }`}
            >
              <div className="w-9 h-9 bg-[#F0FDF4] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base">🔍</span>
              </div>
              <div>
                <p className="text-[#1A1A2E] text-sm">{player.name}</p>
                <p className="text-[#34D399] text-xs">Knew the word</p>
              </div>
            </div>
          ))}
        </div>

        {/* Discussion prompt */}
        <div className="bg-[#EEF2FF] rounded-2xl px-4 py-3 flex gap-3 items-start">
          <span className="text-base flex-shrink-0">💬</span>
          <p className="text-[#6366F1] text-sm">
            Did everyone vote correctly? Discuss what gave the impostor away!
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleStartOver}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Play Again
        </button>
      </div>
    </div>
  );
}
