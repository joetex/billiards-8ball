import { physics as p } from "propel-js";

export type BallType = "solid" | "stripe" | "eight" | "cue";

export type SimBallState = {
    id: number;
    number: number;
    type: BallType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    visible: boolean;
};

export type PocketedBall = { number: number; type: BallType };

export type SimShotResult = {
    balls: SimBallState[];
    firstHitType: BallType | null;
    firstHitNumber: number | null;
    pocketed: PocketedBall[];
    cuePocketed: boolean;
    eightPocketed: boolean;
    railHit: boolean;
    objectBallRailHits: number;
};

export type SimFrame = Array<{ id: number; number: number; type: BallType; x: number; y: number; vx: number; vy: number; visible: boolean }>;

export const ANGLE_UINT_MAX = 16000;
export const POWER_UINT_MAX = 1000;

export const TABLE = {
    width: 1500,
    height: 750,
    cushionWidth: 57,
    pocketRadius: 48,
    pockets: [
        { x: 62, y: 62 },
        { x: 750, y: 32 },
        { x: 1435, y: 62 },
        { x: 62, y: 688 },
        { x: 750, y: 720 },
        { x: 1435, y: 688 },
    ],
} as const;

export const BALL = {
    diameter: 37,
    radius: 37 / 2,
    minVelocityLength: 0.02,
    maxPower: 40,
} as const;

export const PHYSICS = {
    friction: 0.0038,
    maxSimSteps: 8000,
    ballRestitution: 0.9,
    wallRestitution: 0.75,
    wallThickness: 200,
} as const;

export const RED_BALLS_POSITIONS = [
    { x: 1056, y: 433 },
    { x: 1090, y: 374 },
    { x: 1126, y: 393 },
    { x: 1126, y: 472 },
    { x: 1162, y: 335 },
    { x: 1162, y: 374 },
    { x: 1162, y: 452 },
] as const;

export const YELLOW_BALLS_POSITIONS = [
    { x: 1022, y: 413 },
    { x: 1056, y: 393 },
    { x: 1090, y: 452 },
    { x: 1126, y: 354 },
    { x: 1126, y: 433 },
    { x: 1162, y: 413 },
    { x: 1162, y: 491 },
] as const;

export const EIGHT_BALL_POSITION = { x: 1090, y: 413 } as const;
export const CUE_BALL_POSITION = { x: 413, y: 413 } as const;

const TWO_PI = Math.PI * 2;

export function encodeAngleToUint(angleRad: number): number {
    if (!Number.isFinite(angleRad)) return 0;
    const normalized = ((angleRad % TWO_PI) + TWO_PI) % TWO_PI;
    return Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round((normalized / TWO_PI) * ANGLE_UINT_MAX)));
}

export function decodeAngleFromUint(angleUint: number): number {
    if (!Number.isFinite(angleUint)) return 0;
    const clamped = Math.max(0, Math.min(ANGLE_UINT_MAX, Math.round(angleUint)));
    return (clamped / ANGLE_UINT_MAX) * TWO_PI;
}

export function encodePowerToUint(power: number): number {
    if (!Number.isFinite(power)) return 0;
    const clamped = Math.max(0, Math.min(BALL.maxPower, power));
    return Math.max(0, Math.min(POWER_UINT_MAX, Math.round((clamped / BALL.maxPower) * POWER_UINT_MAX)));
}

export function decodePowerFromUint(powerUint: number): number {
    if (!Number.isFinite(powerUint)) return 0;
    const clamped = Math.max(0, Math.min(POWER_UINT_MAX, Math.round(powerUint)));
    return (clamped / POWER_UINT_MAX) * BALL.maxPower;
}

export function cloneBalls(balls: SimBallState[]): SimBallState[] {
    return balls.map((b) => ({ ...b }));
}

