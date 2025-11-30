import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Room } from "../../../../shared/types";
import type { Role } from "../../../../shared/types/gameTypes";
import { CONFIG } from "../../../../shared/config/config";

type UseRoomSocketOptions = {
  name?: string;
};

export function useRoomSocket(
  role: Role,
  roomId?: string,
  options: UseRoomSocketOptions = {},
) {
  const { name } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomIdRef = useRef(roomId);
  const latestNameRef = useRef(name);

  useEffect(() => {
    console.log(room);
  }, [room])


  useEffect(() => {
    if (roomId && roomIdRef.current !== roomId) {
      roomIdRef.current = roomId;
      setHasJoined(false);
    }
  }, [roomId]);

  useEffect(() => {
    latestNameRef.current = name;
    if (!name) {
      setHasJoined(false);
    }
  }, [name]);

  useEffect(() => {
    const s = io(CONFIG.SOCKET_URL, {
      auth: {
        sessionId: localStorage.getItem('sessionId') ?? undefined,
        roomId: roomIdRef.current,
      },
    });
    setSocket(s);

    s.on("connect", () => {
      const currentName = latestNameRef.current;
      const payload: { name: string; roomId?: string } = {
        name: role === "screen" ? currentName ?? "TV" : currentName ?? "Controller",
      };
      if (roomIdRef.current) {
        payload.roomId = roomIdRef.current;
      }

      if (role === "screen") {
        s.emit("room:create", payload);
      }
    });

    s.on('session', ({ sessionId }) => {
      localStorage.setItem('sessionId', sessionId);
      s.auth = { sessionId };
    });

    s.on("room:created", setRoom);
    s.on("room:update", setRoom);

    return () => {
      s.off("room:created", setRoom);
      s.off("room:update", setRoom);
      s.disconnect();
      setHasJoined(false);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "controller") return;
    if (!socket || !socket.connected) return;
    if (!roomIdRef.current) return;
    if (hasJoined) return;
    const controllerName = name ?? latestNameRef.current ?? "Controller";

    socket.emit(
      "room:join",
      {
        roomId: roomIdRef.current,
        name: controllerName,
      },
      (response?: { success: boolean; message?: string }) => {
        if (response?.success) {
          // Joined successfully
        } else {
          setHasJoined(false);
          setError(response?.message ?? "Комната не найдена")
        }
      });
    setHasJoined(true);
  }, [role, socket, name, hasJoined, roomId]);

  return { socket, room, error };
}
