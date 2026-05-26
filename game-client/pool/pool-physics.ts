import RAPIER from "@dimforge/rapier2d-compat";
import { GameConfig } from "./game.config";

const BALL = {
    radius: GameConfig.ball.diameter / 2,
};

const PHYSICS = {
    ballRestitution: GameConfig.physics.maxRestitution,
    wallRestitution: GameConfig.physics.maxRestitution,
};

const SHOT = {
    minPower: 0,
    // Slight boost to restore pre-migration shot feel.
    maxPower: GameConfig.stick.maxPower * 1.2,
};

type CushionLine = {
    start: { x: number; y: number };
    end: { x: number; y: number };
};

export function getCushionLineDefinitions(): CushionLine[] {
    return [
        { start: { x: 108, y: 50 }, end: { x: 146, y: 81 } },
        { start: { x: 146, y: 80 }, end: { x: 703, y: 79 } },
        { start: { x: 703, y: 79 }, end: { x: 711, y: 50 } },
        { start: { x: 784, y: 51 }, end: { x: 789, y: 81 } },
        { start: { x: 790, y: 81 }, end: { x: 1352, y: 80 } },
        { start: { x: 1352, y: 80 }, end: { x: 1389, y: 51 } },
        { start: { x: 1442, y: 97 }, end: { x: 1406, y: 133 } },
        { start: { x: 1406, y: 133 }, end: { x: 1407, y: 616 } },
        { start: { x: 1407, y: 616 }, end: { x: 1443, y: 650 } },
        { start: { x: 60, y: 96 }, end: { x: 88, y: 131 } },
        { start: { x: 88, y: 131 }, end: { x: 85, y: 617 } },
        { start: { x: 85, y: 617 }, end: { x: 52, y: 656 } },
        { start: { x: 96, y: 694 }, end: { x: 139, y: 663 } },
        { start: { x: 139, y: 663 }, end: { x: 700, y: 662 } },
        { start: { x: 700, y: 662 }, end: { x: 712, y: 695 } },
        { start: { x: 780, y: 693 }, end: { x: 792, y: 662 } },
        { start: { x: 792, y: 662 }, end: { x: 1356, y: 661 } },
        { start: { x: 1356, y: 661 }, end: { x: 1399, y: 694 } },
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

const SIMULATION_FPS = 20;
// Velocity (units/s) used for both the moving check and the final snap to rest.
// Keeping a single threshold avoids state mismatches between "moving" detection
// and the body velocity actually stored on the render objects.
const SIMULATION_REST_EPS = 0.0125;
const SIMULATION_MAX_STEPS = 260;

const LIVE_FPS = 20;

const ANGLE_UINT_MAX = 65535;
const POWER_UINT_MAX = 255;
const POWER_INPUT_MAX = GameConfig.stick.maxPower;

let RAPierReady = false;
let rapierInitPromise: Promise<void> | null = null;

let SIM_WORLD: SimWorld | null = null;
let LIVE_WORLD: SimWorld | null = null;

export type PocketResult =
    | "none"
    | "cue"
    | "solid"
    | "stripe"
    | "eight"
    | "unknown";

export type SimBallType = "cue" | "solid" | "stripe" | "eight";

export type SimBallInput = {
    id: number;
    number: number;
    type: SimBallType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    visible: boolean;
    moving?: boolean;
};

export type SimBallState = SimBallInput & {
    dynBody?: PhysicsDynamicBody | null;
    body?: RAPIER.RigidBody | null;
    bodyId?: number;
    pocketed?: boolean;
};

export type SimShotOptions = {
    maxSteps?: number;
    maxRuntimeMs?: number;
};

export type ShotSimulationResult = {
    balls: SimBallState[];
    pocketedBalls: SimBallState[];
    cuePocketed: boolean;
    eightPocketed: boolean;
    firstHitType: "none" | SimBallType;
    firstHitNumber: number | null;
    railHit: boolean;
    objectBallRailHits: number;
    cuePotted: boolean;
    cueFirstHit: "none" | "solid" | "stripe" | "eight" | "unknown";
    firstBallHitId: string | null;
    firstObjectRailHits: number;
    pocketed: PocketResult[];
    anyBallPocketed: boolean;
    legalContactMade: boolean;
    ballInHandAfterFoul: boolean;
    pottedCueAndEight: boolean;
    hitWall: boolean;
    brokeRack: boolean;
};

type HitResult = "none" | "solid" | "stripe" | "eight" | "unknown";

export type LiveSimulation = {
    world: RAPIER.World;
    bodies: Array<RAPIER.RigidBody | null>;
    bodyMap: Array<PhysicsDynamicBody | null>;
    active: boolean;
    allStopped: boolean;
    pocketed: Set<number>;
    cuePotted: boolean;
    firstHit: number | null;
    wallHit: boolean;
    ballMapByBodyId: Record<number, number>;
    objectBallRailHitSet: Set<number>;
    steps: number;
    _lastStepMs: number;
    eventQueue: RAPIER.EventQueue;
    _simWorld: SimWorld;
    balls: SimBallState[];
    pocketedBalls: SimBallState[];
    settled: boolean;
    cuePocketed: boolean;
    eightPocketed: boolean;
    railHit: boolean;
    firstHitType: "none" | SimBallType;
    firstHitNumber: number | null;
    objectBallRailHits: number;
};

export type PhysicsDynamicBody = {
    id: number;
    body: RAPIER.RigidBody;
    collider: RAPIER.Collider;
    center: { x: number; y: number };
    velocity: { x: number; y: number };
    velMag: number;
    enabled: boolean;
};

type SimWorld = {
    world: RAPIER.World;
    eventQueue: RAPIER.EventQueue;
    bodies: Array<RAPIER.RigidBody | null>;
    colliders: Array<RAPIER.Collider | null>;
    bodyMap: Array<PhysicsDynamicBody | null>;
    colliderHandleToBallIndex: Map<number, number>;
    wallColliderHandles: Set<number>;
};

export const CUE_BALL_POSITION = {
    x: GameConfig.cueBallPosition.x,
    y: GameConfig.cueBallPosition.y,
};

export function createInitialBalls(_rackSeed?: number): SimBallInput[] {
    const rackCenterY = GameConfig.eightBallPosition.y;
    const rowSpacingY = BALL.radius * 1.02;
    const rowSpacingX = Math.sqrt(3) * rowSpacingY;
    const apexX = GameConfig.eightBallPosition.x - rowSpacingX * 2;

    const rackPos = (row: number, slot: number): { x: number; y: number } => {
        const x = apexX + row * rowSpacingX;
        const y = rackCenterY + (slot - row / 2) * (rowSpacingY * 2);
        return { x, y };
    };

    const rackByNumber: Record<number, { x: number; y: number }> = {
        1: rackPos(0, 0),
        9: rackPos(1, 0),
        2: rackPos(1, 1),
        10: rackPos(2, 0),
        8: rackPos(2, 1),
        3: rackPos(2, 2),
        11: rackPos(3, 0),
        4: rackPos(3, 1),
        12: rackPos(3, 2),
        5: rackPos(3, 3),
        13: rackPos(4, 0),
        6: rackPos(4, 1),
        14: rackPos(4, 2),
        7: rackPos(4, 3),
        15: rackPos(4, 4),
    };

    return [
        { id: 0, number: 0, type: "cue", x: GameConfig.cueBallPosition.x, y: GameConfig.cueBallPosition.y, visible: true, vx: 0, vy: 0 },
        { id: 1, number: 1, type: "solid", x: rackByNumber[1].x, y: rackByNumber[1].y, visible: true, vx: 0, vy: 0 },
        { id: 2, number: 2, type: "solid", x: rackByNumber[2].x, y: rackByNumber[2].y, visible: true, vx: 0, vy: 0 },
        { id: 3, number: 3, type: "solid", x: rackByNumber[3].x, y: rackByNumber[3].y, visible: true, vx: 0, vy: 0 },
        { id: 4, number: 4, type: "solid", x: rackByNumber[4].x, y: rackByNumber[4].y, visible: true, vx: 0, vy: 0 },
        { id: 5, number: 5, type: "solid", x: rackByNumber[5].x, y: rackByNumber[5].y, visible: true, vx: 0, vy: 0 },
        { id: 6, number: 6, type: "solid", x: rackByNumber[6].x, y: rackByNumber[6].y, visible: true, vx: 0, vy: 0 },
        { id: 7, number: 7, type: "solid", x: rackByNumber[7].x, y: rackByNumber[7].y, visible: true, vx: 0, vy: 0 },
        { id: 8, number: 8, type: "eight", x: rackByNumber[8].x, y: rackByNumber[8].y, visible: true, vx: 0, vy: 0 },
        { id: 9, number: 9, type: "stripe", x: rackByNumber[9].x, y: rackByNumber[9].y, visible: true, vx: 0, vy: 0 },
        { id: 10, number: 10, type: "stripe", x: rackByNumber[10].x, y: rackByNumber[10].y, visible: true, vx: 0, vy: 0 },
        { id: 11, number: 11, type: "stripe", x: rackByNumber[11].x, y: rackByNumber[11].y, visible: true, vx: 0, vy: 0 },
        { id: 12, number: 12, type: "stripe", x: rackByNumber[12].x, y: rackByNumber[12].y, visible: true, vx: 0, vy: 0 },
        { id: 13, number: 13, type: "stripe", x: rackByNumber[13].x, y: rackByNumber[13].y, visible: true, vx: 0, vy: 0 },
        { id: 14, number: 14, type: "stripe", x: rackByNumber[14].x, y: rackByNumber[14].y, visible: true, vx: 0, vy: 0 },
        { id: 15, number: 15, type: "stripe", x: rackByNumber[15].x, y: rackByNumber[15].y, visible: true, vx: 0, vy: 0 },
    ];
}

export function cloneBalls<T extends SimBallInput>(balls: T[]): T[] {
    return balls.map((ball) => ({ ...ball }));
}

export function isValidCueBallPlacement(balls: SimBallInput[], x: number, y: number): boolean {
    const lines = getCushionLineDefinitions();
    const minX = Math.min(...lines.map((line) => Math.min(line.start.x, line.end.x))) + BALL.radius;
    const maxX = Math.max(...lines.map((line) => Math.max(line.start.x, line.end.x))) - BALL.radius;
    const minY = Math.min(...lines.map((line) => Math.min(line.start.y, line.end.y))) + BALL.radius;
    const maxY = Math.max(...lines.map((line) => Math.max(line.start.y, line.end.y))) - BALL.radius;

    if (x < minX || x > maxX || y < minY || y > maxY) {
        return false;
    }

    if (isInPocket(x, y)) {
        return false;
    }

    const minDistance = BALL.radius * 2 * 0.98;
    const minDistanceSq = minDistance * minDistance;
    for (const ball of balls) {
        if (!ball.visible || ball.type === "cue" || ball.number === 0) {
            continue;
        }
        const dx = x - ball.x;
        const dy = y - ball.y;
        if (dx * dx + dy * dy < minDistanceSq) {
            return false;
        }
    }

    return true;
}

export function ensurePhysicsReady(): Promise<void> {
    if (RAPierReady) {
        return Promise.resolve();
    }

    if (!rapierInitPromise) {
        rapierInitPromise = RAPIER.init().then(() => {
            RAPierReady = true;
        });
    }

    return rapierInitPromise;
}

function assertPhysicsReady(): void {
    if (!RAPierReady) {
        throw new Error("Physics engine is not initialized. Call ensurePhysicsReady() before simulation.");
    }
}


export type CircleCastHit = {
    timeOfImpact: number;
    colliderHandle: number | null;
};


    export function lerp(from: number, to: number, t: number): number {
        return from + (to - from) * t;
    }

    export function lerpAngle(from: number, to: number, t: number): number {
        let diff = to - from;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return from + diff * t;
    }

export function rayCastCircle(
    world: RAPIER.World,
    rayOrigin: RAPIER.Vector,
    rayDir: RAPIER.Vector,
    maxDistance: number,
    circleRadius: number,
    ignoreRigidBody?: RAPIER.RigidBody,
): CircleCastHit | null {
    const dirLen = Math.hypot(rayDir.x, rayDir.y);
    if (dirLen <= 1e-9 || maxDistance <= 0) {
        return null;
    }

    const unitDir = { x: rayDir.x / dirLen, y: rayDir.y / dirLen };
    const shapeVel = { x: unitDir.x * maxDistance, y: unitDir.y * maxDistance };
    const circleShape = new RAPIER.Ball(circleRadius);

    // Rapier 0.19 added `targetDistance` between `shape` and `maxToi`.
    // targetDistance=0  → report a hit the moment shapes touch (normal contact).
    // maxToi=1.0        → travel the full |shapeVel| (= maxDistance) before giving up.
    // stopAtPenetration=false → don't abort early if the cast shape starts overlapping
    //                           something (e.g. the cue ball touching its own collider origin).
    const rawHit: any = world.castShape(
        rayOrigin,
        RAPIER.RotationOps.identity(),
        shapeVel,
        circleShape,
        0.0,   // targetDistance
        1.0,   // maxToi
        false, // stopAtPenetration
        undefined,
        undefined,
        undefined,
        ignoreRigidBody,
    );

    if (!rawHit) {
        return null;
    }

    const toiRaw = Number(rawHit.time_of_impact ?? rawHit.toi ?? rawHit.timeOfImpact);
    const colliderRaw = rawHit.colliderHandle ?? rawHit.collider;
    const colliderHandle = typeof colliderRaw === "number"
        ? colliderRaw
        : (colliderRaw && typeof colliderRaw.handle === "number" ? colliderRaw.handle : null);

    if (!Number.isFinite(toiRaw)) {
        return null;
    }

    return {
        timeOfImpact: toiRaw,
        colliderHandle,
    };
}



function buildSimWorld(ballCount: number, dt: number): SimWorld {
    const world = new RAPIER.World({ x: 0, y: 0 });
    world.timestep = dt;

    const eventQueue = new RAPIER.EventQueue(true);

    const bodies: Array<RAPIER.RigidBody | null> = new Array(ballCount).fill(null);
    const colliders: Array<RAPIER.Collider | null> = new Array(ballCount).fill(null);
    const bodyMap: Array<PhysicsDynamicBody | null> = new Array(ballCount).fill(null);
    const colliderHandleToBallIndex = new Map<number, number>();
    const wallColliderHandles = new Set<number>();

    for (let i = 0; i < ballCount; i += 1) {
        // physics.friction was tuned at 60 Hz (per-frame deceleration).
        // Convert to a continuous exponential-decay rate so Rapier applies the
        // same real-time deceleration regardless of the physics step size.
        const perFrameRetention60Hz = Math.max(1e-6, 1 - GameConfig.physics.friction);
        const linearDamping = -Math.log(perFrameRetention60Hz) * 60;
        const rbDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 0)
            .setGravityScale(0)
            .setLinearDamping(linearDamping)
            .setAngularDamping(0)
            .lockRotations()
            .setCanSleep(true);
        const body = world.createRigidBody(rbDesc);
        body.enableCcd(true);

        const collider = world.createCollider(
            RAPIER.ColliderDesc.ball(BALL.radius)
                .setRestitution(PHYSICS.ballRestitution)
                .setFriction(0)
                .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
            body,
        );

        const dynBody: PhysicsDynamicBody = {
            id: body.handle,
            body,
            collider,
            center: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            velMag: 0,
            enabled: true,
        };

        bodies[i] = body;
        colliders[i] = collider;
        bodyMap[i] = dynBody;
        colliderHandleToBallIndex.set(collider.handle, i);
    }

    const lineDefs = getCushionLineDefinitions();
    for (const line of lineDefs) {
        const wallBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
        const wallCollider = world.createCollider(
            RAPIER.ColliderDesc.segment({ x: line.start.x, y: line.start.y }, { x: line.end.x, y: line.end.y })
                .setRestitution(PHYSICS.wallRestitution)
                .setFriction(0)
                .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
            wallBody,
        );
        wallColliderHandles.add(wallCollider.handle);
    }

    return {
        world,
        eventQueue,
        bodies,
        colliders,
        bodyMap,
        colliderHandleToBallIndex,
        wallColliderHandles,
    };
}

function resetWorld(simWorld: SimWorld, balls: SimBallInput[]): void {
    for (let i = 0; i < simWorld.bodies.length; i += 1) {
        const input = balls[i] || { x: 0, y: 0, visible: false };
        const body = simWorld.bodies[i]!;
        const collider = simWorld.colliders[i]!;
        const dynBody = simWorld.bodyMap[i]!;

        const visible = input.visible !== false;
        dynBody.enabled = visible;

        body.setEnabled(visible);
        collider.setEnabled(visible);

        if (visible) {
            body.setTranslation({ x: input.x, y: input.y }, true);
            body.setLinvel({ x: input.vx || 0, y: input.vy || 0 }, true);
            body.setAngvel(0, true);
            const t = body.translation();
            const v = body.linvel();
            dynBody.center.x = t.x;
            dynBody.center.y = t.y;
            dynBody.velocity.x = v.x;
            dynBody.velocity.y = v.y;
            dynBody.velMag = Math.hypot(v.x, v.y);
        } else {
            body.setTranslation({ x: 9999, y: 9999 }, false);
            body.setLinvel({ x: 0, y: 0 }, false);
            body.setAngvel(0, false);
            dynBody.center.x = input.x || 0;
            dynBody.center.y = input.y || 0;
            dynBody.velocity.x = 0;
            dynBody.velocity.y = 0;
            dynBody.velMag = 0;
        }
    }

    simWorld.eventQueue.clear();
}

function syncDynBody(dynBody: PhysicsDynamicBody): void {
    const t = dynBody.body.translation();
    const v = dynBody.body.linvel();
    dynBody.center.x = t.x;
    dynBody.center.y = t.y;
    dynBody.velocity.x = v.x;
    dynBody.velocity.y = v.y;
    dynBody.velMag = Math.hypot(v.x, v.y);
}

function snapBodyAtRest(dynBody: PhysicsDynamicBody): void {
    if (dynBody.velMag >= SIMULATION_REST_EPS) {
        return;
    }
    dynBody.body.setLinvel({ x: 0, y: 0 }, true);
    dynBody.velocity.x = 0;
    dynBody.velocity.y = 0;
    dynBody.velMag = 0;
}

function classifyBall(ball: SimBallInput | undefined): PocketResult {
    if (!ball) {
        return "unknown";
    }
    if (ball.type === "cue") {
        return "cue";
    }
    if (ball.type === "eight") {
        return "eight";
    }
    if (ball.type === "solid") {
        return "solid";
    }
    if (ball.type === "stripe") {
        return "stripe";
    }
    return "unknown";
}

function classifyHitBall(ball: SimBallInput | undefined): HitResult {
    const classified = classifyBall(ball);
    return classified === "cue" ? "unknown" : classified;
}

function findCueIndex(balls: SimBallInput[]): number {
    const byType = balls.findIndex((ball) => ball.type === "cue" || ball.number === 0);
    return byType >= 0 ? byType : 0;
}

function toSimBallState(ball: SimBallInput, dynBody: PhysicsDynamicBody | null): SimBallState {
    return {
        ...ball,
        vx: dynBody?.velocity.x ?? ball.vx ?? 0,
        vy: dynBody?.velocity.y ?? ball.vy ?? 0,
        visible: dynBody?.enabled ?? ball.visible ?? true,
        x: dynBody?.center.x ?? ball.x,
        y: dynBody?.center.y ?? ball.y,
        dynBody,
        body: dynBody?.body ?? null,
        bodyId: dynBody?.id,
        pocketed: !(dynBody?.enabled ?? ball.visible ?? true),
    };
}

function isInPocket(x: number, y: number): boolean {
    for (const pocket of POCKETS) {
        const dx = x - pocket.x;
        const dy = y - pocket.y;
        if (dx * dx + dy * dy <= pocket.r * pocket.r) {
            return true;
        }
    }
    return false;
}

function velocityFromShot(angle: number, power: number): { vx: number; vy: number } {
    const clampedPower = Math.max(0, Math.min(POWER_INPUT_MAX, power));
    const normalized = clampedPower / POWER_INPUT_MAX;
    const speed = SHOT.minPower + (SHOT.maxPower - SHOT.minPower) * normalized;
    return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
    };
}

