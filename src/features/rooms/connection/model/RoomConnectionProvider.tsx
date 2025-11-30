import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import type { Role } from "../../../../shared/types/gameTypes";
import type { Room, RoomStage } from "../../../../shared/types";
import { useRoomSocket } from "./useRoomSocket";
import { usePlayerReady } from "./actions/usePlayerReady";
import { RoomDevBox } from "../ui/roomDevBox/RoomDevBox";

type RoomConnectionContextValue = {
  room: Room | null;
  error: string | null;
  socket: Socket | null;
  roomId?: string;
  playerName?: string;
  setPlayerName: (name: string | undefined) => void;
  isHost: boolean;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  stage: RoomStage;
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
  const [stage, setStage] = useState<RoomStage>("lobby");
  const { room, socket, error } = useRoomSocket(role, roomId, { name: playerName });
  usePlayerReady({ role, socket, roomId: room?.id ?? roomId, isReady });
  const resolvedRoomId = room?.id ?? roomId;

  useEffect(() => {
    if (playerName) return;
    if (!room || !socket?.id) return;
    const me = room.players.find((p) => p.id === socket.id);
    if (me?.name) {
      setPlayerName(me.name);
    }
  }, [room, socket?.id, playerName]);

  const isHost = useMemo(() => {
    if (!room || !socket?.id) return false;
    return room.players.some(
      (player) => player.id === socket.id && player.role === "host",
    );
  }, [room, socket?.id]);

  useEffect(() => {
    if (!socket) return;
    const handleStartSelect = () => setStage("select");
    socket.on("room:startGameSelect", handleStartSelect);
    return () => {
      socket.off("room:startGameSelect", handleStartSelect);
    };
  }, [socket]);

  useEffect(() => {
    if (room?.stage) {
      setStage(room.stage);
      return;
    }

    if (room?.gameType) {
      setStage("game");
    } else if (room) {
      setStage((prev) => (prev === "game" ? "lobby" : prev));
    }
  }, [room?.stage, room?.gameType, room]);

  const value = useMemo<RoomConnectionContextValue>(
    () => ({
      room,
      error,
      socket,
      roomId: resolvedRoomId,
      playerName,
      setPlayerName,
      isHost,
      isReady,
      setIsReady,
      stage,
    }),
    [room, socket, playerName, isHost, isReady, error, stage],
  );

  return (
    <RoomConnectionContext.Provider value={value}>
      {children}
      <RoomDevBox
        role={role}
        room={room}
        roomId={resolvedRoomId}
        playerName={playerName}
        socket={socket}
        isHost={isHost}
        isReady={isReady}
        error={error}
        stage={stage}
      />
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
