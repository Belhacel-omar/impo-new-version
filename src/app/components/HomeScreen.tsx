import { useNavigate } from "react-router";
import { Users, Eye, MessageSquare } from "lucide-react";

export function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-between px-6 py-12">
      {/* Top spacer */}
      <div />

      {/* Hero content */}
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#1A1A2E] rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🕵️</span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[#1A1A2E]">Impostor Game</h1>
          <p className="text-[#6B7280]">
            Play with your friends anywhere
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/players")}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium mt-2 active:opacity-80 transition-opacity"
        >
          Create Game
        </button>
      </div>

      {/* How it works */}
      <div className="w-full max-w-sm">
        <p className="text-[#9CA3AF] text-center text-sm mb-4">How it works</p>
        <div className="flex flex-col gap-3">
          <HowItWorksStep
            icon={<Users size={16} className="text-[#6366F1]" />}
            step="1"
            text="Enter all player names"
          />
          <HowItWorksStep
            icon={<Eye size={16} className="text-[#6366F1]" />}
            step="2"
            text="Each player taps their name in secret"
          />
          <HowItWorksStep
            icon={<MessageSquare size={16} className="text-[#6366F1]" />}
            step="3"
            text="Discuss and vote out the impostor!"
          />
        </div>
      </div>
    </div>
  );
}

function HowItWorksStep({
  icon,
  step,
  text,
}: {
  icon: React.ReactNode;
  step: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <p className="text-[#374151] text-sm">{text}</p>
      <span className="ml-auto text-[#D1D5DB] text-xs font-medium">#{step}</span>
    </div>
  );
}