export function encodeAngleToUint(angleRad: number): number {
    const twoPi = Math.PI * 2;
    let normalized = angleRad % twoPi;
    if (normalized < 0) {
        normalized += twoPi;
    }
    return Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round((normalized / twoPi) * ANGLE_UINT_MAX)));
}

export function decodeAngleFromUint(angleUint: number): number {
    const clamped = Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round(angleUint)));
    return (clamped / ANGLE_UINT_MAX) * Math.PI * 2;
}

export function encodePowerToUint(power: number): number {
    const clamped = Math.max(0, Math.min(POWER_INPUT_MAX, power));
    return Math.max(0, Math.min(POWER_UINT_MAX, Math.round((clamped / POWER_INPUT_MAX) * POWER_UINT_MAX)));
}

export function decodePowerFromUint(powerUint: number): number {
    const clamped = Math.max(0, Math.min(POWER_UINT_MAX, Math.round(powerUint)));
    return (clamped / POWER_UINT_MAX) * POWER_INPUT_MAX;
}

export function velocityFromEncodedShot(angleUint: number, powerUint: number): { vx: number; vy: number } {
    return velocityFromShot(decodeAngleFromUint(angleUint), decodePowerFromUint(powerUint));
}

function markPocketedBall(simWorld: SimWorld, index: number): void {
    const dynBody = simWorld.bodyMap[index];
    if (!dynBody || !dynBody.enabled) {
        return;
    }

    dynBody.enabled = false;
    dynBody.body.setLinvel({ x: 0, y: 0 }, false);
    dynBody.body.setEnabled(false);
    dynBody.collider.setEnabled(false);
    dynBody.center.x = 9999;
    dynBody.center.y = 9999;
    dynBody.velocity.x = 0;
    dynBody.velocity.y = 0;
    dynBody.velMag = 0;
}

