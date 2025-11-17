import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import type { Role } from "../../shared/types/gameTypes";
import type { Room } from "../../shared/types/_index";
import { useRoomSocket } from "./useRoomSocket";
import { usePlayerReady } from "./usePlayerReady";

type RoomConnectionContextValue = {
  room: Room | null;
  error: string | null;
  socket: Socket | null;
  playerName?: string;
  setPlayerName: (name: string | undefined) => void;
  isHost: boolean;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
};

const RoomConnectionContext = createContext<RoomConnectionContextValue | null>(null);

type RoomConnectionProviderProps = {
  role: Role;
  roomId?: string;
  children: ReactNode;
  initialName?: string;
};

export function RoomConnectionProvider({
  role,
  roomId,
  children,
  initialName,
}: RoomConnectionProviderProps) {
  const [playerName, setPlayerName] = useState<string | undefined>(initialName);
  const [isReady, setIsReady] = useState<boolean>(false);
  const { room, socket, error } = useRoomSocket(role, roomId, { name: playerName });
  usePlayerReady({ role, socket, roomId: room?.id ?? roomId, isReady });

  const isHost = useMemo(() => {
    if (!room || !socket?.id) return false;
    return room.players.some(
      (player) => player.id === socket.id && player.role === "host",
    );
  }, [room, socket?.id]);

  const value = useMemo<RoomConnectionContextValue>(
    () => ({
      room,
      error,
      socket,
      playerName,
      setPlayerName,
      isHost,
      isReady,
      setIsReady,
    }),
    [room, socket, playerName, isHost, isReady, error],
  );

  return (
    <RoomConnectionContext.Provider value={value}>
      {children}
    </RoomConnectionContext.Provider>
  );
}

export function useRoomConnection() {
  const context = useContext(RoomConnectionContext);
  if (!context) {
    throw new Error("useRoomConnection must be used within RoomConnectionProvider");
  }
  return context;
}
