import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useGame } from "../context/GameContext";
import { ChevronLeft, Users, Tag } from "lucide-react";

export function GameSettingsScreen() {
  const navigate = useNavigate();
  const {
    setupDraft,
    setImpostorCount,
    setImpostorKnowsCategory,
    createGame,
  } = useGame();

  const { playerNames, selectedCategories, impostorCount, impostorKnowsCategory } = setupDraft;

  useEffect(() => {
    if (playerNames.length === 0) {
      navigate("/players");
    }
  }, [playerNames.length, navigate]);

  if (playerNames.length === 0) return null;

  const maxImpostors = Math.min(3, Math.floor(playerNames.length / 2));

  const handleCreateGame = () => {
    createGame();
    navigate("/created");
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button
          onClick={() => navigate("/categories")}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:opacity-70"
        >
          <ChevronLeft size={20} className="text-[#374151]" />
        </button>
        <div>
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Step 4 of 4</p>
          <h2 className="text-[#1A1A2E]">Game Settings</h2>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-8">
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#6366F1] rounded-full w-full" />
        </div>
      </div>

      <div className="flex-1 px-5 pb-36 flex flex-col gap-5">

        {/* Summary card */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={15} className="text-[#6366F1]" />
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Players</p>
              <p className="text-[#1A1A2E] text-sm">{playerNames.join(", ")}</p>
            </div>
          </div>
          <div className="h-px bg-[#F3F4F6]" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag size={15} className="text-[#6366F1]" />
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Categories</p>
              <p className="text-[#1A1A2E] text-sm">{selectedCategories.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Impostor count */}
        <div className="flex flex-col gap-3">
          <p className="text-[#1A1A2E] text-xs font-medium uppercase tracking-widest px-0.5">
            Number of Impostors
          </p>
          <div className="flex gap-3">
            {[1, 2, 3].map((n) => {
              const disabled = n > maxImpostors;
              const selected = impostorCount === n;
              return (
                <button
                  key={n}
                  disabled={disabled}
                  onClick={() => setImpostorCount(n)}
                  className={`flex-1 py-5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-colors ${
                    selected
                      ? "bg-[#1A1A2E] border-[#1A1A2E]"
                      : disabled
                      ? "bg-[#F9FAFB] border-[#E5E7EB] opacity-30"
                      : "bg-white border-[#E5E7EB]"
                  }`}
                >
                  <span
                    className={`text-2xl ${selected ? "text-white" : "text-[#1A1A2E]"}`}
                    style={{ fontWeight: 600 }}
                  >
                    {n}
                  </span>
                  <span
                    className={`text-xs ${selected ? "text-[#9CA3AF]" : "text-[#9CA3AF]"}`}
                  >
                    {n === 1 ? "impostor" : "impostors"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[#9CA3AF] text-xs text-center">
            Max {maxImpostors} for {playerNames.length} players
          </p>
        </div>

        {/* Impostor knows category toggle */}
        <div className="flex flex-col gap-3">
          <p className="text-[#1A1A2E] text-xs font-medium uppercase tracking-widest px-0.5">
            Impostor Hint
          </p>
          <button
            onClick={() => setImpostorKnowsCategory(!impostorKnowsCategory)}
            className={`w-full rounded-2xl px-5 py-4 flex items-center justify-between border-2 transition-colors ${
              impostorKnowsCategory
                ? "bg-white border-[#6366F1]"
                : "bg-white border-[#E5E7EB]"
            } shadow-sm`}
          >
            <div className="flex flex-col gap-0.5 text-left">
              <p className="text-[#1A1A2E] text-sm">Impostor knows category</p>
              <p className="text-[#9CA3AF] text-xs">
                {impostorKnowsCategory
                  ? "Impostor will see the word's category"
                  : "Impostor gets no hints at all"}
              </p>
            </div>
            {/* Toggle pill */}
            <div
              className={`relative w-12 h-6 rounded-full flex-shrink-0 transition-colors ml-4 ${
                impostorKnowsCategory ? "bg-[#6366F1]" : "bg-[#D1D5DB]"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  impostorKnowsCategory ? "left-7" : "left-1"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Info box */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-4 py-3 flex gap-3 items-start">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-[#92400E] text-sm">
            {impostorKnowsCategory
              ? "The impostor will know the category (e.g. \"Places\") but not the exact word."
              : "The impostor will have zero information — harder to bluff, more fun!"}
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F5F4EF] via-[#F5F4EF] to-transparent">
        <button
          onClick={handleCreateGame}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80"
        >
          Create Game 🎮
        </button>
      </div>
    </div>
  );
}