function ensureSimWorldForShot(balls: SimBallInput[], dt: number): SimWorld {
    if (!SIM_WORLD || SIM_WORLD.bodies.length !== balls.length) {
        if (SIM_WORLD) {
            SIM_WORLD.eventQueue.free();
            SIM_WORLD.world.free();
        }
        SIM_WORLD = buildSimWorld(balls.length, dt);
    }
    SIM_WORLD.world.timestep = dt;
    resetWorld(SIM_WORLD, balls);
    return SIM_WORLD;
}

function ensureLiveWorld(balls: SimBallInput[]): SimWorld {
    // Use the same fixed-step rate as the client game loop so live simulation
    // remains deterministic on lower-powered devices without requiring 120 Hz.
    const liveStepDt = 1 / SIMULATION_FPS;
    if (!LIVE_WORLD || LIVE_WORLD.bodies.length !== balls.length) {
        if (LIVE_WORLD) {
            LIVE_WORLD.eventQueue.free();
            LIVE_WORLD.world.free();
        }
        LIVE_WORLD = buildSimWorld(balls.length, liveStepDt);
    }
    LIVE_WORLD.world.timestep = liveStepDt;
    resetWorld(LIVE_WORLD, balls);
    return LIVE_WORLD;
}

function drainCollisionEvents(
    simWorld: SimWorld,
    cueIndex: number,
    onCueFirstHit: (otherIndex: number) => void,
    onObjectBallRailHit: (ballIndex: number) => void,
    onWallHit: () => void,
): void {
    simWorld.eventQueue.drainCollisionEvents((h1, h2, started) => {
        if (!started) {
            return;
        }

        const i1 = simWorld.colliderHandleToBallIndex.get(h1);
        const i2 = simWorld.colliderHandleToBallIndex.get(h2);

        if (i1 != null && i2 != null) {
            if (i1 === cueIndex && i2 !== cueIndex) {
                onCueFirstHit(i2);
            } else if (i2 === cueIndex && i1 !== cueIndex) {
                onCueFirstHit(i1);
            }
            return;
        }

        const h1Wall = simWorld.wallColliderHandles.has(h1);
        const h2Wall = simWorld.wallColliderHandles.has(h2);

        if (!h1Wall && !h2Wall) {
            return;
        }

        onWallHit();

        if (i1 != null && i1 !== cueIndex) {
            onObjectBallRailHit(i1);
            return;
        }

        if (i2 != null && i2 !== cueIndex) {
            onObjectBallRailHit(i2);
        }
    });
}

