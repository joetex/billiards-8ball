/**
 * pool-physics.ts — Pure TypeScript billiards physics
 *
 * Physics constants and model sourced from 7341.e49fb6cc.js (Bloob.io billiards).
 * That game uses p2.js (2D constraint physics) with the following config:
 *
 *   ball.physics.damping         = 0.45   (linear velocity decay fraction per second)
 *   ball.physics.angularDamping  = 0.9    (angular velocity decay fraction per second)
 *   ball.physics.sleepSpeedLimit = 5      (their units/s, scaled to px below)
 *   material.ballHitBall:        restitution 0.9,  friction 1.0, stiffness 1e9
 *   material.ballHitCushion:     restitution 0.75, friction 1.0, stiffness 1e9
 *   config.solverIterations      = 20     (GS solver iterations)
 *   config.ball.mass             = 3
 *
 * We replicate this with an impulse-based solver at 240 Hz (4 sub-steps per 60-fps frame).
 */

import { GameConfig } from "./game.config";

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const R_PX = GameConfig.ball.diameter / 2;  // ball radius in pixels = 21

type CushionLine = { start: { x: number; y: number }; end: { x: number; y: number } };

export function getCushionLineDefinitions(): CushionLine[] {
    return [
        { start: { x: 108, y: 50 },   end: { x: 146, y: 80 } },
        { start: { x: 146, y: 80 },   end: { x: 703, y: 80 } },
        { start: { x: 703, y: 80 },   end: { x: 711, y: 50 } },
        { start: { x: 784, y: 50 },   end: { x: 789, y: 80 } },
        { start: { x: 790, y: 80 },   end: { x: 1352, y: 80 } },
        { start: { x: 1352, y: 80 },  end: { x: 1389, y: 50 } },
        { start: { x: 1442, y: 97 },  end: { x: 1406, y: 133 } },
        { start: { x: 1406, y: 133 }, end: { x: 1407, y: 616 } },
        { start: { x: 1407, y: 616 }, end: { x: 1443, y: 650 } },
        { start: { x: 60, y: 96 },    end: { x: 90, y: 131 } },
        { start: { x: 90, y: 131 },   end: { x: 85, y: 617 } },
        { start: { x: 90, y: 617 },   end: { x: 52, y: 662 } },
        { start: { x: 90, y: 695 },   end: { x: 139, y: 662 } },
        { start: { x: 139, y: 662 },  end: { x: 700, y: 662 } },
        { start: { x: 700, y: 662 },  end: { x: 712, y: 695 } },
        { start: { x: 780, y: 695 },  end: { x: 792, y: 662 } },
        { start: { x: 792, y: 662 },  end: { x: 1356, y: 662 } },
        { start: { x: 1356, y: 662 }, end: { x: 1399, y: 695 } },
    ];
}

const POCKETS = [
    { x: GameConfig.table.pocketsPositions[0].x, y: GameConfig.table.pocketsPositions[0].y, r: GameConfig.table.cornerPocketRadius },
    { x: GameConfig.table.pocketsPositions[1].x, y: GameConfig.table.pocketsPositions[1].y, r: GameConfig.table.middlePocketRadius },
    { x: GameConfig.table.pocketsPositions[2].x, y: GameConfig.table.pocketsPositions[2].y, r: GameConfig.table.cornerPocketRadius },
    { x: GameConfig.table.pocketsPositions[3].x, y: GameConfig.table.pocketsPositions[3].y, r: GameConfig.table.cornerPocketRadius },
    { x: GameConfig.table.pocketsPositions[4].x, y: GameConfig.table.pocketsPositions[4].y, r: GameConfig.table.middlePocketRadius },
    { x: GameConfig.table.pocketsPositions[5].x, y: GameConfig.table.pocketsPositions[5].y, r: GameConfig.table.cornerPocketRadius },
];

// Approximate table centre — used for cushion normal orientation
const TABLE_CX = 747, TABLE_CY = 370;

// ---------------------------------------------------------------------------
// Physics constants — from 7341.e49fb6cc.js
// ---------------------------------------------------------------------------

/** Linear velocity decay fraction per second (source: ball.physics.damping = 0.45). */
const LINEAR_DAMPING = 0.45;

/** Angular velocity decay fraction per second (source: ball.physics.angularDamping = 0.9). */
const ANGULAR_DAMPING = 0.9;

/** Ball-ball restitution (source: material.ballHitBall.restitution = 0.9). */
const BALL_BALL_REST = 0.9;

/** Ball-cushion restitution (source: material.ballHitCushion.restitution = 0.75). */
const BALL_CUSHION_REST = 0.75;

/** Ball-ball Coulomb friction coefficient (source: material.ballHitBall.friction = 1.0). */
const BALL_BALL_FRICTION = 0.08;

/** Ball-cushion Coulomb friction coefficient (source: material.ballHitCushion.friction = 1.0). */
const BALL_CUSHION_FRICTION = 1.0;

/** Ball mass in kg (source: ball.physics.mass = 3). */
const BALL_MASS = 3.0;

/**
 * Moment of inertia for a solid sphere: I = (2/5) * M * R^2.
 * Using R in pixels is fine since all our impulses are also in pixel-space units.
 */
const MOMENT_I = (2 / 5) * BALL_MASS * R_PX * R_PX;

/**
 * Sleep speed threshold.
 * Source: ball.physics.sleepSpeedLimit = 5 (their units/s where ball radius = 11).
 * Scaled to our pixel space: 5 * (21 / 11) ≈ 9.5 px/s.
 */
const SLEEP_SPEED = 5 * (R_PX / 11);

/** Angular velocity (rad/s) below which spin is zeroed at rest. */
const SLEEP_ANGULAR = 1.0;

/**
 * Maximum shot speed in px/s.
 * The original reference value is a little too soft for a satisfying rack break in this
 * implementation, so we allow a higher launch ceiling while preserving the same power mapping.
 */
const MAX_SHOT_SPEED_PX = (2800 / BALL_MASS) * (R_PX / 11);  // ≈ 1782 px/s

/**
 * Physics sub-steps per call to advanceSimWorld().
 * Their stepDt = 1/240; at 60 fps with 4 sub-steps we match their rate.
 */
const SUB_STEPS = 4;
const STEP_DT   = 1 / (60 * SUB_STEPS);  // 1/240 s

const SIMULATION_FPS = 60;
const SIMULATION_MAX_STEPS = 400;
const SIMULATION_REST_EPS = SLEEP_SPEED;

const LIVE_FPS = SIMULATION_FPS;
const POWER_INPUT_MAX = GameConfig.stick.maxPower;
const ANGLE_UINT_MAX = 65535;
const POWER_UINT_MAX = 255;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type PocketResult = "none" | "cue" | "solid" | "stripe" | "eight" | "unknown";
export type SimBallType  = "cue" | "solid" | "stripe" | "eight";

export type SimBallInput = {
    id: number; number: number; type: SimBallType;
    x: number; y: number; vx: number; vy: number;
    visible: boolean; moving?: boolean;
};

