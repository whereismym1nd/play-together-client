import { useCallback, useMemo } from "react";
import { gamesMapById } from "@/games";
import { useRoomConnection } from "../connection/model/RoomConnectionProvider";
import { useGameSelectHighlight } from "./useGameSelectHighlight";

export type MoveDirection = "left" | "right" | "up" | "down";

export const useGameSelectControls = () => {
  const { socket, room, roomId } = useRoomConnection();
  const games = useMemo(() => Object.values(gamesMapById), []);
  const { selectedIndex } = useGameSelectHighlight({ itemCount: games.length });
  const sendMove = useCallback(
    (direction: MoveDirection) => {

      const targetRoomId = room?.id ?? roomId;

      console.log(targetRoomId);
      if (socket && targetRoomId) {
        console.log('emit');

        socket.emit("gameSelect:move", { roomId: targetRoomId, direction });
      }
    },
    [socket, room?.id, roomId],
  );
  const confirm = useCallback(() => {
    const targetRoomId = room?.id ?? roomId;
    const selectedGame = games[selectedIndex];
    if (socket && targetRoomId && selectedGame) {
      socket.emit("gameSelect:confirm", {
        roomId: targetRoomId,
        gameType: selectedGame.id,
      });
    }
  }, [socket, room?.id, roomId, games, selectedIndex]);
  return { sendMove, confirm };
};
