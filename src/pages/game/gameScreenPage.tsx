import { useParams } from "react-router-dom";
import { useRoomConnection } from "@/features/rooms";
import { gamesMapById } from "../../games";

export function GameScreenPage() {
  const { roomId: roomIdParam, game: gameParam } = useParams<{ roomId?: string; game?: string }>();
  const { room } = useRoomConnection();

  const roomId = room?.id ?? roomIdParam ?? "DEBUG_ROOM";
  const gameId = gameParam ?? room?.gameType;

  if (!gameId) return <div>Игра не выбрана</div>;

  const descriptor = gamesMapById[gameId as keyof typeof gamesMapById];

  if (!descriptor) {
    return <div>Игра "{gameId}" не найдена</div>;
  }

  const Screen = descriptor.Screen;
  return <Screen roomId={roomId} />;
}
