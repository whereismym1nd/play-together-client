import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import type { Role } from "../../../../shared/types/gameTypes";
import type { Room } from "../../../../shared/types";
import { useRoomSocket } from "./useRoomSocket";
import { usePlayerReady } from "./actions/usePlayerReady";

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
  const resolvedRoomId = room?.id ?? roomId;

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
      roomId: resolvedRoomId,
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
      <RoomDevBox
        role={role}
        room={room}
        roomId={resolvedRoomId}
        playerName={playerName}
        socket={socket}
        isHost={isHost}
        isReady={isReady}
        error={error}
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

type RoomDevBoxProps = {
  role: Role;
  room: Room | null;
  roomId?: string;
  playerName?: string;
  socket: Socket | null;
  isHost: boolean;
  isReady: boolean;
  error: string | null;
};

function RoomDevBox({
  role,
  room,
  roomId,
  playerName,
  socket,
  isHost,
  isReady,
  error,
}: RoomDevBoxProps) {
  const players = room?.players ?? [];
  const placeholder = "-";
  const resolvedRoomId = room?.id ?? roomId ?? placeholder;
  const connectionState = socket ? (socket.connected ? "connected" : "connecting") : "idle";
  const playerLines = players.length
    ? players.map((player) => {
        const isYou = player.id === socket?.id;
        const isScreen = player.id === room?.screenId;
        const ready = player.ready ? "ready" : "not ready";
        const name = player.name ?? placeholder;

        return `${player.role}${isYou ? " (you)" : ""}${isScreen ? " [screen]" : ""}: ${name} (${ready})`;
      })
    : ["no players"];

  const boxStyle: CSSProperties = {
    position: "fixed",
    top: 12,
    right: 12,
    padding: "8px 10px",
    background: "rgba(12, 18, 28, 0.9)",
    color: "#e5e7eb",
    fontFamily: "Menlo, Consolas, Monaco, monospace",
    fontSize: 10,
    lineHeight: 1.5,
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    zIndex: 9999,
    maxWidth: 260,
    pointerEvents: "none",
  };

  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>room debug</div>
      <div>role: {role}</div>
      <div>connection: {connectionState}</div>
      <div>socket: {socket?.id ?? placeholder}</div>
      <div>roomId: {resolvedRoomId}</div>
      <div>game: {room?.gameType ?? placeholder}</div>
      <div>playerName: {playerName ?? placeholder}</div>
      <div>host: {isHost ? "yes" : "no"}</div>
      <div>ready: {isReady ? "yes" : "no"}</div>
      <div>players:</div>
      <div style={{ marginLeft: 8, whiteSpace: "pre-wrap" }}>
        {playerLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      {error ? <div style={{ color: "#f87171" }}>error: {error}</div> : null}
    </div>
  );
}