export function simulateShot(
    balls: SimBallInput[],
    cueIndexOrAngle: number,
    angleOrPower: number,
    maybePowerOrOpts?: number | SimShotOptions,
    maybeOpts?: SimShotOptions,
): ShotSimulationResult {
    assertPhysicsReady();

    let cueIndex: number;
    let angle: number;
    let power: number;
    let opts: SimShotOptions | undefined;

    if (typeof maybePowerOrOpts === "number") {
        cueIndex = cueIndexOrAngle;
        angle = angleOrPower;
        power = maybePowerOrOpts;
        opts = maybeOpts;
    } else {
        cueIndex = findCueIndex(balls);
        angle = cueIndexOrAngle;
        power = angleOrPower;
        opts = maybePowerOrOpts;
    }

    const defaultResult: ShotSimulationResult = {
        balls: balls.map((ball) => ({ ...ball, visible: ball.visible !== false, vx: ball.vx ?? 0, vy: ball.vy ?? 0 })),
        pocketedBalls: [],
        cuePocketed: false,
        eightPocketed: false,
        firstHitType: "none",
        firstHitNumber: null,
        railHit: false,
        objectBallRailHits: 0,
        cuePotted: false,
        cueFirstHit: "none",
        firstBallHitId: null,
        firstObjectRailHits: 0,
        pocketed: [],
        anyBallPocketed: false,
        legalContactMade: false,
        ballInHandAfterFoul: false,
        pottedCueAndEight: false,
        hitWall: false,
        brokeRack: false,
    };

    if (!balls.length || cueIndex < 0 || cueIndex >= balls.length) {
        return defaultResult;
    }

    const maxSteps = Math.max(1, Math.min(opts?.maxSteps ?? SIMULATION_MAX_STEPS, 2000));
    const maxRuntimeMs = Math.max(5, opts?.maxRuntimeMs ?? 120);

    const simWorld = ensureSimWorldForShot(balls, 1 / SIMULATION_FPS);

    const result: ShotSimulationResult = { ...defaultResult };

    const cueBody = simWorld.bodyMap[cueIndex];
    if (!cueBody || !cueBody.enabled) {
        return result;
    }

    applyShotImpulse(cueBody, angle, power);

    const firstObjectRailHits = new Set<number>();
    const pocketed = new Set<number>();
    let firstHitIndex: number | null = null;

    const start = Date.now();

    for (let step = 0; step < maxSteps; step += 1) {
        simWorld.world.step(simWorld.eventQueue);

        drainCollisionEvents(
            simWorld,
            cueIndex,
            (otherIndex) => {
                if (firstHitIndex == null) {
                    firstHitIndex = otherIndex;
                }
            },
            (ballIndex) => {
                firstObjectRailHits.add(ballIndex);
            },
            () => {
                result.hitWall = true;
            },
        );

        let moving = false;

        for (let i = 0; i < simWorld.bodyMap.length; i += 1) {
            const dynBody = simWorld.bodyMap[i];
            if (!dynBody || !dynBody.enabled) {
                continue;
            }

            syncDynBody(dynBody);

            if (isInPocket(dynBody.center.x, dynBody.center.y)) {
                pocketed.add(i);
                markPocketedBall(simWorld, i);
                continue;
            }

            if (dynBody.velMag > SIMULATION_REST_EPS) {
                moving = true;
            }

            snapBodyAtRest(dynBody);
        }

        if (!moving) {
            break;
        }

        if (Date.now() - start > maxRuntimeMs) {
            break;
        }
    }

    const firstHitBall = firstHitIndex != null ? balls[firstHitIndex] : null;
    result.firstBallHitId = firstHitBall ? String(firstHitBall.id) : null;
    result.cueFirstHit = firstHitBall ? classifyHitBall(firstHitBall) : "none";

    result.pocketed = [...pocketed].map((idx) => classifyBall(balls[idx]));
    result.cuePotted = pocketed.has(cueIndex);
    result.anyBallPocketed = pocketed.size > 0;
    result.legalContactMade = result.cueFirstHit !== "none";
    result.firstObjectRailHits = firstObjectRailHits.size;
    result.pottedCueAndEight = result.cuePotted && result.pocketed.includes("eight");
    result.brokeRack = result.hitWall || result.firstObjectRailHits >= 4;

    const foul =
        result.cuePotted ||
        result.cueFirstHit === "none" ||
        (result.cueFirstHit === "eight" && !result.pocketed.includes("eight"));
    result.ballInHandAfterFoul = foul;

    result.cuePocketed = result.cuePotted;
    result.eightPocketed = [...pocketed].some((idx) => balls[idx]?.type === "eight");
    result.firstHitType = firstHitBall ? firstHitBall.type : "none";
    result.firstHitNumber = firstHitBall ? firstHitBall.number : null;
    result.railHit = result.hitWall;
    result.objectBallRailHits = result.firstObjectRailHits;
    result.pocketedBalls = [...pocketed].map((idx) => ({ ...toSimBallState(balls[idx], null), pocketed: true }));
    result.balls = balls.map((ball, idx) => {
        const dynBody = simWorld.bodyMap[idx];
        return toSimBallState(ball, dynBody);
    });

    return result;
}

