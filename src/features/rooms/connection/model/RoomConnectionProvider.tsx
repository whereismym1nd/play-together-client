import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import type { Role } from "../../../../shared/types/gameTypes";
import type { Room, RoomStage } from "../../../../shared/types";
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

type RoomDevBoxProps = {
  role: Role;
  room: Room | null;
  roomId?: string;
  playerName?: string;
  socket: Socket | null;
  isHost: boolean;
  isReady: boolean;
  error: string | null;
  stage: RoomStage;
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
  stage,
}: RoomDevBoxProps) {
  const players = room?.players ?? [];
  const placeholder = "-";
  const resolvedRoomId = room?.id ?? roomId ?? placeholder;
  const connectionState = socket ? (socket.connected ? "connected" : "connecting") : "idle";
  const playerLines = players.length
    ? players.map((player, index) => {
        const isYou = player.id === socket?.id;
        const isScreen = player.id === room?.screenId;
        const ready = player.ready ? "ready" : "not ready";
        const name = player.name ?? placeholder;
        const key = player.id ?? `${player.role}-${index}`;

        return {
          key,
          text: `${player.role}${isYou ? " (you)" : ""}${isScreen ? " [screen]" : ""}: ${name} (${ready})`,
        };
      })
    : [{ key: "empty", text: "no players" }];

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
      <div>stage: {stage}</div>
      <div>playerName: {playerName ?? placeholder}</div>
      <div>host: {isHost ? "yes" : "no"}</div>
      <div>ready: {isReady ? "yes" : "no"}</div>
      <div>players:</div>
      <div style={{ marginLeft: 8, whiteSpace: "pre-wrap" }}>
        {playerLines.map((line) => (
          <div key={line.key}>{line.text}</div>
        ))}
      </div>
      {error ? <div style={{ color: "#f87171" }}>error: {error}</div> : null}
    </div>
  );
}
