import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useGame } from "../context/GameContext";
import { ChevronLeft, Check } from "lucide-react";

export function PlayerNamesScreen() {
  const navigate = useNavigate();
  const { setupDraft, setPlayerNames } = useGame();
  const { playerCount } = setupDraft;

  const [names, setNames] = useState<string[]>(() => {
    // Preserve any previously entered names
    const prev = setupDraft.playerNames;
    const filled = Array.from({ length: playerCount }, (_, i) => prev[i] ?? "");
    return filled;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first empty field on mount
    const firstEmpty = names.findIndex((n) => n.trim() === "");
    const focusIdx = firstEmpty === -1 ? 0 : firstEmpty;
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 100);
  }, []);

  const handleChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const filledCount = names.filter((n) => n.trim().length > 0).length;
  const allFilled = filledCount === playerCount;
  const progress = filledCount / playerCount;

  const handleNext = () => {
    if (!allFilled) return;
    setPlayerNames(names.map((n) => n.trim()));
    navigate("/categories");
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button
          onClick={() => navigate("/players")}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:opacity-70"
        >
          <ChevronLeft size={20} className="text-[#374151]" />
        </button>
        <div>
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Step 2 of 4</p>
          <h2 className="text-[#1A1A2E]">Enter Player Names</h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-5">
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#6366F1] rounded-full w-2/4" />
        </div>
      </div>

      {/* Fill progress */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#6B7280] text-sm">
            {filledCount === 0
              ? "Enter all names to continue"
              : filledCount === playerCount
              ? "All players added!"
              : `${filledCount} of ${playerCount} names entered`}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              allFilled
                ? "bg-[#DCFCE7] text-[#16A34A]"
                : "bg-[#F3F4F6] text-[#9CA3AF]"
            }`}
          >
            {filledCount}/{playerCount}
          </span>
        </div>
        {/* Mini fill bar */}
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#34D399] rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Name inputs */}
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <div className="flex flex-col gap-3">
          {names.map((name, i) => {
            const isFilled = name.trim().length > 0;
            return (
              <div key={i} className="relative">
                {/* Number badge */}
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-colors ${
                    isFilled ? "bg-[#DCFCE7]" : "bg-[#EEF2FF]"
                  }`}
                >
                  {isFilled ? (
                    <Check size={13} className="text-[#16A34A]" />
                  ) : (
                    <span
                      className="text-[#6366F1]"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                <input
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  value={name}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  placeholder={`Player ${i + 1}`}
                  maxLength={20}
                  className={`w-full bg-white rounded-2xl pl-14 pr-4 py-4 text-sm text-[#1A1A2E] placeholder-[#C4C9D4] outline-none border transition-colors ${
                    isFilled
                      ? "border-[#6EE7B7]"
                      : "border-[#E5E7EB] focus:border-[#6366F1]"
                  } shadow-sm`}
                />
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-5 bg-[#EEF2FF] rounded-2xl px-4 py-3 flex gap-3 items-center">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-[#6366F1] text-sm">
            Use real names so everyone recognises their slot
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F5F4EF] via-[#F5F4EF] to-transparent">
        <button
          onClick={handleNext}
          disabled={!allFilled}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium disabled:opacity-30 active:opacity-80 transition-opacity"
        >
          {allFilled ? "Next — Pick Categories" : `Fill in ${playerCount - filledCount} more name${playerCount - filledCount > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}