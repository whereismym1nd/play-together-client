import { MainController } from "@/features";
import { useGameSelectControls, useRoomConnection } from "@/features/rooms";

export const GameSelectControllerPage = () => {
  const { sendMove, confirm } = useGameSelectControls();
  const { isHost } = useRoomConnection();

  if (!isHost) {
    return <div>Только ведущий может управлять выбором игры.</div>;
  }

  return (
    <div>
      <h1>Управляй выбором игры</h1>
      <MainController onDirection={sendMove} onConfirm={confirm} />
    </div>
  );
};
