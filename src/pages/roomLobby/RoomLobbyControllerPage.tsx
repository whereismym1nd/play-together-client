import { useRoomConnection, useRoomStart } from "@/features/rooms";
import { Button } from "@/shared/ui";
import { type FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export const RoomLobbyControllerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [nameInput, setNameInput] = useState("");
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const { room, socket, playerName, setPlayerName, isHost, setIsReady, error } = useRoomConnection();
  const { startRoom, isStarting, error: startError } = useRoomStart();

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
    startRoom();
  };

  const openEdit = (playerId: string, currentName?: string) => {
    setEditPlayerId(playerId);
    setEditValue(currentName ?? "");
    setEditError(null);
  };

  const closeEdit = () => {
    setEditPlayerId(null);
    setEditValue("");
    setEditError(null);
  };

  const submitEdit = () => {
    if (!socket || !room || !editPlayerId) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError("Имя не может быть пустым");
      return;
    }

    socket.emit(
      "player:rename",
      { roomId: room.id, name: trimmed },
      (response?: { success?: boolean; message?: string }) => {
        if (response?.success) {
          if (editPlayerId === socket.id) {
            setPlayerName(trimmed);
          }
          closeEdit();
        } else if (response?.message) {
          setEditError(response.message);
        } else {
          setEditError("Не удалось обновить имя");
        }
      },
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
          <p>{isHost ? "Вы хост" : "Вы игрок"}</p>

          <section>
            <h2>Игроки</h2>
            <ul>
              {room.players.map((player) => (
                <li key={player.id}>
                  {player.name ?? "Без имени"}
                  {player.role === "host" ? " (хост)" : ""}
                  {player.id === socket?.id ? " — это вы" : ""}
                  {player.ready ? " ✅" : " ⏳"}
                  {player.id === socket?.id && (
                    <Button
                      type="secondary"
                      onClick={() => openEdit(player.id, player.name)}
                    >
                      Редактировать
                    </Button>
                  )}
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
                Начать
              </Button>
              {startError && <p>{startError}</p>}
              {!everyoneReady && <p>Не все готовы (кроме хоста) — дождитесь галочек.</p>}
            </section>
          )}
        </>
      )}
      {editPlayerId ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#0c121c",
              color: "#e5e7eb",
              padding: "16px",
              borderRadius: 8,
              minWidth: 280,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>Изменить имя</div>
            <input
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
              placeholder="Новое имя"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#e5e7eb",
              }}
            />
            {editError ? (
              <div style={{ color: "#f87171", fontSize: 12 }}>{editError}</div>
            ) : null}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button type="secondary" onClick={closeEdit}>
                Отмена
              </Button>
              <Button type="secondary" onClick={submitEdit}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