export function createLiveSimulation(balls: SimBallInput[], angle?: number, power?: number): LiveSimulation {
    assertPhysicsReady();

    const simWorld = ensureLiveWorld(balls);

    const ballMapByBodyId: Record<number, number> = {};
    for (let i = 0; i < simWorld.bodyMap.length; i += 1) {
        const body = simWorld.bodyMap[i];
        if (body) {
            ballMapByBodyId[body.id] = i;
        }
    }

    const sim: LiveSimulation = {
        world: simWorld.world,
        bodies: simWorld.bodies,
        bodyMap: simWorld.bodyMap,
        active: true,
        allStopped: false,
        pocketed: new Set<number>(),
        cuePotted: false,
        firstHit: null,
        wallHit: false,
        ballMapByBodyId,
        objectBallRailHitSet: new Set<number>(),
        steps: 0,
        _lastStepMs: Date.now(),
        eventQueue: simWorld.eventQueue,
        _simWorld: simWorld,
        balls: balls.map((ball, idx) => toSimBallState(ball, simWorld.bodyMap[idx])),
        pocketedBalls: [],
        settled: false,
        cuePocketed: false,
        eightPocketed: false,
        railHit: false,
        firstHitType: "none",
        firstHitNumber: null,
        objectBallRailHits: 0,
    };

    if (typeof angle === "number" && typeof power === "number") {
        kickOffLiveShot(sim, findCueIndex(balls), angle, power);
    }

    return sim;
}

