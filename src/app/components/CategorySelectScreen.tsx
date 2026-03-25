import { useNavigate } from "react-router";
import { useGame, WORD_BANK } from "../context/GameContext";
import { ChevronLeft, Check } from "lucide-react";

interface CategoryMeta {
  emoji: string;
  label: string;
  description: string;
  color: {
    bg: string;
    bgSelected: string;
    border: string;
    borderSelected: string;
    icon: string;
    iconSelected: string;
    badge: string;
    badgeText: string;
    checkBg: string;
    tagBg: string;
    tagText: string;
  };
  tags: string[];
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Countries & Capitals": {
    emoji: "🌐",
    label: "Countries & Capitals",
    description: "Nations and their capital cities from around the world",
    color: {
      bg: "#FFFFFF",
      bgSelected: "#FFFFFF",
      border: "#E5E7EB",
      borderSelected: "#6366F1",
      icon: "#F3F4F6",
      iconSelected: "#EEF2FF",
      badge: "#EEF2FF",
      badgeText: "#6366F1",
      checkBg: "#6366F1",
      tagBg: "#F5F3FF",
      tagText: "#7C3AED",
    },
    tags: ["France", "Tokyo", "Riyadh", "Ottawa"],
  },
  "Places": {
    emoji: "🌍",
    label: "الأماكن — Places",
    description: "Locations and venues from everyday life",
    color: {
      bg: "#FFFFFF",
      bgSelected: "#FFFFFF",
      border: "#E5E7EB",
      borderSelected: "#059669",
      icon: "#F3F4F6",
      iconSelected: "#ECFDF5",
      badge: "#ECFDF5",
      badgeText: "#059669",
      checkBg: "#059669",
      tagBg: "#F0FDF4",
      tagText: "#15803D",
    },
    tags: ["مقهى", "مطار", "مستشفى", "ملعب"],
  },
  "Objects": {
    emoji: "🧠",
    label: "الأشياء — Objects",
    description: "Everyday items and things around you",
    color: {
      bg: "#FFFFFF",
      bgSelected: "#FFFFFF",
      border: "#E5E7EB",
      borderSelected: "#D97706",
      icon: "#F3F4F6",
      iconSelected: "#FFFBEB",
      badge: "#FFFBEB",
      badgeText: "#D97706",
      checkBg: "#D97706",
      tagBg: "#FEF9C3",
      tagText: "#A16207",
    },
    tags: ["هاتف", "كاميرا", "سيارة", "كتاب"],
  },
};

function getCountLabel(key: string): string {
  const count = WORD_BANK[key]?.length ?? 0;
  if (key === "Countries & Capitals") return "200+ items";
  if (count >= 60) return `${Math.floor(count / 10) * 10}+ items`;
  if (count >= 50) return "50+ items";
  return `${count} items`;
}

export function CategorySelectScreen() {
  const navigate = useNavigate();
  const { setupDraft, setSelectedCategories } = useGame();
  const { selectedCategories } = setupDraft;

  const categories = Object.keys(WORD_BANK);
  const noneSelected = selectedCategories.length === 0;
  const allSelected = selectedCategories.length === categories.length;

  const toggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button
          onClick={() => navigate("/names")}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:opacity-70 flex-shrink-0"
        >
          <ChevronLeft size={20} className="text-[#374151]" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Step 3 of 4</p>
        </div>
        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all ${
                s === 3 ? "w-5 h-1.5 bg-[#6366F1]" : s < 3 ? "w-1.5 h-1.5 bg-[#6366F1]" : "w-1.5 h-1.5 bg-[#D1D5DB]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title section */}
      <div className="px-5 mb-6">
        <h1 className="text-[#1A1A2E] mb-1" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>
          Choose Categories
        </h1>
        <p className="text-[#6B7280] text-sm">
          Select one or more categories — the secret word will be randomly picked from your selection.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-40 flex flex-col gap-3">

        {/* Select All row */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">
            {selectedCategories.length === 0
              ? "None selected"
              : selectedCategories.length === categories.length
              ? "All selected"
              : `${selectedCategories.length} of ${categories.length} selected`}
          </p>
          <button
            onClick={handleSelectAll}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              allSelected
                ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]"
                : "bg-[#EEF2FF] border-[#C7D2FE] text-[#6366F1]"
            }`}
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* Category cards */}
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isSelected = selectedCategories.includes(cat);
          const c = meta.color;

          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className="w-full text-left rounded-2xl border-2 overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
              style={{
                background: isSelected ? c.bgSelected : c.bg,
                borderColor: isSelected ? c.borderSelected : c.border,
              }}
            >
              {/* Top row */}
              <div className="flex items-start gap-4 p-5 pb-3">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: isSelected ? c.iconSelected : c.icon }}
                >
                  {meta.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm leading-snug"
                      style={{ color: "#1A1A2E", fontWeight: isSelected ? 600 : 500 }}
                    >
                      {meta.label}
                    </p>
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors"
                      style={{
                        background: isSelected ? c.checkBg : "#FFFFFF",
                        borderColor: isSelected ? c.checkBg : "#D1D5DB",
                      }}
                    >
                      {isSelected && (
                        <Check size={13} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <p className="text-[#9CA3AF] text-xs mt-0.5 leading-snug">
                    {meta.description}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px" style={{ background: isSelected ? `${c.borderSelected}22` : "#F3F4F6" }} />

              {/* Bottom row — count badge + sample tags */}
              <div className="flex items-center justify-between px-5 py-3 gap-3">
                {/* Count badge */}
                <span
                  className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: isSelected ? c.badge : "#F3F4F6",
                    color: isSelected ? c.badgeText : "#9CA3AF",
                    fontWeight: 600,
                  }}
                >
                  {getCountLabel(cat)}
                </span>

                {/* Sample tags */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: isSelected ? c.tagBg : "#F9FAFB",
                        color: isSelected ? c.tagText : "#9CA3AF",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}

        {/* Info notice */}
        {selectedCategories.length > 1 && (
          <div className="bg-[#EEF2FF] rounded-2xl px-4 py-3 flex gap-3 items-center">
            <span className="text-base flex-shrink-0">🎲</span>
            <p className="text-[#6366F1] text-sm">
              A word will be picked randomly from across all{" "}
              <strong>{selectedCategories.length}</strong> selected categories each round.
            </p>
          </div>
        )}

        {noneSelected && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl px-4 py-3 flex gap-3 items-center">
            <span className="text-base flex-shrink-0">⚠️</span>
            <p className="text-[#DC2626] text-sm">
              Select at least one category to continue.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F5F4EF] via-[#F5F4EF] to-transparent">
        {/* Selection pills */}
        {selectedCategories.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {selectedCategories.map((cat) => {
              const c = CATEGORY_META[cat].color;
              return (
                <span
                  key={cat}
                  className="text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: c.badge, color: c.badgeText }}
                >
                  <span>{CATEGORY_META[cat].emoji}</span>
                  <span>{cat.split(" — ")[0]}</span>
                </span>
              );
            })}
          </div>
        )}

        <button
          onClick={() => navigate("/settings")}
          disabled={noneSelected}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl text-base font-medium disabled:opacity-30 active:opacity-80 transition-opacity"
        >
          {noneSelected ? "Select a category to continue" : "Next — Game Settings"}
        </button>
      </div>
    </div>
  );
}
