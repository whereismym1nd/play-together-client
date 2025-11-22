import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { type Role } from "../../shared/types/gameTypes";
import { CONFIG } from "../../shared/config/config";

export function useGameSocket(roomId: string, gameId: string, role: Role) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(CONFIG.SOCKET_URL);
    setSocket(s);

    s.on("connect", () => {
      const name = role === "screen" ? "TV" : "Player";

      if (role === "screen") {
        s.emit("room:create", {
          roomId,
          name,
        });
      }

      s.emit("room:join", {
        roomId,
        role,
        game: gameId,
        name,
      });
    });

    return () => {
      s.disconnect();
    };
  }, [roomId, role, gameId]);

  return socket;
}
