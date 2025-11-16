import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameScreenPage } from "../pages/game/gameScreenPage";
import { GameControllerPage } from "../pages/game/gameControllerPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/game/:game/screen" element={<GameScreenPage />} />
        <Route path="/game/:game/controller" element={<GameControllerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
