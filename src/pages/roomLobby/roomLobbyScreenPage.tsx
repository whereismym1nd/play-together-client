import { useNavigate, useParams } from "react-router-dom";
import { QRCodeConnection } from "../../widgets/qrCodeRoom/QRCodeConnection";
import { useOnStartGameSelect, useRoomConnection } from "@/features/rooms";

export const RoomLobbyScreenPage = () => {
  const { room } = useRoomConnection();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  useOnStartGameSelect(() => navigate(`/room/${roomId}/select-game`));


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