function stepOnce(sim: LiveSimulation, cueIndex: number): void {
    sim.world.step(sim.eventQueue);

    drainCollisionEvents(
        sim._simWorld,
        cueIndex,
        (otherIndex) => {
            if (sim.firstHit == null) {
                sim.firstHit = otherIndex;
            }
        },
        (ballIndex) => {
            sim.objectBallRailHitSet.add(ballIndex);
        },
        () => {
            sim.wallHit = true;
        },
    );

    let moving = false;

    for (let i = 0; i < sim.bodyMap.length; i += 1) {
        const dynBody = sim.bodyMap[i];
        if (!dynBody || !dynBody.enabled) {
            continue;
        }

        syncDynBody(dynBody);

        if (isInPocket(dynBody.center.x, dynBody.center.y)) {
            sim.pocketed.add(i);
            if (i === cueIndex) {
                sim.cuePotted = true;
            }
            markPocketedBall(sim._simWorld, i);
            continue;
        }

        if (dynBody.velMag > SIMULATION_REST_EPS) {
            moving = true;
        }

        snapBodyAtRest(dynBody);
    }

    sim.allStopped = !moving;
    sim.steps += 1;
}

export function stepLiveSimulation(sim: LiveSimulation, cueIndex?: number, fixedSteps = 1): void {
    if (!sim.active || sim.allStopped) {
        return;
    }

    const resolvedCueIndex = cueIndex ?? sim.balls.findIndex((ball) => ball.type === "cue" || ball.number === 0);

    const steps = Math.max(1, Math.min(8, Math.floor(fixedSteps) || 1));

    for (let i = 0; i < steps; i += 1) {
        stepOnce(sim, Math.max(0, resolvedCueIndex));
        if (sim.allStopped) {
            break;
        }
    }

    sim.balls = sim.balls.map((ball, idx) => toSimBallState(ball, sim.bodyMap[idx]));
    sim.pocketedBalls = [...sim.pocketed].map((idx) => ({ ...toSimBallState(sim.balls[idx], sim.bodyMap[idx]), pocketed: true }));
    sim.cuePocketed = sim.pocketed.has(Math.max(0, resolvedCueIndex));
    sim.eightPocketed = [...sim.pocketed].some((idx) => sim.balls[idx]?.type === "eight");
    sim.railHit = sim.wallHit;
    sim.firstHitType = sim.firstHit != null ? sim.balls[sim.firstHit]?.type ?? "none" : "none";
    sim.firstHitNumber = sim.firstHit != null ? sim.balls[sim.firstHit]?.number ?? null : null;
    sim.objectBallRailHits = sim.objectBallRailHitSet.size;
    sim.settled = sim.allStopped;
}

