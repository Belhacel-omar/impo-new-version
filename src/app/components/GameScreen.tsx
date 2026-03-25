import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useGame, Player, GameState } from "../context/GameContext";
import { Eye, EyeOff, Flag, Copy, Check, Share2, Loader2 } from "lucide-react";
import { getRoom, revealPlayerInRoom, endRoom } from "../api/rooms";

export function GameScreen() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { game, hydrateGame } = useGame();

  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [revealStep, setRevealStep] = useState<"confirm" | "shown">("confirm");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Loading state for guests opening the link directly
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Track in-flight actions so poll doesn't clobber optimistic updates
  const actionInFlight = useRef(false);

  // The shareable link IS the current URL
  const shareLink = typeof window !== "undefined" ? window.location.href : "";

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
    // If game is already loaded in context (host just came from /created), skip fetch
    if (game.phase === "playing" && game.gameId === roomId) return;

    // Guest or page refresh — load from server
    setLoading(true);
    setLoadError(null);
    getRoom(roomId)
      .then((data) => {
        if (!data) {
          setLoadError("Room not found. The game may have ended or the link is incorrect.");
          return;
        }
        hydrateGame(data);
        // If game already ended, go to results immediately
        if (data.phase === "results") {
          navigate(`/results/${roomId}`, { replace: true });
        }
      })
      .catch((e) => {
        console.error("Failed to load room:", e);
        setLoadError("Could not load the game. Check your connection.");
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Polling — sync state from server every 3 seconds ─────────────────────
  const poll = useCallback(async () => {
    if (!roomId || actionInFlight.current) return;
    try {
      const data = await getRoom(roomId);
      if (!data) return;
      hydrateGame(data);
      if (data.phase === "results") {
        navigate(`/results/${roomId}`);
      }
    } catch (e) {
      console.error("Poll error:", e);
    }
  }, [roomId, hydrateGame, navigate]);

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [roomId, poll]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCardTap = (player: Player) => {
    if (player.revealed) return;
    setActivePlayer(player);
    setRevealStep("confirm");
  };

  const handleReveal = async () => {
    if (!activePlayer || !roomId) return;
    actionInFlight.current = true;
    // Optimistic update immediately so UI feels instant
    hydrateGame({
      ...game,
      players: game.players.map((p) =>
        p.id === activePlayer.id ? { ...p, revealed: true } : p
      ),
    });
    setRevealStep("shown");
    try {
      const updated = await revealPlayerInRoom(roomId, activePlayer.id);
      hydrateGame(updated);
    } catch (e) {
      console.error("Failed to reveal player:", e);
    } finally {
      actionInFlight.current = false;
    }
  };

  const handleClose = () => {
    setActivePlayer(null);
    setRevealStep("confirm");
  };

  const handleEndGame = async () => {
    if (!roomId) return;
    actionInFlight.current = true;
    try {
      const updated = await endRoom(roomId);
      hydrateGame(updated);
      navigate(`/results/${roomId}`);
    } catch (e) {
      console.error("Failed to end game:", e);
    } finally {
      actionInFlight.current = false;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      /* fallback — ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Impostor Game",
          text: `Join our Impostor Game! Room: ${roomId}`,
          url: shareLink,
        });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    handleCopy();
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-center gap-4 px-5">
        <Loader2 size={36} className="text-[#6366F1] animate-spin" />
        <p className="text-[#6B7280] text-sm">Loading game…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="text-4xl">😕</span>
        <p className="text-[#1A1A2E] font-medium">Room Not Found</p>
        <p className="text-[#6B7280] text-sm max-w-xs">{loadError}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-sm font-medium active:opacity-80"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (game.phase !== "playing") return null;

  const revealedCount = game.players.filter((p) => p.revealed).length;
  const allRevealed = revealedCount === game.players.length;

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col">

      {/* Share strip — always visible at the top */}
      <div className="bg-white border-b border-[#F3F4F6] px-5 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[#9CA3AF] text-[10px] uppercase tracking-widest">Share with players</p>
          <p className="text-[#1A1A2E] text-xs font-mono truncate mt-0.5">{shareLink}</p>
        </div>
        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 active:opacity-70"
        >
          <Share2 size={15} className="text-[#6366F1]" />
        </button>
        <button
          onClick={handleCopy}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            copied ? "bg-[#DCFCE7]" : "bg-[#F3F4F6]"
          } active:opacity-70`}
        >
          {copied ? (
            <Check size={15} className="text-[#16A34A]" />
          ) : (
            <Copy size={15} className="text-[#9CA3AF]" />
          )}
        </button>
      </div>

      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[#1A1A2E]">Tap Your Name</h2>
          <span className="text-[#9CA3AF] text-sm">
            {revealedCount}/{game.players.length}
          </span>
        </div>
        <p className="text-[#6B7280] text-sm">Each player reveals their role in secret</p>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6366F1] rounded-full transition-all duration-500"
            style={{ width: `${(revealedCount / game.players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Players list */}
      <div className="flex-1 px-5 pb-40 flex flex-col gap-3">
        {game.players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onTap={() => handleCardTap(player)}
          />
        ))}
      </div>

      {/* Bottom area */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F5F4EF] via-[#F5F4EF] to-transparent">
        {allRevealed ? (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80 flex items-center justify-center gap-2"
          >
            <Flag size={18} />
            End Game &amp; See Results
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 bg-[#FEF3C7] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm">⏳</span>
              </div>
              <p className="text-[#6B7280] text-sm">
                <strong className="text-[#1A1A2E]">
                  {game.players.length - revealedCount}
                </strong>{" "}
                player{game.players.length - revealedCount !== 1 ? "s" : ""} yet to reveal
              </p>
            </div>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="w-full bg-white border border-[#E5E7EB] text-[#6B7280] py-3.5 rounded-2xl text-sm font-medium active:opacity-70"
            >
              End Game Early
            </button>
          </div>
        )}
      </div>

      {/* Role Reveal Modal */}
      {activePlayer && (
        <RevealModal
          player={activePlayer}
          game={game}
          step={revealStep}
          onReveal={handleReveal}
          onClose={handleClose}
        />
      )}

      {/* End Confirm Modal */}
      {showEndConfirm && (
        <ConfirmModal
          onConfirm={handleEndGame}
          onCancel={() => setShowEndConfirm(false)}
          allRevealed={allRevealed}
        />
      )}
    </div>
  );
}

/* ── Player Row ─────────────────────────────────────────── */
function PlayerRow({ player, onTap }: { player: Player; onTap: () => void }) {
  const revealed = player.revealed;
  return (
    <button
      onClick={onTap}
      disabled={revealed}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
        revealed
          ? "bg-[#F9FAFB] border-[#E5E7EB]"
          : "bg-white border-[#E5E7EB] shadow-sm active:opacity-70"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          revealed ? "bg-[#F3F4F6]" : "bg-[#EEF2FF]"
        }`}
      >
        {revealed ? (
          <EyeOff size={16} className="text-[#D1D5DB]" />
        ) : (
          <span
            className="text-[#6366F1]"
            style={{ fontWeight: 600, fontSize: "15px" }}
          >
            {player.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <span
        className={`flex-1 text-left text-sm ${
          revealed ? "text-[#9CA3AF]" : "text-[#1A1A2E]"
        }`}
      >
        {player.name}
      </span>

      {/* Status */}
      {revealed ? (
        <span className="text-[#9CA3AF] text-xs bg-[#F3F4F6] px-2.5 py-1 rounded-full">
          Revealed
        </span>
      ) : (
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-[#6366F1]" />
          <span className="text-[#6366F1] text-xs">Tap</span>
        </div>
      )}
    </button>
  );
}

/* ── Reveal Modal ───────────────────────────────────────── */
function RevealModal({
  player,
  game,
  step,
  onReveal,
  onClose,
}: {
  player: Player;
  game: GameState;
  step: "confirm" | "shown";
  onReveal: () => void;
  onClose: () => void;
}) {
  const isImpostor = player.role === "impostor";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden">
        {step === "confirm" ? (
          /* Step 1 — Privacy gate */
          <>
            <div className="bg-[#F9FAFB] px-6 pt-7 pb-5 text-center">
              <div className="w-14 h-14 bg-[#1A1A2E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl" style={{ fontWeight: 700 }}>
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-[#1A1A2E] mb-1">{player.name}</p>
              <p className="text-[#6B7280] text-sm">
                Is this you? Make sure only you can see the screen before revealing your role.
              </p>
            </div>
            <div className="px-6 py-5 flex flex-col gap-3">
              <button
                onClick={onReveal}
                className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80"
              >
                Reveal My Role
              </button>
              <button
                onClick={onClose}
                className="w-full bg-[#F3F4F6] text-[#374151] py-4 rounded-2xl text-base font-medium active:opacity-80"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          /* Step 2 — Role reveal */
          <>
            <div
              className={`px-6 pt-7 pb-5 text-center ${
                isImpostor ? "bg-[#FEF2F2]" : "bg-[#F0FDF4]"
              }`}
            >
              <div className="text-5xl mb-3">{isImpostor ? "🦹" : "🔍"}</div>
              {isImpostor ? (
                <>
                  <h3 className="text-[#DC2626] mb-1">You are the Impostor!</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    {game.impostorKnowsCategory
                      ? `The category is "${game.category}" — but you don't know the word.`
                      : "You have no information. Bluff your way through!"}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-[#16A34A] mb-1">You know the word!</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Describe it without saying it. Spot the impostor!
                  </p>
                </>
              )}
            </div>

            {/* Word / Impostor reveal box */}
            <div className="px-6 pt-4 pb-2">
              <div
                className={`rounded-2xl px-5 py-4 text-center border ${
                  isImpostor
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F0FDF4] border-[#6EE7B7]"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-widest mb-1 ${
                    isImpostor ? "text-[#F87171]" : "text-[#34D399]"
                  }`}
                >
                  {isImpostor ? "Your role" : "Secret word"}
                </p>
                <p
                  className={`text-2xl ${
                    isImpostor ? "text-[#DC2626]" : "text-[#065F46]"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {isImpostor ? "IMPOSTOR" : game.word}
                </p>
                {isImpostor && game.impostorKnowsCategory && (
                  <p className="text-[#EF4444] text-sm mt-1.5">
                    Category: <strong>{game.category}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-5">
              <button
                onClick={onClose}
                className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80"
              >
                Got it — pass the phone
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── End Confirm Modal ──────────────────────────────────── */
function ConfirmModal({
  onConfirm,
  onCancel,
  allRevealed,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  allRevealed: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🎭</div>
          <h3 className="text-[#1A1A2E] mb-2">
            {allRevealed ? "Reveal Results?" : "End game early?"}
          </h3>
          <p className="text-[#6B7280] text-sm">
            {allRevealed
              ? "Everyone has revealed their role. Time to vote and find the impostor!"
              : "Not everyone has revealed yet. The results will still show all roles."}
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80"
        >
          Yes, show results
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-[#F3F4F6] text-[#374151] py-4 rounded-2xl text-base font-medium active:opacity-80"
        >
          Go back
        </button>
      </div>
    </div>
  );
}