export interface Vec2 {
  x: number;
  y: number;
}

export type TileType = 0 | 1 | 2 | 3;

export interface Player {
  pos: Vec2;
  angle: number;
  speed: number;
  radius: number;
  stamina: number;
  sprinting: boolean;
  exhausted: boolean;
  battery: number;
  sanity: number;
  attackCooldown: number;
  attackFlash: number;
  potions: number;
  shields: number;
  shieldTimer: number;
  crucifix: number;
  invulnTimer: number;
}

export type MonsterKind = "wanderer" | "stalker" | "listener" | "brute" | "crawler";
export type MonsterState = "wander" | "investigate" | "chase";

export interface Monster {
  pos: Vec2;
  angle: number;
  speed: number;
  radius: number;
  kind: MonsterKind;
  state: MonsterState;
  wanderTimer: number;
  target: Vec2 | null;
  alertTimer: number;
  lungeFlash: number;
  stunTimer: number;
  chaseLock: number;
}

export interface Clue {
  pos: Vec2;
  collected: boolean;
  text: string;
}

export interface Sigil {
  pos: Vec2;
  active: boolean;
  progress: number;
  pulse: number;
}

export interface EchoPing {
  pos: Vec2;
  age: number;
  life: number;
  radius: number;
  maxRadius: number;
}

export type PickupKind = "battery" | "potion" | "crucifix";

export interface Pickup {
  pos: Vec2;
  taken: boolean;
  kind: PickupKind;
}

export interface Survivor {
  pos: Vec2;
  rescued: boolean;
  followOffset: number;
  sacrificed?: boolean;
}

export type GamePhase = "playing" | "paused" | "caught" | "escaped";

export interface GameState {
  player: Player;
  monsters: Monster[];
  clues: Clue[];
  sigils: Sigil[];
  pickups: Pickup[];
  survivors: Survivor[];
  phase: GamePhase;
  staticLevel: number;
  messageText: string;
  messageTimer: number;
  elapsed: number;
  totalElapsed: number;
  dangerLevel: number;
  noiseLevel: number;
  depth: number;
  hallucinations: Vec2[];
  visited: boolean[][];
  pings: EchoPing[];
  mapPulse: number;
  flicker: number;
  transition: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  attackPressed: boolean;
  scanPressed: boolean;
  interact: boolean;
  usePotion: boolean;
  useCrucifix: boolean;
  virtualMove: Vec2;
  virtualSprint: boolean;
  aim: Vec2 | null;
}
