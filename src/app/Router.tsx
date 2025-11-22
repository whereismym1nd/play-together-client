import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameScreenPage } from "../pages/game/gameScreenPage";
import { GameControllerPage } from "../pages/game/gameControllerPage";
import { MainPage } from "../pages/main/MainPage";
import { RoomLobbyControllerPage } from "../pages/roomLobby/RoomLobbyControllerPage";
import { ControllerRoomLayout, ScreenRoomLayout } from "../features/rooms/connection/ui/RoomLayouts";
import { RoomLobbyScreenPage } from "../pages/roomLobby/roomLobbyScreenPage";
import { GameSelectControllerPage, GameSelectScreenPage } from "@/pages";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route element={<ScreenRoomLayout />}>
          <Route path="/room/:roomId" element={<RoomLobbyScreenPage />} />
          <Route path="/room/:roomId/select-game" element={<GameSelectScreenPage />} />
          <Route path="/game/:roomId/:game" element={<GameScreenPage />} />
        </Route>
        <Route element={<ControllerRoomLayout />}>
          <Route path="/room/:roomId/controller" element={<RoomLobbyControllerPage />} />
          <Route path="/room/:roomId/select-game/controller" element={<GameSelectControllerPage />} />
          <Route path="/game/:roomId/:game/controller" element={<GameControllerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
