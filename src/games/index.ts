import type { GameDefinition, GameId } from "../shared/types/gameTypes";
import { billiardsDefinition } from "./billiards";
// import { raceDefinition } from "./race";

const defs: GameDefinition[] = [billiardsDefinition /*, raceDefinition*/];

export const gamesMapById: Record<GameId, GameDefinition> = defs.reduce(
  (acc, def) => {
    acc[def.id] = def;
    return acc;
  },
  {} as Record<GameId, GameDefinition>
);
