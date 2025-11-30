import "./roomDevBox.scss";
import type { Socket } from "socket.io-client";
import type { Role } from "../../../../../shared/types/gameTypes";
import type { Room, RoomStage } from "../../../../../shared/types";

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

export function RoomDevBox({
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

  return (
    <div className="room-dev-box">
      <div className="room-dev-box__title">room debug</div>
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
      <div className="room-dev-box__players">
        {playerLines.map((line) => (
          <div key={line.key}>{line.text}</div>
        ))}
      </div>
      {error ? <div className="room-dev-box__error">error: {error}</div> : null}
    </div>
  );
}
