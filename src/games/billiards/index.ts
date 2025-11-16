import { BilliardsScreen } from "./screen/BilliardsScreen";
import { BilliardsController } from "./controller/BilliardsController";
import type { GameDefinition } from "../_core/types";

export const billiardsDefinition: GameDefinition = {
  id: "billiards",
  name: "Бильярд",
  Screen: BilliardsScreen,
  Controller: BilliardsController,
};
