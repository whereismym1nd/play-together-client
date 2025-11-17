import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Room } from "../../shared/types/_index";
import type { Role } from "../../shared/types/gameTypes";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

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
    const s = io(SOCKET_URL);
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
    if (!roomIdRef.current || !name) return;
    if (hasJoined) return;

    socket.emit("room:join", {
      roomId: roomIdRef.current,
      name,
    }, (response?: { success: boolean; message?: string }) => {
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
