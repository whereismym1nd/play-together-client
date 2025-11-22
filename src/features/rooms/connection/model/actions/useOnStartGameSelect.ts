import { useEffect } from "react";
import { useRoomConnection } from "../RoomConnectionProvider";

export const useOnStartGameSelect = (handler: () => void) => {
  const { socket, room } = useRoomConnection();
  useEffect(() => {
    if (!socket || !room?.id) return;
    socket.on("room:startGameSelect", handler);
    return () => {
      socket.off("room:startGameSelect", handler);
    };
  }, [socket, room?.id, handler]);
};
