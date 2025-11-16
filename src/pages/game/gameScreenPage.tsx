// src/app/pages/GameScreenPage.tsx
import { useParams, useSearchParams } from "react-router-dom";
import { gamesMapById } from "../../games";

export function GameScreenPage() {
  const { game } = useParams<{ game: string }>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "DEBUG_ROOM";

  if (!game) return <div>Не указана игра</div>;

  // типизация: game as GameId, если нужно
  const descriptor = gamesMapById[game as keyof typeof gamesMapById];

  if (!descriptor) {
    return <div>Игра "{game}" не найдена</div>;
  }

  const Screen = descriptor.Screen;
  return <Screen roomId={roomId} />;
}