export function stopLiveSimulation(sim: LiveSimulation): void {
    sim.active = false;
}

export function kickOffLiveShot(sim: LiveSimulation, cueIndex: number, angle: number, power: number): void {
    if (!sim.active) {
        return;
    }

    const cueBody = sim.bodyMap[cueIndex];
    if (!cueBody || !cueBody.enabled) {
        return;
    }

    applyShotImpulse(cueBody, angle, power);
    sim.allStopped = false;
}

export function snapshotLiveResult(
    sim: LiveSimulation,
    balls: SimBallInput[],
    cueIndex: number,
): ShotSimulationResult {
    const firstHitBall = sim.firstHit != null ? balls[sim.firstHit] : null;
    const pocketedKinds = [...sim.pocketed].map((idx) => classifyBall(balls[idx]));

    const cuePotted = sim.pocketed.has(cueIndex);

    const result: ShotSimulationResult = {
        balls: balls.map((ball, idx) => toSimBallState(ball, sim.bodyMap[idx])),
        pocketedBalls: [...sim.pocketed].map((idx) => ({ ...toSimBallState(balls[idx], sim.bodyMap[idx]), pocketed: true })),
        cuePocketed: cuePotted,
        eightPocketed: [...sim.pocketed].some((idx) => balls[idx]?.type === "eight"),
        firstHitType: firstHitBall ? firstHitBall.type : "none",
        firstHitNumber: firstHitBall ? firstHitBall.number : null,
        railHit: sim.wallHit,
        objectBallRailHits: sim.objectBallRailHitSet.size,
        cuePotted,
        cueFirstHit: firstHitBall ? classifyHitBall(firstHitBall) : "none",
        firstBallHitId: firstHitBall ? String(firstHitBall.id) : null,
        firstObjectRailHits: sim.objectBallRailHitSet.size,
        pocketed: pocketedKinds,
        anyBallPocketed: sim.pocketed.size > 0,
        legalContactMade: sim.firstHit != null,
        ballInHandAfterFoul: false,
        pottedCueAndEight: cuePotted && pocketedKinds.includes("eight"),
        hitWall: sim.wallHit,
        brokeRack: sim.wallHit || sim.objectBallRailHitSet.size >= 4,
    };

    const foul =
        result.cuePotted ||
        result.cueFirstHit === "none" ||
        (result.cueFirstHit === "eight" && !result.pocketed.includes("eight"));
    result.ballInHandAfterFoul = foul;

    return result;
}

