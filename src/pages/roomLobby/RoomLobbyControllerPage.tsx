import { type FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainController } from "../../features";
import { useRoomConnection } from "../../features/rooms/RoomConnectionProvider";
import { Button } from "../../shared/ui/button/btn";

export const RoomLobbyControllerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState("");
  const { room, socket, playerName, setPlayerName, isHost, setIsReady, error } = useRoomConnection();

  const everyoneReady = useMemo(() => {
    if (!room) return false;
    return room.players
      .filter((player) => player.role !== "screen")
      .every((player) => player.ready);
  }, [room]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setPlayerName(trimmed);
  };

  const handleStart = () => {
    if (!room || !socket) return;

    socket.emit(
      "room:start",
      { roomId: room.id },
      (response?: { success?: boolean; message?: string; nextRoute?: string }) => {
        if (response?.success) {
          const target = response.nextRoute || `/room/${room.id}/select-game`;
          navigate(target);
        } else {
          alert(response?.message ?? "Не все участники готовы");
        }
      }
    );
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
          Ваше имя
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Player 1"
          />
        </label>
        <button type="submit" disabled={!nameInput.trim()}>
          Подключиться
        </button>
      </form>
    );
  }

  return (
    <div>
      <h1>Комната {room?.id ?? roomId}</h1>
      {!room && <p>Подключаемся к комнате...</p>}
      {room && (
        <>
          <p>
            Вы {isHost ? "хост — можете выбирать игру" : "участник — ждите выбор игры"}
          </p>

          <section>
            <h2>Участники</h2>
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
              <MainController />
              <Button
                type="secondary"
                onClick={handleStart}
                isDisabled={!everyoneReady}
              >
                Старт
              </Button>
              {!everyoneReady && <p>Все участники должны подтвердить готовность.</p>}
            </section>
          )}
        </>
      )}
    </div>
  );
};
