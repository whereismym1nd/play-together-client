import { QRCodeConnection } from "../../widgets/qrCodeRoom/QRCodeConnection";
import { useRoomConnection } from "@/features/rooms";

export const RoomLobbyScreenPage = () => {
  const { room } = useRoomConnection();

  return (
    <div>
      {room && (
        <>
          <QRCodeConnection value={room.id} />
          <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 14 }}>
            {room.players.map((player, index) => {
              const isOffline = player.offline === true;
              const statusLabel =
                player.role === "screen"
                  ? "экран"
                  : player.ready
                    ? "готов"
                    : isOffline
                      ? "оффлайн"
                      : "не готов";
              const color =
                player.role === "screen"
                  ? "#3b82f6"
                  : player.ready
                    ? "#10b981"
                    : isOffline
                      ? "#9ca3af"
                      : "#f59e0b";

              return (
                <div
                  key={player.id ?? `${player.role}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontWeight: 600 }}>
                    {player.name ?? "Без имени"}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>
                    {player.role}
                  </div>
                  <div style={{ marginLeft: "auto", color, fontWeight: 600, fontSize: 12 }}>
                    {statusLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!room && <div>Загрузка...</div>}
    </div>
  );
};
