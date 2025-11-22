
import { useCallback, useState } from "react";
import { useRoomConnection } from "../RoomConnectionProvider";

type StartRoomResponse = {
  success?: boolean;
  message?: string;
  nextRoute?: string;
};

type UseRoomStartResult = {
  startRoom: (onSuccess?: (nextRoute?: string) => void) => void;
  isStarting: boolean;
  error: string | null;
};

const DEFAULT_ERROR = "Не удалось запустить комнату";

export function useRoomStart(): UseRoomStartResult {
  const { room, socket } = useRoomConnection();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRoom = useCallback(
    (onSuccess?: () => void) => {
      if (!room || !socket) {
        setError(DEFAULT_ERROR);
        return;
      }

      setIsStarting(true);
      setError(null);

      socket.emit(
        "room:start",
        { roomId: room.id },
        (response?: StartRoomResponse) => {
          if (response?.success) {
            onSuccess?.();
          } else {
            setError(response?.message ?? DEFAULT_ERROR);
          }
          setIsStarting(false);
        },
      );
    },
    [room, socket],
  );

  return { startRoom, isStarting, error };
}