export function getBodyPosition(body: PhysicsDynamicBody | null): { x: number; y: number } {
    if (!body) {
        return { x: 0, y: 0 };
    }
    return { x: body.center.x, y: body.center.y };
}

export function getBodyVelocity(body: PhysicsDynamicBody | null): { x: number; y: number } {
    if (!body) {
        return { x: 0, y: 0 };
    }
    return { x: body.velocity.x, y: body.velocity.y };
}

export function isBodyMoving(body: PhysicsDynamicBody | null): boolean {
    if (!body) {
        return false;
    }
    return body.velMag > SIMULATION_REST_EPS;
}

export function applyShotImpulse(
    body: PhysicsDynamicBody | null,
    angle: number,
    power: number,
): void {
    if (!body) {
        return;
    }
    const shotVel = velocityFromShot(angle, power);
    const currentVel = body.body.linvel();
    const mass = body.body.mass();
    const impulseX = (shotVel.vx - currentVel.x) * mass;
    const impulseY = (shotVel.vy - currentVel.y) * mass;
    body.body.applyImpulse({ x: impulseX, y: impulseY }, true);

    const nextVel = body.body.linvel();
    body.velocity.x = nextVel.x;
    body.velocity.y = nextVel.y;
    body.velMag = Math.hypot(nextVel.x, nextVel.y);
}

export function simulateShotFrames(
    balls: SimBallInput[],
    cueIndex: number,
    angle: number,
    power: number,
    maxFrames = 180,
): Array<{
    positions: Array<{ x: number; y: number; visible: boolean }>;
    hitWall: boolean;
}> {
    assertPhysicsReady();

    const simWorld = ensureSimWorldForShot(balls, 1 / SIMULATION_FPS);
    const cueBody = simWorld.bodyMap[cueIndex];
    if (!cueBody || !cueBody.enabled) {
        return [];
    }

    applyShotImpulse(cueBody, angle, power);

    const frames: Array<{ positions: Array<{ x: number; y: number; visible: boolean }>; hitWall: boolean }> = [];
    let hitWall = false;

    for (let frame = 0; frame < maxFrames; frame += 1) {
        simWorld.world.step(simWorld.eventQueue);

        simWorld.eventQueue.drainCollisionEvents((h1, h2, started) => {
            if (!started) {
                return;
            }
            if (simWorld.wallColliderHandles.has(h1) || simWorld.wallColliderHandles.has(h2)) {
                hitWall = true;
            }
        });

        let anyMoving = false;

        for (let i = 0; i < simWorld.bodyMap.length; i += 1) {
            const dynBody = simWorld.bodyMap[i];
            if (!dynBody || !dynBody.enabled) {
                continue;
            }

            syncDynBody(dynBody);

            if (isInPocket(dynBody.center.x, dynBody.center.y)) {
                markPocketedBall(simWorld, i);
                continue;
            }

            if (dynBody.velMag > SIMULATION_REST_EPS) {
                anyMoving = true;
            }

            snapBodyAtRest(dynBody);
        }

        const positions = simWorld.bodyMap.map((dynBody) => {
            if (!dynBody || !dynBody.enabled) {
                return { x: 0, y: 0, visible: false };
            }
            return {
                x: dynBody.center.x,
                y: dynBody.center.y,
                visible: true,
            };
        });

        frames.push({ positions, hitWall });

        if (!anyMoving) {
            break;
        }
    }

    return frames;
}
