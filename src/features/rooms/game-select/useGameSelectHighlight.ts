import { useCallback, useEffect, useRef, useState } from "react";
import { useRoomConnection } from "../connection/model/RoomConnectionProvider";
import type { MoveDirection } from "./useGameSelectControls";

type UseGameSelectHighlightParams = {
  itemCount: number;
  onConfirm?: (index: number) => void;
};

export const useGameSelectHighlight = ({ itemCount, onConfirm }: UseGameSelectHighlightParams) => {
  const { socket } = useRoomConnection();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (itemCount === 0) {
      setSelectedIndex(0);
      return;
    }
    if (selectedIndex >= itemCount) {
      setSelectedIndex(itemCount - 1);
    }
  }, [itemCount, selectedIndex]);

  const moveCursor = useCallback(
    (direction: MoveDirection) => {
      console.log(direction);

      if (itemCount === 0) return;
      setSelectedIndex((prev) => {
        const last = itemCount - 1;
        if (direction === "up" || direction === "left") {
          return Math.max(0, prev - 1);
        }
        if (direction === "down" || direction === "right") {
          return Math.min(last, prev + 1);
        }
        return prev;
      });
    },
    [itemCount],
  );

  useEffect(() => {
    if (!socket) return;
    const handleMove = ({ direction }: { direction: MoveDirection }) => moveCursor(direction);
    const handleConfirm = () => onConfirm?.(selectedIndexRef.current);

    socket.on("gameSelect:move", handleMove);
    socket.on("gameSelect:confirm", handleConfirm);

    return () => {
      socket.off("gameSelect:move", handleMove);
      socket.off("gameSelect:confirm", handleConfirm);
    };
  }, [socket, moveCursor, onConfirm]);

  return { selectedIndex, setSelectedIndex };
};
