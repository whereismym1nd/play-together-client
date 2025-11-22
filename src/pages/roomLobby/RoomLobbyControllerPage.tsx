import { useOnStartGameSelect, useRoomConnection, useRoomStart } from "@/features/rooms";
import { Button } from "@/shared/ui";
import { type FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const RoomLobbyControllerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState("");
  const { room, socket, playerName, setPlayerName, isHost, setIsReady, error } = useRoomConnection();
  const { startRoom, isStarting, error: startError } = useRoomStart();
  useOnStartGameSelect(() => navigate(`/room/${roomId}/select-game/controller`));

  const everyoneReady = useMemo(() => {
    if (!room) return false;
    return room.players
      .filter((player) => player.role !== "screen")
      .every((player) => (player.role === "host" ? true : Boolean(player.ready)));
  }, [room]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setPlayerName(trimmed);
  };

  const handleStart = () => {
    startRoom(() => {
      const target = `/room/${room?.id ?? roomId}/select-game/controller`;
      navigate(target);
    });
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!roomId) {
    return <div>Комната не найдена</div>;
  }

  if (!playerName) {
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Введите имя
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Player 1"
          />
        </label>
        <button type="submit" disabled={!nameInput.trim()}>
          Подтвердить
        </button>
      </form>
    );
  }

  return (
    <div>
      <h1>Комната {room?.id ?? roomId}</h1>
      {!room && <p>Комнату ещё создаём...</p>}
      {room && (
        <>
          <p>{isHost ? "Вы хост комнаты" : "Вы участник комнаты"}</p>

          <section>
            <h2>Игроки</h2>
            <ul>
              {room.players.map((player) => (
                <li key={player.id}>
                  {player.name ?? "Без имени"}
                  {player.role === "host" ? " (хост)" : ""}
                  {player.id === socket?.id ? " — это вы" : ""}
                  {player.ready ? " ✅" : " ⏳"}
                </li>
              ))}
            </ul>
            {!isHost && (
              <Button type="secondary" isCheckbox onCheckedChange={setIsReady}>
                Готов
              </Button>
            )}
          </section>

          {isHost && (
            <section>
              <Button
                type="secondary"
                onClick={handleStart}
                isDisabled={!everyoneReady || isStarting}
              >
                Старт
              </Button>
              {startError && <p>{startError}</p>}
              {!everyoneReady && <p>Все игроки (кроме экрана) должны нажать «Готов».</p>}
            </section>
          )}
        </>
      )}
    </div>
  );
};