export function createInitialBalls(): SimBallState[] {
    const balls: SimBallState[] = [];

    for (let i = 0; i < RED_BALLS_POSITIONS.length; i++) {
        const p = RED_BALLS_POSITIONS[i];
        balls.push({ id: balls.length, number: i + 1, type: "solid", x: p.x, y: p.y, vx: 0, vy: 0, visible: true });
    }

    for (let i = 0; i < YELLOW_BALLS_POSITIONS.length; i++) {
        const p = YELLOW_BALLS_POSITIONS[i];
        balls.push({ id: balls.length, number: i + 9, type: "stripe", x: p.x, y: p.y, vx: 0, vy: 0, visible: true });
    }

    balls.push({ id: balls.length, number: 8, type: "eight", x: EIGHT_BALL_POSITION.x, y: EIGHT_BALL_POSITION.y, vx: 0, vy: 0, visible: true });
    balls.push({ id: balls.length, number: 0, type: "cue", x: CUE_BALL_POSITION.x, y: CUE_BALL_POSITION.y, vx: 0, vy: 0, visible: true });

    return balls;
}

export function isInsidePocket(pos: { x: number; y: number }): boolean {
    for (let i = 0; i < TABLE.pockets.length; i++) {
        const pocket = TABLE.pockets[i];
        if (Math.hypot(pos.x - pocket.x, pos.y - pocket.y) <= TABLE.pocketRadius) {
            return true;
        }
    }
    return false;
}

export function isCueBallInsideTable(x: number, y: number): boolean {
    const radius = BALL.radius;
    if (x - radius <= TABLE.cushionWidth) return false;
    if (y - radius <= TABLE.cushionWidth) return false;
    if (x + radius >= TABLE.width - TABLE.cushionWidth) return false;
    if (y + radius >= TABLE.height - TABLE.cushionWidth) return false;
    return !isInsidePocket({ x, y });
}

export function isValidCueBallPlacement(balls: SimBallState[], x: number, y: number): boolean {
    if (!isCueBallInsideTable(x, y)) return false;

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (!ball.visible || ball.type === "cue") continue;
        if (Math.hypot(ball.x - x, ball.y - y) <= BALL.diameter) return false;
    }

    return true;
}

function buildSimWorld(balls: SimBallState[]) {
    const world = p.createWorld({ x: 0, y: 0 }, 9999);
    const wt = PHYSICS.wallThickness;
    const hw = TABLE.width / 2;
    const hh = TABLE.height / 2;
    const cw = TABLE.cushionWidth;

    const topWall = p.createRectangle(world, { x: hw, y: cw - wt / 2 }, TABLE.width + wt * 2, wt, 0, 0, PHYSICS.wallRestitution);
    p.addBody(world, topWall);
    const bottomWall = p.createRectangle(world, { x: hw, y: TABLE.height - cw + wt / 2 }, TABLE.width + wt * 2, wt, 0, 0, PHYSICS.wallRestitution);
    p.addBody(world, bottomWall);
    const leftWall = p.createRectangle(world, { x: cw - wt / 2, y: hh }, wt, TABLE.height + wt * 2, 0, 0, PHYSICS.wallRestitution);
    p.addBody(world, leftWall);
    const rightWall = p.createRectangle(world, { x: TABLE.width - cw + wt / 2, y: hh }, wt, TABLE.height + wt * 2, 0, 0, PHYSICS.wallRestitution);
    p.addBody(world, rightWall);

    const bodyMap: Array<p.DynamicRigidBody | null> = [];
    const bodyIdToIndex: Record<number, number> = {};

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (!ball.visible) {
            bodyMap.push(null);
            continue;
        }

        const body = p.createCircle(world, { x: ball.x, y: ball.y }, BALL.radius, 1, 0, PHYSICS.ballRestitution);
        p.addBody(world, body);
        const dynBody = body as p.DynamicRigidBody;
        dynBody.floating = true;
        dynBody.fixedRotation = true;
        dynBody.velocity = { x: ball.vx, y: ball.vy };
        dynBody.velMag = Math.hypot(ball.vx, ball.vy);
        bodyMap.push(dynBody);
        bodyIdToIndex[dynBody.id] = i;
    }

    return { world, bodyMap, bodyIdToIndex };
}

