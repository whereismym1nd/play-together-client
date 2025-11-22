import type { Role } from "@/shared/types";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";

type UsePlayerReadyParams = {
  role: Role;
  socket: Socket | null;
  roomId?: string;
  isReady: boolean;
};

export function usePlayerReady({
  role,
  socket,
  roomId,
  isReady,
}: UsePlayerReadyParams) {
  useEffect(() => {
    if (role !== "controller") return;
    if (!socket || !socket.connected) return;
    if (!roomId) return;

    socket.emit("player:ready", {
      roomId,
      ready: isReady,
    });
  }, [role, socket, roomId, isReady]);
}
