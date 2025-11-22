import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { RoomConnectionProvider, useRoomConnection } from "../model/RoomConnectionProvider";

type RoomRouteParams = {
  roomId?: string;
  game?: string;
};

export function ScreenRoomLayout() {
  const params = useParams<RoomRouteParams>();
  const [searchParams] = useSearchParams();
  const routeRoomId = params.roomId;
  const queryRoomId = searchParams.get("room") ?? undefined;
  const effectiveRoomId =
    routeRoomId && routeRoomId !== "new" ? routeRoomId : queryRoomId ?? undefined;

  return (
    <RoomConnectionProvider role="screen" roomId={effectiveRoomId}>
      <ScreenRoomLayoutInner routeRoomId={routeRoomId} hasRoomId={!!effectiveRoomId || routeRoomId === "new"} />
    </RoomConnectionProvider>
  );
}

function ScreenRoomLayoutInner({
  routeRoomId,
  hasRoomId,
}: {
  routeRoomId?: string;
  hasRoomId: boolean;
}) {
  const navigate = useNavigate();
  const { room } = useRoomConnection();

  useEffect(() => {
    if (routeRoomId === "new" && room?.id) {
      navigate(`/room/${room.id}`, { replace: true });
    }
  }, [routeRoomId, room?.id, navigate]);

  if (!hasRoomId) {
    return <div>Комната не найдена</div>;
  }

  if (routeRoomId === "new" && !room) {
    return <div>Создаем комнату...</div>;
  }

  return <Outlet />;
}

export function ControllerRoomLayout() {
  const params = useParams<RoomRouteParams>();
  const [searchParams] = useSearchParams();
  const routeRoomId = params.roomId;
  const queryRoomId = searchParams.get("room") ?? undefined;
  const effectiveRoomId =
    routeRoomId && routeRoomId !== "new" ? routeRoomId : queryRoomId ?? undefined;

  return (
    <RoomConnectionProvider role="controller" roomId={effectiveRoomId}>
      <ControllerRoomLayoutInner hasRoomId={Boolean(effectiveRoomId)} />
    </RoomConnectionProvider>
  );
}

function ControllerRoomLayoutInner({ hasRoomId }: { hasRoomId: boolean }) {
  if (!hasRoomId) {
    return <div>Комната не найдена</div>;
  }

  return <Outlet />;
}
