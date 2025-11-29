import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { gamesMapById } from "../../games";
import { useGameSelectHighlight, useRoomConnection } from "@/features/rooms";

export const GameSelectScreenPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, room } = useRoomConnection();
  const [error, setError] = useState<string | null>(null);
  const games = useMemo(() => Object.values(gamesMapById), []);
  const targetRoomId = room?.id ?? roomId;

  const handleSelect = (gameId: string) => {
    if (!socket || !targetRoomId) return;
    setError(null);
    socket.emit(
      "room:selectGame",
      { roomId: targetRoomId, gameId },
      (res?: { success?: boolean; message?: string }) => {
        if (res?.success === false) {
          setError(res.message ?? "Failed to select game");
        }
      },
    );
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
      <h1>Game selection for room {room?.id ?? roomId}</h1>
      {error ? <div style={{ color: "red" }}>{error}</div> : null}
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
              {selectedIndex === idx ? "> " : ""}
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
