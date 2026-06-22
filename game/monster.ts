import { GameMap, isWall, TILE } from "./map";
import { Monster, MonsterKind, Player, Vec2 } from "./types";

export const STATIC_RANGE = TILE * 6;





interface KindTuning {
  speed: number;
  chaseMul: number;
  sightRange: number;
  sightArc: number;
  detectRange: number;
  hearingRange: number;
  hearingSensitivity: number;
  loseRange: number;
  alertHold: number;
  radius: number;
}

const TUNING: Record<MonsterKind, KindTuning> = {
  wanderer: {
    speed: 66,
    chaseMul: 1.4,
    sightRange: TILE * 6.0,
    sightArc: Math.PI * 0.82,
    detectRange: TILE * 2.4,
    hearingRange: TILE * 4.2,
    hearingSensitivity: 1,
    loseRange: TILE * 5.5,
    alertHold: 2.4,
    radius: 12,
  },
  stalker: {
    speed: 78,
    chaseMul: 1.62,
    sightRange: TILE * 8.2,
    sightArc: Math.PI * 1.0,
    detectRange: TILE * 2.8,
    hearingRange: TILE * 4.0,
    hearingSensitivity: 0.85,
    loseRange: TILE * 8.0,
    alertHold: 4.2,
    radius: 12,
  },
  listener: {
    speed: 52,
    chaseMul: 1.95,
    sightRange: TILE * 1.3,
    sightArc: Math.PI * 0.5,
    detectRange: TILE * 1.4,
    hearingRange: TILE * 7.5,
    hearingSensitivity: 1.7,
    loseRange: TILE * 3.0,
    alertHold: 1.0,
    radius: 13,
  },
  brute: {
    speed: 44,
    chaseMul: 1.35,
    sightRange: TILE * 5.0,
    sightArc: Math.PI * 0.7,
    detectRange: TILE * 2.2,
    hearingRange: TILE * 3.6,
    hearingSensitivity: 0.7,
    loseRange: TILE * 4.5,
    alertHold: 3.4,
    radius: 18,
  },
  crawler: {
    speed: 96,
    chaseMul: 1.5,
    sightRange: TILE * 9.0,
    sightArc: Math.PI * 0.62,
    detectRange: TILE * 2.0,
    hearingRange: TILE * 3.2,
    hearingSensitivity: 0.9,
    loseRange: TILE * 9.0,
    alertHold: 2.0,
    radius: 9,
  },
};

export function tuningFor(kind: MonsterKind): KindTuning {
  return TUNING[kind];
}

export function createMonster(pos: Vec2, kind: MonsterKind = "wanderer"): Monster {
  const t = TUNING[kind];
  return {
    pos: { x: pos.x, y: pos.y },
    angle: Math.random() * Math.PI * 2,
    speed: t.speed,
    radius: t.radius,
    kind,
    state: "wander",
    wanderTimer: 1 + Math.random() * 2,
    target: null,
    alertTimer: 0,
    lungeFlash: 0,
    stunTimer: 0,
    chaseLock: 0,
  };
}

export function updateMonster(
  m: Monster,
  player: Player,
  map: GameMap,
  exitOpen: boolean,
  dt: number,
  playerNoise = 0,
) {
  const t = TUNING[m.kind];
  const dx = player.pos.x - m.pos.x;
  const dy = player.pos.y - m.pos.y;
  const dist = Math.hypot(dx, dy);

  if (m.lungeFlash > 0) m.lungeFlash -= dt;


  if (m.stunTimer > 0) {
    m.stunTimer -= dt;
    return;
  }

  // 幸存者牺牲 / 十字架定身之后的一段冷却：不会重新进入追击
  if (m.chaseLock > 0) {
    m.chaseLock -= dt;
    // 冷却期间若仍在追，强制降级为搜索，避免立刻又扑上来
    if (m.state === "chase") {
      m.state = "investigate";
      m.target = { x: player.pos.x, y: player.pos.y };
      m.alertTimer = Math.max(m.alertTimer, 0.8);
    }
  }

  const canSeePlayer =
    dist < t.sightRange &&
    withinVisionCone(m.angle, dx, dy, t.sightArc) &&
    hasLineOfSight(map, m.pos, player.pos, exitOpen);
  const heardPlayer =
    playerNoise > 0.12 &&
    dist < t.hearingRange * (0.45 + playerNoise * t.hearingSensitivity);

  const wasCalm = m.state !== "chase";


  const senses = canSeePlayer || dist < t.detectRange || (m.kind === "listener" && heardPlayer);

  if (senses) {
    if (m.chaseLock > 0) {
      // 被定身/被挡下后的冷却期：只搜索，不追击
      if (m.state === "chase") {
        m.state = "investigate";
        m.target = { x: player.pos.x, y: player.pos.y };
        m.alertTimer = Math.max(m.alertTimer, 0.8);
      } else if (m.state !== "investigate") {
        m.state = "investigate";
        m.target = { x: player.pos.x, y: player.pos.y };
        m.alertTimer = Math.max(m.alertTimer, 1.6);
      }
    } else {
      if (wasCalm) m.lungeFlash = 0.5;
      m.state = "chase";
      m.target = { x: player.pos.x, y: player.pos.y };
      m.alertTimer = t.alertHold;
    }
  } else if (heardPlayer && m.state !== "chase") {
    m.state = "investigate";
    m.target = { x: player.pos.x, y: player.pos.y };
    m.alertTimer = 2.8;
  } else if (m.state === "chase") {
    m.alertTimer -= dt;
    if (dist > t.loseRange && m.alertTimer <= 0) {
      m.state = m.target ? "investigate" : "wander";
      m.alertTimer = 1.2;
    }
  }

  let targetAngle: number;
  let speed = m.speed;

  if (m.state === "chase") {
    targetAngle = Math.atan2(dy, dx);
    speed = m.speed * t.chaseMul;
  } else if (m.state === "investigate" && m.target) {
    const tx = m.target.x - m.pos.x;
    const ty = m.target.y - m.pos.y;
    const td = Math.hypot(tx, ty);
    targetAngle = Math.atan2(ty, tx);
    speed = m.speed * 0.82;

    if (td < TILE * 0.35) {
      m.target = null;
      m.alertTimer -= dt;
      if (m.alertTimer <= 0) {
        m.state = "wander";
        m.wanderTimer = 0.2;
      }
    }
  } else {
    m.wanderTimer -= dt;
    if (m.wanderTimer <= 0) {
      m.angle += (Math.random() - 0.5) * Math.PI;
      m.wanderTimer = 1.5 + Math.random() * 2.5;
    }
    targetAngle = m.angle;
    speed = m.speed * 0.55;
  }

  m.angle = lerpAngle(m.angle, targetAngle, m.state === "chase" ? 0.18 : 0.06);

  const move = speed * dt;
  const nx = m.pos.x + Math.cos(m.angle) * move;
  const ny = m.pos.y + Math.sin(m.angle) * move;
  const r = m.radius;


  let blocked = false;
  if (!hitWall(map, nx, m.pos.y, r, exitOpen)) {
    m.pos.x = nx;
  } else blocked = true;
  if (!hitWall(map, m.pos.x, ny, r, exitOpen)) {
    m.pos.y = ny;
  } else blocked = true;

  if (blocked && m.state === "wander") {
    m.angle += Math.PI / 2 + Math.random() * Math.PI;
  } else if (blocked && m.state === "investigate") {
    m.target = null;
    m.state = "wander";
    m.wanderTimer = 0.2;
  }
}


