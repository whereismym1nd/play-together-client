export type PlayerRole = 'screen' | 'controller' | 'host';

export interface Player {
  id: string;       // socket.id
  name?: string;
  role: PlayerRole;
  ready?: boolean;
  offline?: boolean;
}

export interface Room {
  id: string;
  screenId?: string;
  players: Player[];
  gameType?: GameType;
  stage?: RoomStage;
}

export type GameType = 'billiards' | 'chess';

export type RoomStage = 'lobby' | 'select' | 'game';
