import { QRCodeConnection } from "../../widgets/qrCodeRoom/QRCodeConnection";
import { useRoomConnection } from "../../features/rooms/RoomConnectionProvider";

export const RoomLobbyScreenPage = () => {
  const { room } = useRoomConnection();

  return (
    <div>
      {room && (
        <>
          <QRCodeConnection value={room.id} />
          <div>
            {room.players.map((player) => (
              <div key={player.id}>
                {player.name} {player.role} {player.ready ? "готов" : "не готов"}
              </div>
            ))}
          </div>
        </>
      )}
      {!room && <div>фыв...</div>}
    </div>
  );
};
