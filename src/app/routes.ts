import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { HomeScreen } from "./components/HomeScreen";
import { PlayerCountScreen } from "./components/PlayerCountScreen";
import { PlayerNamesScreen } from "./components/PlayerNamesScreen";
import { CategorySelectScreen } from "./components/CategorySelectScreen";
import { GameSettingsScreen } from "./components/GameSettingsScreen";
import { GameCreatedScreen } from "./components/GameCreatedScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultsScreen } from "./components/ResultsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomeScreen },
      { path: "players", Component: PlayerCountScreen },
      { path: "names", Component: PlayerNamesScreen },
      { path: "categories", Component: CategorySelectScreen },
      { path: "settings", Component: GameSettingsScreen },
      { path: "created", Component: GameCreatedScreen },
      // roomId is in the URL — this IS the shareable link
      { path: "game/:roomId", Component: GameScreen },
      { path: "results/:roomId", Component: ResultsScreen },
    ],
  },
]);
