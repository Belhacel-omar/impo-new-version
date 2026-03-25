import { useNavigate } from "react-router";
import { useGame } from "../context/GameContext";
import { ChevronLeft, Minus, Plus } from "lucide-react";

const MIN = 3;
const MAX = 12;

export function PlayerCountScreen() {
  const navigate = useNavigate();
  const { setupDraft, setPlayerCount } = useGame();
  const count = setupDraft.playerCount;

  const decrement = () => {
    if (count > MIN) setPlayerCount(count - 1);
  };

  const increment = () => {
    if (count < MAX) setPlayerCount(count + 1);
  };

  const handleNext = () => {
    navigate("/names");
  };

  const percentage = ((count - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:opacity-70"
        >
          <ChevronLeft size={20} className="text-[#374151]" />
        </button>
        <div>
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Step 1 of 4</p>
          <h2 className="text-[#1A1A2E]">Number of Players</h2>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-10">
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#6366F1] rounded-full w-1/4" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
        {/* Big number stepper */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#9CA3AF] text-sm">Select number of players</p>
          <div className="flex items-center gap-8 mt-4">
            {/* Minus */}
            <button
              onClick={decrement}
              disabled={count <= MIN}
              className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#E5E7EB] disabled:opacity-30 active:opacity-70"
            >
              <Minus size={22} className="text-[#374151]" />
            </button>

            {/* Number display */}
            <div className="flex flex-col items-center">
              <span
                className="text-[#1A1A2E] select-none"
                style={{ fontSize: "80px", lineHeight: 1, fontWeight: 600 }}
              >
                {count}
              </span>
              <span className="text-[#9CA3AF] text-sm mt-1">
                player{count !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Plus */}
            <button
              onClick={increment}
              disabled={count >= MAX}
              className="w-14 h-14 bg-[#1A1A2E] rounded-2xl shadow-sm flex items-center justify-center disabled:opacity-30 active:opacity-70"
            >
              <Plus size={22} className="text-white" />
            </button>
          </div>
        </div>

        {/* Slider track */}
        <div className="w-full flex flex-col gap-2">
          <div className="relative h-2 bg-[#E5E7EB] rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-[#6366F1] rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between px-0.5">
            <span className="text-[#D1D5DB] text-xs">{MIN} min</span>
            <span className="text-[#D1D5DB] text-xs">{MAX} max</span>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-[#9CA3AF] text-xs text-center uppercase tracking-widest">Quick select</p>
          <div className="grid grid-cols-5 gap-2">
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`py-3 rounded-xl text-sm border transition-colors ${
                  count === n
                    ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                    : "bg-white text-[#374151] border-[#E5E7EB]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 pt-6">
        <button
          onClick={handleNext}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium active:opacity-80"
        >
          Next — Enter Names
        </button>
      </div>
    </div>
  );
}