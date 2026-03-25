import React, { createContext, useContext, useState } from "react";

export interface Player {
  id: string;
  name: string;
  role: "word-master" | "impostor";
  revealed: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  word: string;
  category: string;
  impostorCount: number;
  impostorKnowsCategory: boolean;
  phase: "home" | "setup" | "playing" | "results";
}

export interface SetupDraft {
  playerCount: number;
  playerNames: string[];
  selectedCategories: string[];
  impostorCount: number;
  impostorKnowsCategory: boolean;
}

interface GameContextType {
  game: GameState;
  setupDraft: SetupDraft;
  setPlayerCount: (count: number) => void;
  setPlayerNames: (names: string[]) => void;
  setSelectedCategories: (cats: string[]) => void;
  setImpostorCount: (count: number) => void;
  setImpostorKnowsCategory: (val: boolean) => void;
  createGame: () => void;
  hydrateGame: (state: GameState) => void;
  revealPlayer: (playerId: string) => void;
  resetGame: () => void;
  endGame: () => void;
}

export const WORD_BANK: Record<string, string[]> = {
  "Countries & Capitals": [
    // Countries
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia",
    "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Ecuador", "Egypt", "Estonia",
    "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
    "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Libya",
    "Lithuania", "Luxembourg", "Malaysia", "Maldives", "Malta", "Mexico", "Moldova", "Monaco",
    "Mongolia", "Morocco", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway",
    "Oman", "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia",
    "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela",
    "Vietnam", "Yemen", "Zimbabwe",
    // Capitals
    "Kabul", "Tirana", "Algiers", "Andorra la Vella", "Luanda", "Buenos Aires", "Yerevan",
    "Canberra", "Vienna", "Baku", "Manama", "Dhaka", "Minsk", "Brussels", "Sucre", "Sarajevo",
    "Brasília", "Sofia", "Phnom Penh", "Yaoundé", "Ottawa", "Santiago", "Beijing", "Bogotá",
    "Zagreb", "Havana", "Nicosia", "Prague", "Copenhagen", "Quito", "Cairo", "Tallinn",
    "Addis Ababa", "Helsinki", "Paris", "Tbilisi", "Berlin", "Accra", "Athens", "Guatemala City",
    "Budapest", "Reykjavik", "New Delhi", "Jakarta", "Tehran", "Baghdad", "Dublin", "Jerusalem",
    "Rome", "Tokyo", "Amman", "Nur-Sultan", "Nairobi", "Kuwait City", "Riga", "Beirut",
    "Tripoli", "Vilnius", "Luxembourg City", "Kuala Lumpur", "Malé", "Valletta", "Mexico City",
    "Chișinău", "Monaco", "Ulaanbaatar", "Rabat", "Naypyidaw", "Kathmandu", "Amsterdam",
    "Wellington", "Abuja", "Oslo", "Muscat", "Islamabad", "Panama City", "Asunción", "Lima",
    "Manila", "Warsaw", "Lisbon", "Doha", "Bucharest", "Moscow", "Riyadh", "Dakar", "Belgrade",
    "Singapore", "Bratislava", "Ljubljana", "Mogadishu", "Pretoria", "Seoul", "Madrid",
    "Colombo", "Khartoum", "Stockholm", "Bern", "Damascus", "Taipei", "Dodoma", "Bangkok",
    "Tunis", "Ankara", "Kyiv", "Abu Dhabi", "London", "Washington D.C.", "Montevideo",
    "Caracas", "Hanoi", "Sanaa", "Harare",
  ],
  "Places": [
    "مقهى", "مطعم", "صيدلية", "مستشفى", "مدرسة", "جامعة", "مسجد", "كنيسة", "ملعب",
    "مسبح", "قاعة رياضة", "سينما", "مكتبة", "مطار", "محطة قطار", "محطة حافلات",
    "فندق", "بنك", "مركز شرطة", "محكمة", "سوبرماركت", "سوق شعبي", "مخبزة",
    "صالون حلاقة", "صالون تجميل", "ميناء", "مصنع", "مكتب", "شركة", "مركز تجاري",
    "حديقة", "حديقة حيوانات", "متحف", "معرض", "شاطئ", "صحراء", "جبل", "غابة",
    "موقف سيارات", "ورشة ميكانيك", "محطة وقود", "مدرسة قيادة", "حضانة",
    "قاعة حفلات", "قاعة أفراح", "مسرح", "استوديو تصوير", "استوديو تسجيل", "مخزن",
  ],
  "Objects": [
    "هاتف", "حاسوب", "لابتوب", "سماعات", "ميكروفون", "كاميرا", "تلفاز", "ريموت",
    "ثلاجة", "غسالة", "مكيف", "مروحة", "مصباح", "كرسي", "طاولة", "سرير",
    "وسادة", "بطانية", "ساعة", "نظارات", "حقيبة", "محفظة", "قلم", "دفتر",
    "كتاب", "سبورة", "طبشور", "ممحاة", "ملعقة", "شوكة", "سكين", "صحن",
    "كأس", "قارورة", "إبريق", "قدر", "مقلاة", "فرشاة أسنان", "معجون أسنان",
    "صابون", "منشفة", "مرآة", "مظلة", "مفاتيح", "سيارة", "دراجة", "خوذة",
    "حقيبة سفر", "شاحن", "USB", "بطارية", "لعبة", "كرة", "جهاز تحكم",
    "روبوت", "طابعة", "سكانر", "شاشة", "لوحة مفاتيح", "فأرة",
  ],
};