export function simulateShot(initialBalls: SimBallState[], angle: number, power: number): SimShotResult {
    const balls = cloneBalls(initialBalls);
    const result: Omit<SimShotResult, "balls"> = {
        firstHitType: null,
        firstHitNumber: null,
        pocketed: [],
        cuePocketed: false,
        eightPocketed: false,
        railHit: false,
        objectBallRailHits: 0,
    };

    const cueBallIndex = balls.findIndex((b) => b.type === "cue");
    if (cueBallIndex < 0) return { ...result, balls };

    const cueBall = balls[cueBallIndex];
    if (!cueBall.visible) {
        cueBall.visible = true;
        cueBall.x = CUE_BALL_POSITION.x;
        cueBall.y = CUE_BALL_POSITION.y;
    }
    cueBall.vx = power * Math.cos(angle);
    cueBall.vy = power * Math.sin(angle);

    const { world, bodyMap, bodyIdToIndex } = buildSimWorld(balls);
    const frictionFactor = 1 - PHYSICS.friction;
    const minVel = BALL.minVelocityLength;
    const pocketed = new Set<number>();
    const pocketedPos = new Map<number, { x: number; y: number }>();
    const pocketedMap: Record<number, true> = {};
    const objectBallRailHitIndexes = new Set<number>();

    for (let step = 0; step < PHYSICS.maxSimSteps; step++) {
        const collisions = p.worldStep(1, world);

        if (!result.firstHitType) {
            for (const col of collisions) {
                const aIdx = bodyIdToIndex[col.bodyAId];
                const bIdx = bodyIdToIndex[col.bodyBId];
                if (aIdx === undefined || bIdx === undefined) continue;
                if (aIdx === cueBallIndex || bIdx === cueBallIndex) {
                    const otherIdx = aIdx === cueBallIndex ? bIdx : aIdx;
                    result.firstHitType = balls[otherIdx].type;
                    result.firstHitNumber = balls[otherIdx].number;
                    break;
                }
            }
        }

        for (const col of collisions) {
            const aIdx = bodyIdToIndex[col.bodyAId];
            const bIdx = bodyIdToIndex[col.bodyBId];
            const aInBalls = aIdx !== undefined;
            const bInBalls = bIdx !== undefined;
            if (aInBalls !== bInBalls) {
                const ballIdx = aInBalls ? aIdx : bIdx;
                if (ballIdx !== undefined && balls[ballIdx].type !== "cue") {
                    objectBallRailHitIndexes.add(ballIdx);
                    result.objectBallRailHits = objectBallRailHitIndexes.size;
                }
                if (result.firstHitType !== null) {
                    result.railHit = true;
                }
            }
        }

        for (let i = 0; i < bodyMap.length; i++) {
            const body = bodyMap[i];
            if (!body || pocketed.has(i)) continue;
            body.velocity.x *= frictionFactor;
            body.velocity.y *= frictionFactor;
            const spd = Math.hypot(body.velocity.x, body.velocity.y);
            if (spd < minVel) {
                body.velocity.x = 0;
                body.velocity.y = 0;
                body.velMag = 0;
            } else {
                body.velMag = spd;
            }
        }

        for (let i = 0; i < bodyMap.length; i++) {
            if (pocketed.has(i)) continue;
            const body = bodyMap[i];
            if (!body) continue;
            if (isInsidePocket({ x: body.center.x, y: body.center.y })) {
                pocketedPos.set(i, { x: body.center.x, y: body.center.y });
                pocketed.add(i);
                p.disableBody(world, body);
                const ball = balls[i];
                if (!pocketedMap[ball.number]) {
                    pocketedMap[ball.number] = true;
                    result.pocketed.push({ number: ball.number, type: ball.type });
                }
                if (ball.type === "cue") result.cuePocketed = true;
                if (ball.type === "eight") result.eightPocketed = true;
            }
        }

        let settled = true;
        for (let i = 0; i < bodyMap.length; i++) {
            const body = bodyMap[i];
            if (pocketed.has(i) || !body) continue;
            if (Math.hypot(body.velocity.x, body.velocity.y) >= minVel) {
                settled = false;
                break;
            }
        }
        if (settled) break;
    }

    for (let i = 0; i < bodyMap.length; i++) {
        const ball = balls[i];
        if (pocketed.has(i)) {
            ball.visible = false;
            ball.vx = 0;
            ball.vy = 0;
            const pos = pocketedPos.get(i);
            if (pos) {
                ball.x = pos.x;
                ball.y = pos.y;
            }
        } else {
            const body = bodyMap[i];
            if (!body) continue;
            ball.x = body.center.x;
            ball.y = body.center.y;
            ball.vx = body.velocity.x;
            ball.vy = body.velocity.y;
        }
    }

    return { ...result, balls };
}

