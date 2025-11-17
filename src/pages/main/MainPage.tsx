import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/button/btn";

export const MainPage = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/room/new");
  };

  return (
    <>
      <Button type="secondary" onClick={handleCreateRoom}>
        Создать комнату
      </Button>
    </>
  );
};
