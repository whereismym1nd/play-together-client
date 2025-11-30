import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameScreenPage } from "../pages/game/gameScreenPage";
import { GameControllerPage } from "../pages/game/gameControllerPage";
import { MainPage } from "../pages/main/MainPage";
import { RoomLobbyControllerPage } from "../pages/roomLobby/RoomLobbyControllerPage";
import { ControllerRoomLayout, ScreenRoomLayout } from "../features/rooms/connection/ui/RoomLayouts";
import { RoomLobbyScreenPage } from "../pages/roomLobby/roomLobbyScreenPage";
import { GameSelectControllerPage, GameSelectScreenPage } from "@/pages";
import { useRoomConnection } from "@/features/rooms";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route element={<ScreenRoomLayout />}>
          <Route path="/room/:roomId" element={<ScreenRoomStage />} />
        </Route>
        <Route element={<ControllerRoomLayout />}>
          <Route path="/room/:roomId/ctrl" element={<ControllerRoomStage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ScreenRoomStage() {
  const { stage } = useRoomConnection();
  if (stage === "select") return <GameSelectScreenPage />;
  if (stage === "game") return <GameScreenPage />;
  return <RoomLobbyScreenPage />;
}

function ControllerRoomStage() {
  const { stage } = useRoomConnection();
  if (stage === "select") return <GameSelectControllerPage />;
  if (stage === "game") return <GameControllerPage />;
  return <RoomLobbyControllerPage />;
}
