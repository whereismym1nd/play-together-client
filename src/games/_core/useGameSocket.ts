import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { type Role } from "../../shared/types/gameTypes";

const DEFAULT_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? DEFAULT_URL;

export function useGameSocket(roomId: string, gameId: string, role: Role) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL);
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