const defaultGame: GameState = {
  gameId: "",
  players: [],
  word: "",
  category: "",
  impostorCount: 1,
  impostorKnowsCategory: false,
  phase: "home",
};

const defaultDraft: SetupDraft = {
  playerCount: 4,
  playerNames: [],
  selectedCategories: ["Places"],
  impostorCount: 1,
  impostorKnowsCategory: false,
};

const GameContext = createContext<GameContextType | null>(null);

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function pickWord(categories: string[]): { word: string; category: string } {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_BANK[cat] || [];
  const word = words[Math.floor(Math.random() * words.length)];
  return { word, category: cat };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<GameState>(defaultGame);
  const [setupDraft, setSetupDraft] = useState<SetupDraft>(defaultDraft);

  const setPlayerCount = (count: number) =>
    setSetupDraft((p) => ({ ...p, playerCount: count }));

  const setPlayerNames = (names: string[]) =>
    setSetupDraft((p) => ({ ...p, playerNames: names }));

  const setSelectedCategories = (cats: string[]) =>
    setSetupDraft((p) => ({ ...p, selectedCategories: cats }));

  const setImpostorCount = (count: number) =>
    setSetupDraft((p) => ({ ...p, impostorCount: count }));

  const setImpostorKnowsCategory = (val: boolean) =>
    setSetupDraft((p) => ({ ...p, impostorKnowsCategory: val }));

  const createGame = () => {
    const { playerNames, selectedCategories, impostorCount, impostorKnowsCategory } = setupDraft;
    const { word, category } = pickWord(selectedCategories);

    const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
    const players: Player[] = shuffled.map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      role: index < impostorCount ? "impostor" : "word-master",
      revealed: false,
    }));
    const reshuffled = [...players].sort(() => Math.random() - 0.5);

    setGame({
      gameId: generateGameId(),
      players: reshuffled,
      word,
      category,
      impostorCount,
      impostorKnowsCategory,
      phase: "playing",
    });
  };

  const hydrateGame = (state: GameState) => setGame(state);

  const revealPlayer = (playerId: string) => {
    setGame((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, revealed: true } : p
      ),
    }));
  };

  const endGame = () =>
    setGame((prev) => ({ ...prev, phase: "results" }));

  const resetGame = () => {
    setGame(defaultGame);
    setSetupDraft(defaultDraft);
  };

  return (
    <GameContext.Provider
      value={{
        game,
        setupDraft,
        setPlayerCount,
        setPlayerNames,
        setSelectedCategories,
        setImpostorCount,
        setImpostorKnowsCategory,
        createGame,
        hydrateGame,
        revealPlayer,
        resetGame,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}