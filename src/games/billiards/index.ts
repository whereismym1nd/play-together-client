import { BilliardsScreen } from "./screen/BilliardsScreen";
import { BilliardsController } from "./controller/BilliardsController";
import type { GameDefinition } from "../../shared/types/gameTypes";

export const billiardsDefinition: GameDefinition = {
  id: "billiards",
  name: "Бильярд",
  Screen: BilliardsScreen,
  Controller: BilliardsController,
};
