export type PlayerRole = 'screen' | 'controller' | 'host';

export interface Player {
  id: string;       // socket.id
  name?: string;
  role: PlayerRole;
  ready?: boolean;
}

export interface Room {
  id: string;
  screenId?: string;
  players: Player[];
  gameType?: GameType;
}

export type GameType = 'billiards' | 'chess';