export type SimBallState = SimBallInput & {
    dynBody?: PhysicsDynamicBody | null;
    bodyId?: number;
    pocketed?: boolean;
};

export type SimShotOptions = { maxSteps?: number; maxRuntimeMs?: number };

export type ShotSimulationResult = {
    balls: SimBallState[];
    pocketedBalls: SimBallState[];
    cuePocketed: boolean; eightPocketed: boolean;
    firstHitType: "none" | SimBallType; firstHitNumber: number | null;
    railHit: boolean; objectBallRailHits: number;
    cuePotted: boolean;
    cueFirstHit: "none" | "solid" | "stripe" | "eight" | "unknown";
    firstBallHitId: string | null; firstObjectRailHits: number;
    pocketed: PocketResult[]; anyBallPocketed: boolean;
    legalContactMade: boolean; ballInHandAfterFoul: boolean;
    pottedCueAndEight: boolean; hitWall: boolean; brokeRack: boolean;
};

/**
 * Physics body for one ball.  Positions and velocities are in pixels / pixels-per-second.
 * angularVelocity is in radians/second (2D scalar spin — positive = counterclockwise).
 */
export type PhysicsDynamicBody = {
    id: number;
    center:          { x: number; y: number };
    velocity:        { x: number; y: number };
    velMag:          number;
    enabled:         boolean;
    angularVelocity: number;
};

type SimWorld = { bodyMap: Array<PhysicsDynamicBody | null> };

export type LiveSimulation = {
    bodyMap:              Array<PhysicsDynamicBody | null>;
    active:               boolean;
    allStopped:           boolean;
    pocketed:             Set<number>;
    cuePotted:            boolean;
    firstHit:             number | null;
    wallHit:              boolean;
    objectBallRailHitSet: Set<number>;
    steps:                number;
    _simWorld:            SimWorld;
    balls:                SimBallState[];
    pocketedBalls:        SimBallState[];
    settled:              boolean;
    cuePocketed:          boolean;
    eightPocketed:        boolean;
    railHit:              boolean;
    firstHitType:         "none" | SimBallType;
    firstHitNumber:       number | null;
    objectBallRailHits:   number;
};

export type CircleCastHit = { timeOfImpact: number; colliderHandle: number | null };

export type GuideContactResult = {
    centerAtContact: { x: number; y: number };
    distance:        number;
    isWall:          boolean;
    ballIndex:       number | null;
};

export const CUE_BALL_POSITION = {
    x: GameConfig.cueBallPosition.x, y: GameConfig.cueBallPosition.y,
};

let SIM_WORLD:  SimWorld | null = null;
let LIVE_WORLD: SimWorld | null = null;

// ---------------------------------------------------------------------------
// No async init required
// ---------------------------------------------------------------------------
export function ensurePhysicsReady(): Promise<void> { return Promise.resolve(); }