export function simulateShotFrames(initialBalls: Array<{ id?: number; number?: number; type?: BallType; x: number; y: number; vx: number; vy: number; visible: boolean }>, angle: number, power: number): SimFrame[] {
    const templateBalls = createInitialBalls();
    const balls: SimBallState[] = initialBalls.map((b, i) => {
        const template = templateBalls[i];
        return {
            id: typeof b.id === "number" ? b.id : i,
            number: typeof b.number === "number" ? b.number : (template ? template.number : i),
            type: b.type ? b.type : (template ? template.type : (i === initialBalls.length - 1 ? "cue" : "solid")),
            x: b.x,
            y: b.y,
            vx: b.vx,
            vy: b.vy,
            visible: b.visible,
        };
    });

    const cueBall = balls.find((b) => b.type === "cue") ?? balls[balls.length - 1];
    if (!cueBall) return [];

    if (!cueBall.visible) {
        cueBall.visible = true;
        cueBall.x = CUE_BALL_POSITION.x;
        cueBall.y = CUE_BALL_POSITION.y;
    }
    cueBall.vx = power * Math.cos(angle);
    cueBall.vy = power * Math.sin(angle);

    const { world, bodyMap } = buildSimWorld(balls);
    const frictionFactor = 1 - PHYSICS.friction;
    const minVel = BALL.minVelocityLength;
    const pocketed = new Set<number>();
    const pocketedPos = new Map<number, { x: number; y: number }>();
    const frames: SimFrame[] = [];

    for (let step = 0; step < PHYSICS.maxSimSteps; step++) {
        p.worldStep(1, world);

        for (let i = 0; i < bodyMap.length; i++) {
            const body = bodyMap[i];
            if (!body || pocketed.has(i)) continue;
            body.velocity.x *= frictionFactor;
            body.velocity.y *= frictionFactor;
            const spd = Math.hypot(body.velocity.x, body.velocity.y);
            if (spd < minVel) {
                body.velocity.x = 0;
                body.velocity.y = 0;
                body.velMag = 0;
            } else {
                body.velMag = spd;
            }
        }

        for (let i = 0; i < bodyMap.length; i++) {
            if (pocketed.has(i)) continue;
            const body = bodyMap[i];
            if (!body) continue;
            if (isInsidePocket({ x: body.center.x, y: body.center.y })) {
                pocketedPos.set(i, { x: body.center.x, y: body.center.y });
                pocketed.add(i);
                p.disableBody(world, body);
            }
        }

        frames.push(bodyMap.map((body, i) => {
            if (!body || pocketed.has(i)) {
                const pos = pocketedPos.get(i) ?? { x: balls[i].x, y: balls[i].y };
                return { id: balls[i].id, number: balls[i].number, type: balls[i].type, x: pos.x, y: pos.y, vx: 0, vy: 0, visible: false };
            }
            return { id: balls[i].id, number: balls[i].number, type: balls[i].type, x: body.center.x, y: body.center.y, vx: body.velocity.x, vy: body.velocity.y, visible: true };
        }));

        let settled = true;
        for (let i = 0; i < bodyMap.length; i++) {
            const body = bodyMap[i];
            if (pocketed.has(i) || !body) continue;
            if (Math.hypot(body.velocity.x, body.velocity.y) >= minVel) {
                settled = false;
                break;
            }
        }

        if (settled) break;
    }

    return frames;
}