export function nearestMonsterDist(player: Player, monsters: Monster[]): number {
  let best = Infinity;
  for (const m of monsters) {
    const d = Math.hypot(player.pos.x - m.pos.x, player.pos.y - m.pos.y);
    if (d < best) best = d;
  }
  return best;
}

export function dangerLevel(player: Player, monsters: Monster[]): number {
  let level = 0;
  for (const m of monsters) {
    const d = Math.hypot(player.pos.x - m.pos.x, player.pos.y - m.pos.y);
    const proximity = Math.max(0, 1 - d / STATIC_RANGE);
    const stateBoost = m.state === "chase" ? 0.55 : m.state === "investigate" ? 0.25 : 0;
    level = Math.max(level, Math.min(1, proximity * 0.75 + stateBoost));
  }
  return level;
}


export function caughtPlayer(player: Player, monsters: Monster[]): boolean {
  for (const m of monsters) {
    const d = Math.hypot(player.pos.x - m.pos.x, player.pos.y - m.pos.y);
    if (d < m.radius + player.radius) return true;
  }
  return false;
}


export const ATTACK_RANGE = TILE * 1.5;
const ATTACK_ARC = Math.PI * 0.7;

export function attackMonsters(
  player: Player,
  monsters: Monster[],
  map: GameMap,
  exitOpen: boolean,
): number {
  let hits = 0;
  for (const m of monsters) {
    const dx = m.pos.x - player.pos.x;
    const dy = m.pos.y - player.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist > ATTACK_RANGE + m.radius) continue;


    if (dist > player.radius + m.radius + 2) {
      let diff = Math.atan2(dy, dx) - player.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > ATTACK_ARC / 2) continue;
    }

    hits++;
    const knock =
      m.kind === "listener" ? TILE * 2.1 : m.kind === "stalker" ? TILE * 1.0 : TILE * 1.5;
    const stun =
      m.kind === "listener" ? 2.4 : m.kind === "stalker" ? 1.1 : 1.7;

    const ux = dist > 0.001 ? dx / dist : Math.cos(player.angle);
    const uy = dist > 0.001 ? dy / dist : Math.sin(player.angle);

    const stepN = 8;
    for (let s = 0; s < stepN; s++) {
      const nx = m.pos.x + (ux * knock) / stepN;
      const ny = m.pos.y + (uy * knock) / stepN;
      if (hitWall(map, nx, m.pos.y, m.radius, exitOpen)) break;
      if (hitWall(map, m.pos.x, ny, m.radius, exitOpen)) {
        m.pos.x = nx;
        break;
      }
      m.pos.x = nx;
      m.pos.y = ny;
    }

    m.stunTimer = Math.max(m.stunTimer, stun);
    m.lungeFlash = 0;
    m.state = "investigate";
    m.target = { x: player.pos.x, y: player.pos.y };
    m.alertTimer = 0.8;
  }
  return hits;
}

function hitWall(map: GameMap, x: number, y: number, r: number, exitOpen: boolean): boolean {
  return (
    isWall(map, x - r, y - r, exitOpen) ||
    isWall(map, x + r, y - r, exitOpen) ||
    isWall(map, x - r, y + r, exitOpen) ||
    isWall(map, x + r, y + r, exitOpen)
  );
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function withinVisionCone(angle: number, dx: number, dy: number, arc: number): boolean {
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < arc / 2;
}

function hasLineOfSight(map: GameMap, from: Vec2, to: Vec2, exitOpen: boolean): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0) return true;

  const step = 10;
  const ux = dx / dist;
  const uy = dy / dist;
  for (let d = step; d < dist; d += step) {
    if (isWall(map, from.x + ux * d, from.y + uy * d, exitOpen)) return false;
  }
  return true;
}