function createSeededRng(seed: number): () => number {
    let state = (seed >>> 0) || 0x6d2b79f5;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffleDeterministic<T>(items: T[], nextRand: () => number): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(nextRand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// ---------------------------------------------------------------------------
// Ball creation
// ---------------------------------------------------------------------------
export function createInitialBalls(_rackSeed?: number): SimBallInput[] {
    const rackSeed = Number.isFinite(_rackSeed) ? Number(_rackSeed) : 0;
    const nextRand = createSeededRng(rackSeed);
    const rackCenterY = GameConfig.eightBallPosition.y;
    const rowSpacingY = R_PX * 1.02;
    const rowSpacingX = Math.sqrt(3) * rowSpacingY;
    const apexX       = GameConfig.eightBallPosition.x - rowSpacingX * 2;
    const rp = (row: number, slot: number) => ({
        x: apexX + row * rowSpacingX,
        y: rackCenterY + (slot - row / 2) * (rowSpacingY * 2),
    });
    const shuffledNumbers = shuffleDeterministic([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15], nextRand);
    const rack: Record<number, { x: number; y: number }> = {
        1: rp(0,0),
        8: rp(2,1),
    };
    const openSlots = [
        rp(1,0), rp(1,1),
        rp(2,0), rp(2,2),
        rp(3,0), rp(3,1), rp(3,2), rp(3,3),
        rp(4,0), rp(4,1), rp(4,2), rp(4,3), rp(4,4),
    ];
    for (let i = 0; i < shuffledNumbers.length; i++) {
        rack[shuffledNumbers[i]] = openSlots[i];
    }
    return [
        { id:0,  number:0,  type:"cue",    x:GameConfig.cueBallPosition.x, y:GameConfig.cueBallPosition.y, visible:true, vx:0, vy:0 },
        { id:1,  number:1,  type:"solid",  x:rack[1].x,  y:rack[1].y,  visible:true, vx:0, vy:0 },
        { id:2,  number:2,  type:"solid",  x:rack[2].x,  y:rack[2].y,  visible:true, vx:0, vy:0 },
        { id:3,  number:3,  type:"solid",  x:rack[3].x,  y:rack[3].y,  visible:true, vx:0, vy:0 },
        { id:4,  number:4,  type:"solid",  x:rack[4].x,  y:rack[4].y,  visible:true, vx:0, vy:0 },
        { id:5,  number:5,  type:"solid",  x:rack[5].x,  y:rack[5].y,  visible:true, vx:0, vy:0 },
        { id:6,  number:6,  type:"solid",  x:rack[6].x,  y:rack[6].y,  visible:true, vx:0, vy:0 },
        { id:7,  number:7,  type:"solid",  x:rack[7].x,  y:rack[7].y,  visible:true, vx:0, vy:0 },
        { id:8,  number:8,  type:"eight",  x:rack[8].x,  y:rack[8].y,  visible:true, vx:0, vy:0 },
        { id:9,  number:9,  type:"stripe", x:rack[9].x,  y:rack[9].y,  visible:true, vx:0, vy:0 },
        { id:10, number:10, type:"stripe", x:rack[10].x, y:rack[10].y, visible:true, vx:0, vy:0 },
        { id:11, number:11, type:"stripe", x:rack[11].x, y:rack[11].y, visible:true, vx:0, vy:0 },
        { id:12, number:12, type:"stripe", x:rack[12].x, y:rack[12].y, visible:true, vx:0, vy:0 },
        { id:13, number:13, type:"stripe", x:rack[13].x, y:rack[13].y, visible:true, vx:0, vy:0 },
        { id:14, number:14, type:"stripe", x:rack[14].x, y:rack[14].y, visible:true, vx:0, vy:0 },
        { id:15, number:15, type:"stripe", x:rack[15].x, y:rack[15].y, visible:true, vx:0, vy:0 },
    ];
}

export function cloneBalls<T extends SimBallInput>(balls: T[]): T[] { return balls.map((b) => ({ ...b })); }

export function isValidCueBallPlacement(balls: SimBallInput[], x: number, y: number): boolean {
    const lines = getCushionLineDefinitions();
    const minX = Math.min(...lines.map((l) => Math.min(l.start.x, l.end.x))) + R_PX;
    const maxX = Math.max(...lines.map((l) => Math.max(l.start.x, l.end.x))) - R_PX;
    const minY = Math.min(...lines.map((l) => Math.min(l.start.y, l.end.y))) + R_PX;
    const maxY = Math.max(...lines.map((l) => Math.max(l.start.y, l.end.y))) - R_PX;
    if (x < minX || x > maxX || y < minY || y > maxY) return false;
    if (isInPocket(x, y)) return false;
    const minDist2 = (R_PX * 2 * 0.98) ** 2;
    for (const ball of balls) {
        if (!ball.visible || ball.type === "cue" || ball.number === 0) continue;
        const dx = x - ball.x, dy = y - ball.y;
        if (dx * dx + dy * dy < minDist2) return false;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Encode / decode
// ---------------------------------------------------------------------------
export function encodeAngleToUint(angleRad: number): number {
    const twoPi = Math.PI * 2;
    let n = angleRad % twoPi; if (n < 0) n += twoPi;
    return Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round((n / twoPi) * ANGLE_UINT_MAX)));
}
export function decodeAngleFromUint(u: number): number {
    return (Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round(u))) / ANGLE_UINT_MAX) * Math.PI * 2;
}
export function encodePowerToUint(power: number): number {
    const c = Math.max(0, Math.min(POWER_INPUT_MAX, power));
    return Math.max(0, Math.min(POWER_UINT_MAX, Math.round((c / POWER_INPUT_MAX) * POWER_UINT_MAX)));
}
export function decodePowerFromUint(u: number): number {
    return (Math.max(0, Math.min(POWER_UINT_MAX, Math.round(u))) / POWER_UINT_MAX) * POWER_INPUT_MAX;
}
export function velocityFromEncodedShot(aU: number, pU: number): { vx: number; vy: number } {
    return velocityFromShot(decodeAngleFromUint(aU), decodePowerFromUint(pU));
}
export function lerp(from: number, to: number, t: number): number { return from + (to - from) * t; }
export function lerpAngle(from: number, to: number, t: number): number {
    let d = to - from;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return from + d * t;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function velocityFromShot(angle: number, power: number): { vx: number; vy: number } {
    const speed = (Math.max(0, Math.min(POWER_INPUT_MAX, power)) / POWER_INPUT_MAX) * MAX_SHOT_SPEED_PX;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

export function getShotSpeedFromPower(power: number): number {
    return (Math.max(0, Math.min(POWER_INPUT_MAX, power)) / POWER_INPUT_MAX) * MAX_SHOT_SPEED_PX;
}

export type GuideCollisionPreview = {
    cueAfter: { vx: number; vy: number; speed: number };
    objectAfter: { vx: number; vy: number; speed: number };
    normal: { x: number; y: number };
};

export function predictGuideBallCollision(
    cueCenterAtContact: { x: number; y: number },
    objectCenterAtContact: { x: number; y: number },
    cueDirection: { x: number; y: number },
    cueSpeed: number,
    cueAngularVelocity = 0,
    objectAngularVelocity = 0,
): GuideCollisionPreview | null {
    const dirLen = Math.hypot(cueDirection.x, cueDirection.y);
    if (dirLen < 1e-9 || cueSpeed <= 1e-9) return null;

    const ux = cueDirection.x / dirLen;
    const uy = cueDirection.y / dirLen;
    const avx = ux * cueSpeed;
    const avy = uy * cueSpeed;

    const nxRaw = objectCenterAtContact.x - cueCenterAtContact.x;
    const nyRaw = objectCenterAtContact.y - cueCenterAtContact.y;
    const nLen = Math.hypot(nxRaw, nyRaw);
    if (nLen < 1e-9) return null;

    const nx = nxRaw / nLen;
    const ny = nyRaw / nLen;
    const tx = -ny;
    const ty = nx;

    const dvx = avx;
    const dvy = avy;
    const vRelN = dvx * nx + dvy * ny;
    if (vRelN <= 0) return null;

    const vRelT = -dvx * ny + dvy * nx + R_PX * (cueAngularVelocity + objectAngularVelocity);
    const Jn = (-(1 + BALL_BALL_REST) * vRelN) * BALL_MASS * 0.5;
    const JtFree = -vRelT * BALL_MASS / 7;
    const JtMax = getBallBallFrictionCoeff(vRelT) * Math.abs(Jn);
    const Jt = Math.max(-JtMax, Math.min(JtMax, JtFree));

    const invM = 1 / BALL_MASS;
    const cueVx = avx + (Jn * nx + Jt * tx) * invM;
    const cueVy = avy + (Jn * ny + Jt * ty) * invM;
    const objVx = 0 - (Jn * nx + Jt * tx) * invM;
    const objVy = 0 - (Jn * ny + Jt * ty) * invM;

    return {
        cueAfter: { vx: cueVx, vy: cueVy, speed: Math.hypot(cueVx, cueVy) },
        objectAfter: { vx: objVx, vy: objVy, speed: Math.hypot(objVx, objVy) },
        normal: { x: nx, y: ny },
    };
}

function isInPocket(x: number, y: number): boolean {
    for (const p of POCKETS) { const dx = x - p.x, dy = y - p.y; if (dx*dx+dy*dy <= p.r*p.r) return true; }
    return false;
}

// Real pool has cut-induced throw (CIT), but it is modest and decreases at higher
// surface sliding speed during impact. Using speed-dependent friction keeps object-ball
// exit angles close to line-of-centers while still allowing some throw.
function getBallBallFrictionCoeff(vRelT: number): number {
    const slip = Math.abs(vRelT);
    const mu = BALL_BALL_FRICTION * (0.35 + 0.65 * Math.exp(-slip / 120));
    return Math.max(0.025, Math.min(BALL_BALL_FRICTION, mu));
}

function isAnyMoving(sw: SimWorld): boolean {
    for (const d of sw.bodyMap) { if (d && d.enabled && d.velMag > SIMULATION_REST_EPS) return true; }
    return false;
}

type HitResult = "none" | "solid" | "stripe" | "eight" | "unknown";
function classifyBall(b?: SimBallInput): PocketResult {
    if (!b) return "unknown";
    if (b.type === "cue") return "cue";
    if (b.type === "eight") return "eight";
    if (b.type === "solid") return "solid";
    if (b.type === "stripe") return "stripe";
    return "unknown";
}
function classifyHitBall(b?: SimBallInput): HitResult {
    const c = classifyBall(b); return c === "cue" ? "unknown" : c;
}
function findCueIndex(balls: SimBallInput[]): number {
    const i = balls.findIndex((b) => b.type === "cue" || b.number === 0); return i >= 0 ? i : 0;
}
function toSimBallState(ball: SimBallInput, d: PhysicsDynamicBody | null): SimBallState {
    return {
        ...ball,
        vx:      d?.velocity.x ?? ball.vx ?? 0,
        vy:      d?.velocity.y ?? ball.vy ?? 0,
        visible: d?.enabled ?? ball.visible ?? true,
        x:       d?.center.x ?? ball.x,
        y:       d?.center.y ?? ball.y,
        dynBody: d,
        bodyId:  d?.id,
        pocketed: !(d?.enabled ?? ball.visible ?? true),
    };
}

// ---------------------------------------------------------------------------
// Cushion normals
// ---------------------------------------------------------------------------
type Normal2 = { nx: number; ny: number };

function segmentInwardNormal(seg: CushionLine): Normal2 {
    const dx = seg.end.x - seg.start.x, dy = seg.end.y - seg.start.y;
    const len = Math.hypot(dx, dy);
    let nx = -dy / len, ny = dx / len;
    const midX = (seg.start.x + seg.end.x) / 2, midY = (seg.start.y + seg.end.y) / 2;
    // Ensure normal points TOWARD table centre
    if (nx * (TABLE_CX - midX) + ny * (TABLE_CY - midY) < 0) { nx = -nx; ny = -ny; }
    return { nx, ny };
}

const CACHED_LINES:   CushionLine[] = getCushionLineDefinitions();
const CACHED_NORMALS: Normal2[]     = CACHED_LINES.map(segmentInwardNormal);

function endpointKey(x: number, y: number): string {
    return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

const ENDPOINT_REF_COUNT = new Map<string, number>();
for (const seg of CACHED_LINES) {
    const sKey = endpointKey(seg.start.x, seg.start.y);
    const eKey = endpointKey(seg.end.x, seg.end.y);
    ENDPOINT_REF_COUNT.set(sKey, (ENDPOINT_REF_COUNT.get(sKey) ?? 0) + 1);
    ENDPOINT_REF_COUNT.set(eKey, (ENDPOINT_REF_COUNT.get(eKey) ?? 0) + 1);
}

function isConnectedEndpoint(x: number, y: number): boolean {
    return (ENDPOINT_REF_COUNT.get(endpointKey(x, y)) ?? 0) >= 2;
}

// ---------------------------------------------------------------------------
// Ball-ball impulse collision
//
// Derivation uses impulse mechanics for two equal-mass spheres with Coulomb friction.
// Reference: 7341.e49fb6cc.js material.ballHitBall = { restitution: 0.9, friction: 1.0 }
//
// Normal effective mass   = M/2  (two equal-mass bodies)
// Tangential effective mass = M/7  (includes angular inertia of solid sphere: I = 2/5 MR²)
// ---------------------------------------------------------------------------
function resolveBallCollision(a: PhysicsDynamicBody, b: PhysicsDynamicBody): boolean {
    const cx = b.center.x - a.center.x, cy = b.center.y - a.center.y;
    const dist2 = cx * cx + cy * cy;
    const diam  = R_PX * 2;
    if (dist2 >= diam * diam || dist2 < 1e-12) return false;
    const dist = Math.sqrt(dist2);
    const nx = cx / dist, ny = cy / dist;   // unit normal A → B
    const tx = -ny,        ty = nx;          // unit tangent

    // Relative centre-of-mass velocity
    const dvx = a.velocity.x - b.velocity.x, dvy = a.velocity.y - b.velocity.y;
    // Normal relative velocity (angular spin doesn't contribute for circles)
    // vRelN > 0 means A is moving toward B (approaching); skip if separating.
    const vRelN = dvx * nx + dvy * ny;
    if (vRelN <= 0) return false;  // separating or tangential

    // Tangential relative contact-point velocity (includes surface spin)
    // v_rel_t = (vA + w_A × R_A) - (vB + w_B × R_B) · t_hat
    // where R_A = +R*n, R_B = -R*n and ẑ × r = (-r.y, r.x)
    const vRelT = -dvx * ny + dvy * nx + R_PX * (a.angularVelocity + b.angularVelocity);

    // Normal impulse with Baumgarte positional stabilisation.
    // J_n = [-(1+e) * vRelN - beta * penetration / dt] * (M/2)
    const penetration = Math.max(0, diam - dist);
    const bias = 0.3 * penetration / STEP_DT;
    const Jn = (-(1 + BALL_BALL_REST) * vRelN - bias) * BALL_MASS * 0.5;

    // Tangential impulse capped by Coulomb friction
    const JtFree = -vRelT * BALL_MASS / 7;
    const JtMax  = getBallBallFrictionCoeff(vRelT) * Math.abs(Jn);
    const Jt     = Math.max(-JtMax, Math.min(JtMax, JtFree));

    // Apply to velocities
    const invM = 1 / BALL_MASS;
    a.velocity.x += (Jn * nx + Jt * tx) * invM;
    a.velocity.y += (Jn * ny + Jt * ty) * invM;
    b.velocity.x -= (Jn * nx + Jt * tx) * invM;
    b.velocity.y -= (Jn * ny + Jt * ty) * invM;
    a.velMag = Math.hypot(a.velocity.x, a.velocity.y);
    b.velMag = Math.hypot(b.velocity.x, b.velocity.y);

    // Angular impulse: (Ra × J) / I for each ball
    // Ra = +R*n → Ra × J_t*t = +R * Jt
    // Rb = -R*n → Rb × (-J_t*t) = +R * Jt  (same sign for both)
    const angDelta = Jt * R_PX / MOMENT_I;
    a.angularVelocity += angDelta;
    b.angularVelocity += angDelta;

    // Depenetrate
    const overlap = diam - dist;
    if (overlap > 0) {
        a.center.x -= nx * overlap * 0.5; a.center.y -= ny * overlap * 0.5;
        b.center.x += nx * overlap * 0.5; b.center.y += ny * overlap * 0.5;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Ball-cushion impulse bounce
//
// Derivation for ball hitting a static wall with inward normal n (toward table):
//   Normal effective mass   = M       (only ball contributes — wall is static/infinite mass)
//   Tangential effective mass = 2M/7  (includes solid-sphere angular inertia)
// Reference: 7341.e49fb6cc.js material.ballHitCushion = { restitution: 0.75, friction: 1.0 }
// ---------------------------------------------------------------------------
function applyWallBounce(body: PhysicsDynamicBody, nx: number, ny: number): void {
    // Velocity component along inward normal (positive = moving away from wall = already bouncing)
    const vDotN = body.velocity.x * nx + body.velocity.y * ny;
    if (vDotN >= 0) return;

    const tx = -ny, ty = nx;  // tangent along wall

    // Tangential contact velocity (contact point is at -R*n from centre)
    // v_contact_t = -vx*ny + vy*nx - R*w
    const vRelT = -body.velocity.x * ny + body.velocity.y * nx - R_PX * body.angularVelocity;

    // Normal impulse (wall infinite mass)  J_n = -(1+e) * vDotN * M
    const Jn = -(1 + BALL_CUSHION_REST) * vDotN * BALL_MASS;

    // Tangential impulse  J_t = -vRelT * (2M/7), capped by Coulomb
    const JtFree = -vRelT * BALL_MASS * 2 / 7;
    const JtMax  = BALL_CUSHION_FRICTION * Math.abs(Jn);
    const Jt     = Math.max(-JtMax, Math.min(JtMax, JtFree));

    body.velocity.x += (Jn * nx + Jt * tx) / BALL_MASS;
    body.velocity.y += (Jn * ny + Jt * ty) / BALL_MASS;
    body.velMag = Math.hypot(body.velocity.x, body.velocity.y);

    // Angular impulse: (Rc × J) / I  where Rc = -R*n, Rc × J_t*t = -R * Jt
    body.angularVelocity -= Jt * R_PX / MOMENT_I;
}

/** Check whether the ball is heading toward the segment and will be close enough this step. */
function willHitSegment(
    body: PhysicsDynamicBody, seg: CushionLine, norm: Normal2, fpx: number, fpy: number,
): boolean {
    const { nx, ny } = norm;
    // Moving toward wall (velocity has component along outward normal)?
    if (nx * body.velocity.x + ny * body.velocity.y >= 0) return false;
    // Only treat as a bounce when crossing from outside to inside the contact shell.
    // If already inside, let positional projection resolve it to avoid repeated re-bounces.
    const currentDist = nx * (body.center.x - seg.start.x) + ny * (body.center.y - seg.start.y);
    if (currentDist <= R_PX) return false;
    // Ball centre must be within R_PX of the wall face to trigger a bounce.
    const futureDist = nx * (fpx - seg.start.x) + ny * (fpy - seg.start.y);
    if (futureDist > R_PX) return false;
    // Clamp to segment extents (with one-radius tolerance at endpoints)
    const dx = seg.end.x - seg.start.x, dy = seg.end.y - seg.start.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-9) return false;
    const t = ((fpx - seg.start.x) * dx + (fpy - seg.start.y) * dy) / len2;
    const ext = R_PX / Math.sqrt(len2);
    return t >= -ext && t <= 1.0 + ext;
}

type SweepHit = { t: number; nx: number; ny: number };

function sweepCircleVsPoint(
    px: number, py: number,
    vx: number, vy: number,
    ex: number, ey: number,
    maxT: number,
): SweepHit | null {
    const rx = px - ex;
    const ry = py - ey;
    const a = vx * vx + vy * vy;
    if (a < 1e-12) return null;
    const b = 2 * (rx * vx + ry * vy);
    const c = rx * rx + ry * ry - R_PX * R_PX;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const sdisc = Math.sqrt(disc);
    const t0 = (-b - sdisc) / (2 * a);
    const t1 = (-b + sdisc) / (2 * a);

    let t = Number.POSITIVE_INFINITY;
    if (t0 >= 0 && t0 <= maxT) t = t0;
    else if (t1 >= 0 && t1 <= maxT) t = t1;
    if (!Number.isFinite(t)) return null;

    const hx = px + vx * t;
    const hy = py + vy * t;
    const nx = hx - ex;
    const ny = hy - ey;
    const nLen = Math.hypot(nx, ny);
    if (nLen < 1e-9) return null;
    // Must be approaching the endpoint obstacle, otherwise this is an exit root.
    const nux = nx / nLen;
    const nuy = ny / nLen;
    if (vx * nux + vy * nuy >= 0) return null;
    return { t, nx: nux, ny: nuy };
}

function findEarliestWallHit(body: PhysicsDynamicBody, maxT: number): SweepHit | null {
    const px = body.center.x;
    const py = body.center.y;
    const vx = body.velocity.x;
    const vy = body.velocity.y;
    const CONTACT_SLOP = 0.08;
    let best: SweepHit | null = null;

    for (let s = 0; s < CACHED_LINES.length; s++) {
        const seg = CACHED_LINES[s];
        const norm = CACHED_NORMALS[s];

        // Side hit against the segment's inward normal offset by the ball radius.
        const vn = norm.nx * vx + norm.ny * vy;
        if (vn < -1e-9) {
            const d0 = norm.nx * (px - seg.start.x) + norm.ny * (py - seg.start.y);
            const dx = seg.end.x - seg.start.x;
            const dy = seg.end.y - seg.start.y;
            const len2 = dx * dx + dy * dy;
            if (len2 > 1e-9) {
                // If already touching/slightly inside and moving outward, collide immediately.
                if (d0 <= R_PX + CONTACT_SLOP) {
                    const u0 = ((px - seg.start.x) * dx + (py - seg.start.y) * dy) / len2;
                    if (u0 >= 0 && u0 <= 1) {
                        if (!best || 0 < best.t) best = { t: 0, nx: norm.nx, ny: norm.ny };
                    }
                }

                const t = (R_PX - d0) / vn;
                if (t >= 0 && t <= maxT) {
                    const hx = px + vx * t;
                    const hy = py + vy * t;
                    const u = ((hx - seg.start.x) * dx + (hy - seg.start.y) * dy) / len2;
                    if (u >= 0 && u <= 1) {
                        if (!best || t < best.t) best = { t, nx: norm.nx, ny: norm.ny };
                    }
                }
            }
        }

        // Rounded endpoint hits only at connected segment joints.
        // Pocket-mouth endpoints are intentionally open and should not be capped.
        if (isConnectedEndpoint(seg.start.x, seg.start.y)) {
            const h0 = sweepCircleVsPoint(px, py, vx, vy, seg.start.x, seg.start.y, maxT);
            if (h0 && (!best || h0.t < best.t)) best = h0;
        }
        if (isConnectedEndpoint(seg.end.x, seg.end.y)) {
            const h1 = sweepCircleVsPoint(px, py, vx, vy, seg.end.x, seg.end.y, maxT);
            if (h1 && (!best || h1.t < best.t)) best = h1;
        }
    }

    return best;
}

// ---------------------------------------------------------------------------
// Physics step — 7341.e49fb6cc.js uses 240 Hz; we use SUB_STEPS sub-steps per frame.
// Damping replicates: p2.js applyDamping → velocity *= (1-damping)^dt each step.
// ---------------------------------------------------------------------------
function advanceSimWorld(
    simWorld: SimWorld, framedt: number,
    onWallHit?:  () => void,
    onBallHit?:  (i: number, j: number) => void,
): void {
    const bm = simWorld.bodyMap, n = bm.length;
    const subDt = framedt / SUB_STEPS;

    for (let sub = 0; sub < SUB_STEPS; sub++) {
        // --- Collision detection and resolution (multiple solver iterations like p2 GS solver) ---
        const SOLVER_ITERS = 10;
        for (let iter = 0; iter < SOLVER_ITERS; iter++) {
            // Ball-ball
            for (let i = 0; i < n - 1; i++) {
                const a = bm[i]; if (!a || !a.enabled) continue;
                for (let j = i + 1; j < n; j++) {
                    const b = bm[j]; if (!b || !b.enabled) continue;
                    if (resolveBallCollision(a, b)) {
                        if (iter === 0) onBallHit?.(i, j);
                    }
                }
            }
        }

        // Ball-cushion — continuous sweep against inflated segments (capsules).
        // This uses velocity, radius and segment geometry directly, and moves balls to
        // time-of-impact, avoiding large after-the-fact position corrections at corners.
        for (let i = 0; i < n; i++) {
            const a = bm[i]; if (!a || !a.enabled || a.velMag < 0.01) continue;
            let tLeft = subDt;
            let hitAny = false;

            // Allow a few wall contacts in one sub-step (e.g. true corner glances).
            for (let hitIter = 0; hitIter < 3 && tLeft > 1e-6; hitIter++) {
                const hit = findEarliestWallHit(a, tLeft);
                if (!hit) {
                    a.center.x += a.velocity.x * tLeft;
                    a.center.y += a.velocity.y * tLeft;
                    tLeft = 0;
                    break;
                }

                // Move to impact point.
                a.center.x += a.velocity.x * hit.t;
                a.center.y += a.velocity.y * hit.t;
                tLeft -= hit.t;

                applyWallBounce(a, hit.nx, hit.ny);
                hitAny = true;

                // Small outward separation to avoid immediate re-hit loops.
                a.center.x += hit.nx * 0.05;
                a.center.y += hit.ny * 0.05;

                if (tLeft <= 1e-6) break;
            }

            if (hitAny) onWallHit?.();
        }
        // --- Integrate positions (only balls not already moved by sweep) ---
        for (let i = 0; i < n; i++) {
            const a = bm[i]; if (!a || !a.enabled) continue;
            // Static or near-static bodies skip the sweep stage and are integrated here.
            if (a.velMag < 0.01) {
                a.center.x += a.velocity.x * subDt;
                a.center.y += a.velocity.y * subDt;
            }
        }

        // --- Apply damping: velocity *= (1 - LINEAR_DAMPING)^subDt ---
        // This exactly matches p2.js `applyDamping(dt)` with damping=0.45, angularDamping=0.9.
        const linFactor = Math.pow(1 - LINEAR_DAMPING,  subDt);
        const angFactor = Math.pow(1 - ANGULAR_DAMPING, subDt);
        for (let i = 0; i < n; i++) {
            const a = bm[i]; if (!a || !a.enabled) continue;
            a.velocity.x        *= linFactor;
            a.velocity.y        *= linFactor;
            a.angularVelocity   *= angFactor;
            a.velMag = Math.hypot(a.velocity.x, a.velocity.y);

            // Sleep check (matches p2.js sleepTick: sleep when speed < sleepSpeedLimit)
            if (a.velMag < SLEEP_SPEED && Math.abs(a.angularVelocity) < SLEEP_ANGULAR) {
                a.velocity.x = 0; a.velocity.y = 0; a.velMag = 0; a.angularVelocity = 0;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// SimWorld management
// ---------------------------------------------------------------------------
function buildSimWorld(count: number): SimWorld {
    const bodyMap: Array<PhysicsDynamicBody | null> = Array.from({ length: count }, (_, id) => ({
        id, center: { x: 0, y: 0 }, velocity: { x: 0, y: 0 },
        velMag: 0, enabled: false, angularVelocity: 0,
    }));
    return { bodyMap };
}

function resetSimWorld(sw: SimWorld, balls: SimBallInput[]): void {
    for (let i = 0; i < sw.bodyMap.length; i++) {
        const inp = balls[i] || { x: 0, y: 0, visible: false, vx: 0, vy: 0 };
        const d = sw.bodyMap[i]!;
        const vis = inp.visible !== false;
        d.enabled        = vis;
        d.center.x       = inp.x  ?? 0;
        d.center.y       = inp.y  ?? 0;
        d.velocity.x     = vis ? (inp.vx ?? 0) : 0;
        d.velocity.y     = vis ? (inp.vy ?? 0) : 0;
        d.velMag         = vis ? Math.hypot(d.velocity.x, d.velocity.y) : 0;
        d.angularVelocity = 0;
    }
}

function markPocketedBall(sw: SimWorld, index: number): void {
    const d = sw.bodyMap[index]; if (!d || !d.enabled) return;
    d.enabled = false; d.center.x = 9999; d.center.y = 9999;
    d.velocity.x = 0; d.velocity.y = 0; d.velMag = 0; d.angularVelocity = 0;
}

function ensureSimWorldForShot(balls: SimBallInput[]): SimWorld {
    if (!SIM_WORLD || SIM_WORLD.bodyMap.length !== balls.length) SIM_WORLD = buildSimWorld(balls.length);
    resetSimWorld(SIM_WORLD, balls); return SIM_WORLD;
}
function ensureLiveWorld(balls: SimBallInput[]): SimWorld {
    if (!LIVE_WORLD || LIVE_WORLD.bodyMap.length !== balls.length) LIVE_WORLD = buildSimWorld(balls.length);
    resetSimWorld(LIVE_WORLD, balls); return LIVE_WORLD;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function applyShotImpulse(body: PhysicsDynamicBody | null, angle: number, power: number): void {
    if (!body) return;
    const { vx, vy } = velocityFromShot(angle, power);
    body.velocity.x = vx; body.velocity.y = vy;
    body.velMag = Math.hypot(vx, vy);
    body.angularVelocity = 0;
}

// Stub kept for API compatibility (no Rapier world)
export function rayCastCircle(
    _world: unknown, _rayOrigin: unknown, _rayDir: unknown,
    _maxDistance: number, _circleRadius: number, _ignoreRigidBody?: unknown,
): CircleCastHit | null { return null; }

// ---------------------------------------------------------------------------
// Guide casting — analytic ray-vs-sphere and ray-vs-offset-wall
// ---------------------------------------------------------------------------

export function castCueBallGuide(
    sim: LiveSimulation,
    origin: { x: number; y: number },
    unitDir: { x: number; y: number },
    maxDistance: number,
    excludeBallIndex: number = 0,
): GuideContactResult | null {
    const dirLen = Math.hypot(unitDir.x, unitDir.y);
    if (dirLen <= 1e-9 || maxDistance <= 0) return null;
    const ud = dirLen === 1 ? unitDir : { x: unitDir.x / dirLen, y: unitDir.y / dirLen };
    const R2 = R_PX * 2;
    let bestT = maxDistance, bestResult: GuideContactResult | null = null;

    // Ray vs each active ball (sphere of radius 2R)
    for (let i = 0; i < sim._simWorld.bodyMap.length; i++) {
        if (i === excludeBallIndex) continue;
        const body = sim._simWorld.bodyMap[i];
        if (!body || !body.enabled) continue;
        const cx = body.center.x - origin.x, cy = body.center.y - origin.y;
        const b  = ud.x * cx + ud.y * cy;
        const c  = cx * cx + cy * cy - R2 * R2;
        if (c < 0) continue;
        const disc = b * b - c;
        if (disc < 0) continue;
        const t = b - Math.sqrt(disc);
        if (t < 1e-4 || t >= bestT) continue;
        bestT = t;
        bestResult = {
            centerAtContact: { x: origin.x + ud.x * t, y: origin.y + ud.y * t },
            distance: t, isWall: false, ballIndex: i,
        };
    }

    // Ray vs offset cushion walls
    const wallHit = findFirstWallHitForBall(origin, ud, bestT);
    if (wallHit) bestResult = { ...wallHit, isWall: true, ballIndex: null };

    return bestResult;
}

export function findFirstWallHitForBall(
    origin: { x: number; y: number },
    unitDir: { x: number; y: number },
    maxDistance: number,
): { centerAtContact: { x: number; y: number }; distance: number } | null {
    let bestT = maxDistance, bestPos: { x: number; y: number } | null = null;
    for (let s = 0; s < CACHED_LINES.length; s++) {
        const line = CACHED_LINES[s], norm = CACHED_NORMALS[s];
        const { nx, ny } = norm;
        // Offset line inward by R_PX (so the ball centre touches here)
        const ox = line.start.x + nx * R_PX, oy = line.start.y + ny * R_PX;
        const ex = line.end.x   + nx * R_PX, ey = line.end.y   + ny * R_PX;
        const segDx = ex - ox, segDy = ey - oy;
        const denom = unitDir.x * segDy - unitDir.y * segDx;
        if (Math.abs(denom) < 1e-9) continue;
        const aX = ox - origin.x, aY = oy - origin.y;
        const t  = (aX * segDy - aY * segDx) / denom;
        const u  = (aX * unitDir.y - aY * unitDir.x) / denom;
        if (t < 1e-4 || t > bestT || u < 0 || u > 1) continue;
        bestT = t;
        bestPos = { x: origin.x + unitDir.x * t, y: origin.y + unitDir.y * t };
    }
    return bestPos ? { centerAtContact: bestPos, distance: bestT } : null;
}

// ---------------------------------------------------------------------------
// simulateShot
// ---------------------------------------------------------------------------
export function simulateShot(
    balls: SimBallInput[],
    cueIndexOrAngle: number, angleOrPower: number,
    maybePowerOrOpts?: number | SimShotOptions, maybeOpts?: SimShotOptions,
): ShotSimulationResult {
    let cueIndex: number, angle: number, power: number, opts: SimShotOptions | undefined;
    if (typeof maybePowerOrOpts === "number") {
        cueIndex = cueIndexOrAngle; angle = angleOrPower; power = maybePowerOrOpts; opts = maybeOpts;
    } else {
        cueIndex = findCueIndex(balls); angle = cueIndexOrAngle; power = angleOrPower;
        opts = maybePowerOrOpts;
    }
    const defResult: ShotSimulationResult = {
        balls: balls.map((b) => ({ ...b, visible: b.visible !== false, vx: b.vx ?? 0, vy: b.vy ?? 0 })),
        pocketedBalls: [], cuePocketed: false, eightPocketed: false,
        firstHitType: "none", firstHitNumber: null, railHit: false, objectBallRailHits: 0,
        cuePotted: false, cueFirstHit: "none", firstBallHitId: null, firstObjectRailHits: 0,
        pocketed: [], anyBallPocketed: false, legalContactMade: false,
        ballInHandAfterFoul: false, pottedCueAndEight: false, hitWall: false, brokeRack: false,
    };
    if (!balls.length || cueIndex < 0 || cueIndex >= balls.length) return defResult;
    const maxSteps     = Math.max(1, Math.min(opts?.maxSteps ?? SIMULATION_MAX_STEPS, 2000));
    const maxRuntimeMs = Math.max(5, opts?.maxRuntimeMs ?? 200);
    const dt  = 1 / SIMULATION_FPS;
    const sw  = ensureSimWorldForShot(balls);
    const cueDyn = sw.bodyMap[cueIndex];
    if (!cueDyn || !cueDyn.enabled) return defResult;
    applyShotImpulse(cueDyn, angle, power);
    const pocketed = new Set<number>(), firstObjectRails = new Set<number>();
    let firstHitIndex: number | null = null, hitWall = false;
    const start = Date.now();
    for (let step = 0; step < maxSteps; step++) {
        advanceSimWorld(sw, dt,
            () => { hitWall = true; },
            (i, j) => {
                if (firstHitIndex == null) {
                    if (i === cueIndex) firstHitIndex = j;
                    else if (j === cueIndex) firstHitIndex = i;
                }
                if (hitWall) {
                    if (i !== cueIndex) firstObjectRails.add(i);
                    if (j !== cueIndex) firstObjectRails.add(j);
                }
            },
        );
        for (let i = 0; i < sw.bodyMap.length; i++) {
            const d = sw.bodyMap[i]; if (!d || !d.enabled) continue;
            if (isInPocket(d.center.x, d.center.y)) { pocketed.add(i); markPocketedBall(sw, i); }
        }
        if (!isAnyMoving(sw)) break;
        if (Date.now() - start > maxRuntimeMs) break;
    }
    const fhb = firstHitIndex != null ? balls[firstHitIndex] : null;
    const result: ShotSimulationResult = { ...defResult };
    result.hitWall            = hitWall;
    result.firstBallHitId     = fhb ? String(fhb.id) : null;
    result.cueFirstHit        = classifyHitBall(fhb ?? undefined);
    result.pocketed           = [...pocketed].map((i) => classifyBall(balls[i]));
    result.cuePotted          = pocketed.has(cueIndex);
    result.anyBallPocketed    = pocketed.size > 0;
    result.legalContactMade   = result.cueFirstHit !== "none";
    result.firstObjectRailHits = firstObjectRails.size;
    result.pottedCueAndEight  = result.cuePotted && result.pocketed.includes("eight");
    result.brokeRack          = hitWall || firstObjectRails.size >= 4;
    result.firstHitType       = fhb ? fhb.type : "none";
    result.firstHitNumber     = fhb ? fhb.number : null;
    result.railHit            = hitWall;
    result.objectBallRailHits = firstObjectRails.size;
    result.pocketedBalls      = [...pocketed].map((i) => ({ ...toSimBallState(balls[i], null), pocketed: true }));
    result.balls              = balls.map((b, i) => toSimBallState(b, sw.bodyMap[i]));
    result.cuePocketed        = result.cuePotted;
    result.eightPocketed      = [...pocketed].some((i) => balls[i]?.type === "eight");
    const foul = result.cuePotted || result.cueFirstHit === "none" ||
        (result.cueFirstHit === "eight" && !result.pocketed.includes("eight"));
    result.ballInHandAfterFoul = foul;
    return result;
}

// ---------------------------------------------------------------------------
// Live simulation
// ---------------------------------------------------------------------------
export function createLiveSimulation(balls: SimBallInput[], angle?: number, power?: number): LiveSimulation {
    const sw = ensureLiveWorld(balls);
    const sim: LiveSimulation = {
        bodyMap: sw.bodyMap, active: true, allStopped: false,
        pocketed: new Set(), cuePotted: false, firstHit: null, wallHit: false,
        objectBallRailHitSet: new Set(), steps: 0, _simWorld: sw,
        balls: balls.map((b, i) => toSimBallState(b, sw.bodyMap[i])),
        pocketedBalls: [], settled: false, cuePocketed: false, eightPocketed: false,
        railHit: false, firstHitType: "none", firstHitNumber: null, objectBallRailHits: 0,
    };
    if (typeof angle === "number" && typeof power === "number") {
        kickOffLiveShot(sim, findCueIndex(balls), angle, power);
    }
    return sim;
}

export function kickOffLiveShot(sim: LiveSimulation, cueIndex: number, angle: number, power: number): void {
    if (!sim.active) return;
    const d = sim.bodyMap[cueIndex]; if (!d || !d.enabled) return;
    applyShotImpulse(d, angle, power); sim.allStopped = false;
}

function liveStepOnce(sim: LiveSimulation, cueIndex: number): void {
    advanceSimWorld(sim._simWorld, 1 / LIVE_FPS,
        () => { sim.wallHit = true; },
        (i, j) => {
            if (sim.firstHit == null) {
                if (i === cueIndex) sim.firstHit = j;
                else if (j === cueIndex) sim.firstHit = i;
            }
            if (i !== cueIndex) sim.objectBallRailHitSet.add(i);
            if (j !== cueIndex) sim.objectBallRailHitSet.add(j);
        },
    );
    let moving = false;
    for (let i = 0; i < sim.bodyMap.length; i++) {
        const d = sim.bodyMap[i]; if (!d || !d.enabled) continue;
        if (isInPocket(d.center.x, d.center.y)) {
            sim.pocketed.add(i);
            if (i === cueIndex) sim.cuePotted = true;
            markPocketedBall(sim._simWorld, i); continue;
        }
        if (d.velMag > SIMULATION_REST_EPS) moving = true;
    }
    sim.allStopped = !moving; sim.steps++;
}

export function stepLiveSimulation(sim: LiveSimulation, cueIndex?: number, fixedSteps = 1): void {
    if (!sim.active || sim.allStopped) return;
    const ci    = cueIndex ?? sim.balls.findIndex((b) => b.type === "cue" || b.number === 0);
    const steps = Math.max(1, Math.min(8, Math.floor(fixedSteps) || 1));
    for (let i = 0; i < steps; i++) { liveStepOnce(sim, Math.max(0, ci)); if (sim.allStopped) break; }
    sim.balls         = sim.balls.map((b, i) => toSimBallState(b, sim.bodyMap[i]));
    sim.pocketedBalls = [...sim.pocketed].map((i) => ({ ...toSimBallState(sim.balls[i], sim.bodyMap[i]), pocketed: true }));
    sim.cuePocketed   = sim.pocketed.has(Math.max(0, ci));
    sim.eightPocketed = [...sim.pocketed].some((i) => sim.balls[i]?.type === "eight");
    sim.railHit       = sim.wallHit;
    sim.firstHitType  = sim.firstHit != null ? sim.balls[sim.firstHit]?.type ?? "none" : "none";
    sim.firstHitNumber = sim.firstHit != null ? sim.balls[sim.firstHit]?.number ?? null : null;
    sim.objectBallRailHits = sim.objectBallRailHitSet.size;
    sim.settled = sim.allStopped;
}

export function stopLiveSimulation(sim: LiveSimulation): void { sim.active = false; }

export function snapshotLiveResult(
    sim: LiveSimulation, balls: SimBallInput[], cueIndex: number,
): ShotSimulationResult {
    const fhb = sim.firstHit != null ? balls[sim.firstHit] : null;
    const pk   = [...sim.pocketed].map((i) => classifyBall(balls[i]));
    const cuePotted = sim.pocketed.has(cueIndex);
    const result: ShotSimulationResult = {
        balls: balls.map((b, i) => toSimBallState(b, sim.bodyMap[i])),
        pocketedBalls: [...sim.pocketed].map((i) => ({ ...toSimBallState(balls[i], sim.bodyMap[i]), pocketed: true })),
        cuePocketed: cuePotted, eightPocketed: [...sim.pocketed].some((i) => balls[i]?.type === "eight"),
        firstHitType: fhb ? fhb.type : "none", firstHitNumber: fhb ? fhb.number : null,
        railHit: sim.wallHit, objectBallRailHits: sim.objectBallRailHitSet.size, cuePotted,
        cueFirstHit: classifyHitBall(fhb ?? undefined), firstBallHitId: fhb ? String(fhb.id) : null,
        firstObjectRailHits: sim.objectBallRailHitSet.size, pocketed: pk,
        anyBallPocketed: sim.pocketed.size > 0, legalContactMade: sim.firstHit != null,
        ballInHandAfterFoul: false,
        pottedCueAndEight: cuePotted && pk.includes("eight"),
        hitWall: sim.wallHit, brokeRack: sim.wallHit || sim.objectBallRailHitSet.size >= 4,
    };
    const foul = result.cuePotted || result.cueFirstHit === "none" ||
        (result.cueFirstHit === "eight" && !result.pocketed.includes("eight"));
    result.ballInHandAfterFoul = foul;
    return result;
}

// ---------------------------------------------------------------------------
// Body helpers
// ---------------------------------------------------------------------------
export function getBodyPosition(body: PhysicsDynamicBody | null): { x: number; y: number } {
    if (!body) return { x: 0, y: 0 }; return { x: body.center.x, y: body.center.y };
}
export function getBodyVelocity(body: PhysicsDynamicBody | null): { x: number; y: number } {
    if (!body) return { x: 0, y: 0 }; return { x: body.velocity.x, y: body.velocity.y };
}
export function isBodyMoving(body: PhysicsDynamicBody | null): boolean {
    if (!body) return false; return body.velMag > SIMULATION_REST_EPS;
}

export function simulateShotFrames(
    balls: SimBallInput[], cueIndex: number, angle: number, power: number, maxFrames = 180,
): Array<{ positions: Array<{ x: number; y: number; visible: boolean }>; hitWall: boolean }> {
    const sw = ensureSimWorldForShot(balls);
    const cd = sw.bodyMap[cueIndex]; if (!cd || !cd.enabled) return [];
    applyShotImpulse(cd, angle, power);
    const frames: Array<{ positions: Array<{ x: number; y: number; visible: boolean }>; hitWall: boolean }> = [];
    let hitWall = false;
    for (let frame = 0; frame < maxFrames; frame++) {
        advanceSimWorld(sw, 1 / SIMULATION_FPS, () => { hitWall = true; });
        for (let i = 0; i < sw.bodyMap.length; i++) {
            const d = sw.bodyMap[i]; if (!d || !d.enabled) continue;
            if (isInPocket(d.center.x, d.center.y)) markPocketedBall(sw, i);
        }
        frames.push({
            positions: sw.bodyMap.map((d) => d && d.enabled
                ? { x: d.center.x, y: d.center.y, visible: true }
                : { x: 0, y: 0, visible: false }),
            hitWall,
        });
        if (!isAnyMoving(sw)) break;
    }
    return frames;
}
