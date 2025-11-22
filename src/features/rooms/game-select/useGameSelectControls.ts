import { useCallback } from "react";
import { useRoomConnection } from "../connection/model/RoomConnectionProvider";

export type MoveDirection = "left" | "right" | "up" | "down";

export const useGameSelectControls = () => {
  const { socket, room, roomId } = useRoomConnection();
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
    if (socket && targetRoomId) socket.emit("gameSelect:confirm", { roomId: targetRoomId });
  }, [socket, room?.id, roomId]);
  return { sendMove, confirm };
};
