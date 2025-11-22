import { useNavigate, useParams } from "react-router-dom";
import { gamesMapById } from "../../games";
import { useGameSelectHighlight, useRoomConnection } from "@/features/rooms";

export const GameSelectScreenPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, room, isHost } = useRoomConnection();
  const navigate = useNavigate();
  const games = Object.values(gamesMapById);

  const handleSelect = (gameId: string) => {
    if (!socket || !roomId) return;
    socket.emit("room:selectGame", { roomId, gameId }, (res?: { success?: boolean }) => {
      if (res?.success !== false) navigate(`/game/${gameId}?room=${roomId}`);
    });
  };

  const { selectedIndex, setSelectedIndex } = useGameSelectHighlight({
    itemCount: games.length,
    onConfirm: (index) => {
      const game = games[index];
      if (game) handleSelect(game.id);
    },
  });

  return (
    <div>
      <h1>Выбор игры для комнаты {room?.id ?? roomId}</h1>
      <ul>
        {games.map(({ id, name }, idx) => (
          <li key={id}>
            <button
              onClick={() => {
                setSelectedIndex(idx);
                handleSelect(id);
              }}
              aria-pressed={selectedIndex === idx}
            >
              {selectedIndex === idx ? "👉 " : ""}
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
