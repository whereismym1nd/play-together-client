import { useParams, useSearchParams } from "react-router-dom";
import { gamesMapById } from "../../games";


export function GameControllerPage() {
  const { game } = useParams<{ game: string }>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "DEBUG_ROOM";

  if (!game) return <div>Не указана игра</div>;

  const descriptor = gamesMapById[game as keyof typeof gamesMapById];
  if (!descriptor) {
    return <div>Контроллер для игры "{game}" не найден</div>;
  }

  const Controller = descriptor.Controller;
  return <Controller roomId={roomId} />;
}
