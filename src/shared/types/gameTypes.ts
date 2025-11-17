import { type ComponentType } from "react";

export type GameId = "billiards" | "race";

export type Role = "screen" | "host" | "controller";

export interface GameScreenProps {
  roomId: string;
}
export interface GameControllerProps {
  roomId: string;
}

export interface GameDefinition {
  id: GameId;
  name: string;
  Screen: ComponentType<GameScreenProps>;
  Controller: ComponentType<GameControllerProps>;
}
