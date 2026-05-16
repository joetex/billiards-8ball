import { ACOSServer } from "@acosgames/framework";
import { physics as p } from "propel-js";

function game() {
    return ACOSServer.game();
}

const TABLE = {
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
};

const BALL = {
    diameter: 37,
    radius: 37 / 2,
    minVelocityLength: 0.02,
    maxPower: 40,
};

const PHYSICS = {
    friction: 0.0038,
    minRestitution: 0.04,
    maxRestitution: 0.78,
    restitutionSpeedLow: 0.5,
    restitutionSpeedHigh: 12.0,
    maxSimSteps: 8000,
};

const RED_BALLS_POSITIONS = [
    { x: 1056, y: 433 },
    { x: 1090, y: 374 },
    { x: 1126, y: 393 },
    { x: 1126, y: 472 },
    { x: 1162, y: 335 },
    { x: 1162, y: 374 },
    { x: 1162, y: 452 },
];

const YELLOW_BALLS_POSITIONS = [
    { x: 1022, y: 413 },
    { x: 1056, y: 393 },
    { x: 1090, y: 452 },
    { x: 1126, y: 354 },
    { x: 1126, y: 433 },
    { x: 1162, y: 413 },
    { x: 1162, y: 491 },
];

const EIGHT_BALL_POSITION = { x: 1090, y: 413 };
const CUE_BALL_POSITION = { x: 413, y: 413 };

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function oppositeGroup(group) {
    if (group === "solid") return "stripe";
    if (group === "stripe") return "solid";
    return null;
}

function randomInt(maxExclusive) {
    const r = typeof ACOSServer.random === "function" ? ACOSServer.random() : Math.random();
    return Math.floor(r * maxExclusive);
}

function createInitialBalls() {
    const balls = [];

    for (let i = 0; i < RED_BALLS_POSITIONS.length; i++) {
        const p = RED_BALLS_POSITIONS[i];
        balls.push({
            id: balls.length,
            number: i + 1,
            type: "solid",
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            visible: true,
        });
    }

    for (let i = 0; i < YELLOW_BALLS_POSITIONS.length; i++) {
        const p = YELLOW_BALLS_POSITIONS[i];
        balls.push({
            id: balls.length,
            number: i + 9,
            type: "stripe",
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            visible: true,
        });
    }

    balls.push({
        id: balls.length,
        number: 8,
        type: "eight",
        x: EIGHT_BALL_POSITION.x,
        y: EIGHT_BALL_POSITION.y,
        vx: 0,
        vy: 0,
        visible: true,
    });

    balls.push({
        id: balls.length,
        number: 0,
        type: "cue",
        x: CUE_BALL_POSITION.x,
        y: CUE_BALL_POSITION.y,
        vx: 0,
        vy: 0,
        visible: true,
    });

    return balls;
}

function cloneBalls(balls) {
    return balls.map((b) => ({ ...b }));
}

function ensurePlayerFields(player) {
    if (!player) return;
    if (typeof player.get("angle") !== "number") player.set("angle", 0);
    if (typeof player.get("power") !== "number") player.set("power", 0);
    if (!Array.isArray(player.get("collectedBalls"))) player.set("collectedBalls", []);
    if (typeof player.get("group") !== "string") player.set("group", null);
    if (typeof player.get("lastShotAngle") !== "number") player.set("lastShotAngle", 0);
    if (typeof player.get("lastShotPower") !== "number") player.set("lastShotPower", 0);
}

function ensureState(gs) {
    const state = gs.state();
    if (!state || typeof state !== "object") {
        gs.state("balls", createInitialBalls());
    }

    if (!Array.isArray(gs.state("balls"))) {
        gs.state("balls", createInitialBalls());
    }

    if (typeof gs.state("shotSerial") !== "number") gs.state("shotSerial", 0);
    if (typeof gs.state("foul") !== "boolean") gs.state("foul", false);
    if (typeof gs.state("winnerId") !== "number") gs.state("winnerId", -1);
    if (typeof gs.state("shotInProgress") !== "boolean") gs.state("shotInProgress", false);
    if (!gs.state("lastShot") || typeof gs.state("lastShot") !== "object") gs.state("lastShot", {});
    if (typeof gs.state("cueBallInHand") !== "boolean") gs.state("cueBallInHand", false);
    if (!gs.state("cueBallPlacement") || typeof gs.state("cueBallPlacement") !== "object") gs.state("cueBallPlacement", {});
}

function getActivePlayers(gs) {
    const all = gs.players();
    return all;
    // return all.filter((p) => p && p.inGame !== false);
}

function getOpponent(gs, shooterId) {
    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        if (players[i].id !== shooterId) return players[i];
    }
    return null;
}

function isInsidePocket(ball) {
    for (let i = 0; i < TABLE.pockets.length; i++) {
        const pocket = TABLE.pockets[i];
        const dx = ball.x - pocket.x;
        const dy = ball.y - pocket.y;
        if (Math.hypot(dx, dy) <= TABLE.pocketRadius) {
            return true;
        }
    }
    return false;
}

function isCueBallInsideTable(x, y) {
    const radius = BALL.radius;
    if (x - radius <= TABLE.cushionWidth) return false;
    if (y - radius <= TABLE.cushionWidth) return false;
    if (x + radius >= TABLE.width - TABLE.cushionWidth) return false;
    if (y + radius >= TABLE.height - TABLE.cushionWidth) return false;
    return !isInsidePocket({ x, y });
}

function isValidCueBallPlacement(balls, x, y) {
    if (!isCueBallInsideTable(x, y)) {
        return false;
    }

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (!ball.visible || ball.type === "cue") {
            continue;
        }
        if (Math.hypot(ball.x - x, ball.y - y) <= BALL.diameter) {
            return false;
        }
    }

    return true;
}

function setCueBallPosition(gs, x, y) {
    const balls = Array.isArray(gs.state("balls")) ? cloneBalls(gs.state("balls")) : createInitialBalls();
    const cueBall = balls.find((b) => b.type === "cue");
    if (!cueBall) {
        return;
    }

    cueBall.visible = true;
    cueBall.x = x;
    cueBall.y = y;
    cueBall.vx = 0;
    cueBall.vy = 0;
    gs.state("balls", balls);
}

// Propel-js simulation constants
const SIM_BALL_RESTITUTION = 0.9;
const SIM_WALL_RESTITUTION = 0.75;
const SIM_WALL_THICKNESS = 200;

function buildSimWorld(balls) {
    const world = p.createWorld({ x: 0, y: 0 }, 9999);
    const wt = SIM_WALL_THICKNESS;
    const hw = TABLE.width / 2;
    const hh = TABLE.height / 2;
    const cw = TABLE.cushionWidth;

    // Static wall rectangles — inner face aligned with cushion edge
    const topWall = p.createRectangle(world, { x: hw, y: cw - wt / 2 }, TABLE.width + wt * 2, wt, 0, 0, SIM_WALL_RESTITUTION);
    p.addBody(world, topWall);
    const bottomWall = p.createRectangle(world, { x: hw, y: TABLE.height - cw + wt / 2 }, TABLE.width + wt * 2, wt, 0, 0, SIM_WALL_RESTITUTION);
    p.addBody(world, bottomWall);
    const leftWall = p.createRectangle(world, { x: cw - wt / 2, y: hh }, wt, TABLE.height + wt * 2, 0, 0, SIM_WALL_RESTITUTION);
    p.addBody(world, leftWall);
    const rightWall = p.createRectangle(world, { x: TABLE.width - cw + wt / 2, y: hh }, wt, TABLE.height + wt * 2, 0, 0, SIM_WALL_RESTITUTION);
    p.addBody(world, rightWall);

    const bodyMap = [];
    const bodyIdToIndex = {};

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (!ball.visible) {
            bodyMap.push(null);
            continue;
        }
        const body = p.createCircle(world, { x: ball.x, y: ball.y }, BALL.radius, 1, 0, SIM_BALL_RESTITUTION);
        p.addBody(world, body);
        body.floating = true;
        body.fixedRotation = true;
        body.velocity = { x: ball.vx, y: ball.vy };
        body.velMag = Math.hypot(ball.vx, ball.vy);
        bodyMap.push(body);
        bodyIdToIndex[body.id] = i;
    }

    return { world, bodyMap, bodyIdToIndex };
}

function simulateShot(initialBalls, angle, power) {
    const balls = cloneBalls(initialBalls);
    const result = {
        firstHitType: null,
        firstHitNumber: null,
        pocketed: [],
        pocketedMap: {},
        cuePocketed: false,
        eightPocketed: false,
    };

    const cueBallIndex = balls.findIndex((b) => b.type === "cue");
    if (cueBallIndex < 0) return { balls, ...result };

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
    const pocketed = new Set();
    const pocketedPos = new Map();

    for (let step = 0; step < PHYSICS.maxSimSteps; step++) {
        const collisions = p.worldStep(1, world);

        // Track the first ball type the cue ball hits
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

        // Apply rolling friction and clamp near-zero velocities
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

        // Pocket detection
        for (let i = 0; i < bodyMap.length; i++) {
            if (pocketed.has(i)) continue;
            const body = bodyMap[i];
            if (!body) continue;
            if (isInsidePocket({ x: body.center.x, y: body.center.y })) {
                pocketedPos.set(i, { x: body.center.x, y: body.center.y });
                pocketed.add(i);
                p.disableBody(world, body);
                const ball = balls[i];
                if (!result.pocketedMap[ball.number]) {
                    result.pocketedMap[ball.number] = true;
                    result.pocketed.push({ number: ball.number, type: ball.type });
                }
                if (ball.type === "cue") result.cuePocketed = true;
                if (ball.type === "eight") result.eightPocketed = true;
            }
        }

        // Stop once all visible balls have settled
        let settled = true;
        for (let i = 0; i < bodyMap.length; i++) {
            if (pocketed.has(i) || !bodyMap[i]) continue;
            if (Math.hypot(bodyMap[i].velocity.x, bodyMap[i].velocity.y) >= minVel) {
                settled = false;
                break;
            }
        }
        if (settled) break;
    }

    // Write final positions back to ball objects
    for (let i = 0; i < bodyMap.length; i++) {
        const ball = balls[i];
        if (pocketed.has(i)) {
            ball.visible = false;
            ball.vx = 0;
            ball.vy = 0;
            const pos = pocketedPos.get(i);
            if (pos) { ball.x = pos.x; ball.y = pos.y; }
        } else if (bodyMap[i]) {
            ball.x = bodyMap[i].center.x;
            ball.y = bodyMap[i].center.y;
            ball.vx = bodyMap[i].velocity.x;
            ball.vy = bodyMap[i].velocity.y;
        }
    }

    delete result.pocketedMap;
    return { balls, ...result };
}

function assignGroupsIfNeeded(gs, shooter, opponent, pocketed) {
    const shooterGroup = shooter.get("group");
    if (shooterGroup === "solid" || shooterGroup === "stripe") {
        return;
    }

    const firstColoredPocket = pocketed.find((p) => p.type === "solid" || p.type === "stripe");
    if (!firstColoredPocket) {
        return;
    }

    shooter.set("group", firstColoredPocket.type);
    if (opponent) {
        opponent.set("group", oppositeGroup(firstColoredPocket.type));
    }
}

function pushCollectedBall(player, ballNumber) {
    const existing = Array.isArray(player.get("collectedBalls")) ? player.get("collectedBalls") : [];
    if (existing.includes(ballNumber)) {
        return;
    }
    player.set("collectedBalls", [...existing, ballNumber]);
}

function updateCollected(gs, shooter, opponent, pocketed) {
    const shooterGroup = shooter.get("group");
    const opponentGroup = opponent ? opponent.get("group") : null;

    for (let i = 0; i < pocketed.length; i++) {
        const pocket = pocketed[i];
        if (pocket.type !== "solid" && pocket.type !== "stripe") {
            continue;
        }

        if (shooterGroup && pocket.type === shooterGroup) {
            pushCollectedBall(shooter, pocket.number);
        } else if (opponent && opponentGroup && pocket.type === opponentGroup) {
            pushCollectedBall(opponent, pocket.number);
        }
    }
}

function chooseStartingPlayer(gs) {
    const players = getActivePlayers(gs);
    if (players.length === 0) return null;
    return players[randomInt(players.length)] || null;
}

function applyShotResult(gs, shooterId, angle, power, result) {
    const state = gs.state();
    const shooter = gs.player(shooterId);
    const opponent = getOpponent(gs, shooterId);

    if (!shooter) {
        return;
    }

    ensurePlayerFields(shooter);
    if (opponent) ensurePlayerFields(opponent);

    assignGroupsIfNeeded(gs, shooter, opponent, result.pocketed);
    updateCollected(gs, shooter, opponent, result.pocketed);

    const shooterGroup = shooter.get("group");
    const shooterCollectedCount = Array.isArray(shooter.get("collectedBalls")) ? shooter.get("collectedBalls").length : 0;

    const noFirstHit = !result.firstHitType;
    const wrongFirstHit = shooterGroup && (result.firstHitType === oppositeGroup(shooterGroup));
    const hitEightTooEarly = shooterGroup && result.firstHitType === "eight" && shooterCollectedCount < 7;
    const pocketedWrongColor = shooterGroup && result.pocketed.some((p) => (p.type === "solid" || p.type === "stripe") && p.type !== shooterGroup);

    const foul = result.cuePocketed || noFirstHit || wrongFirstHit || hitEightTooEarly || pocketedWrongColor;

    let winnerId = -1;
    if (result.eightPocketed) {
        if (!foul && shooterGroup && shooterCollectedCount >= 7) {
            winnerId = shooter.id;
        } else if (opponent) {
            winnerId = opponent.id;
        }
    }

    shooter.set("angle", angle);
    shooter.set("power", power);
    shooter.set("lastShotAngle", angle);
    shooter.set("lastShotPower", power);

    gs.state("balls", result.balls);
    gs.state("foul", foul);
    gs.state("winnerId", winnerId);
    gs.state("shotInProgress", false);
    gs.state("cueBallInHand", foul);
    gs.state("lastShot", {
        by: shooter.id,
        angle,
        power,
        firstHitType: result.firstHitType,
        firstHitNumber: result.firstHitNumber,
        pocketed: result.pocketed,
        foul,
        winnerId,
    });
    gs.state("shotSerial", (state.shotSerial || 0) + 1);

    if (foul) {
        const balls = Array.isArray(gs.state("balls")) ? cloneBalls(gs.state("balls")) : createInitialBalls();
        const cueBall = balls.find((b) => b.type === "cue");
        if (cueBall) {
            cueBall.visible = true;
            cueBall.x = CUE_BALL_POSITION.x;
            cueBall.y = CUE_BALL_POSITION.y;
            cueBall.vx = 0;
            cueBall.vy = 0;
            gs.state("balls", balls);
            gs.state("cueBallPlacement", {
                x: cueBall.x,
                y: cueBall.y,
                by: shooter.id,
                placed: false,
                updatedAt: Date.now(),
            });
        }
    } else {
        gs.state("cueBallPlacement", {});
    }

    if (winnerId >= 0) {
        ACOSServer.gameover({ type: "winner", payload: winnerId });
        return;
    }

    const ownPocketed = shooterGroup
        ? result.pocketed.some((p) => p.type === shooterGroup)
        : result.pocketed.some((p) => p.type === "solid" || p.type === "stripe");

    let nextPlayerId = shooter.id;
    if (foul || !ownPocketed) {
        nextPlayerId = opponent ? opponent.id : shooter.id;
    }

    gs.setNextPlayer(nextPlayerId);
    gs.setNextAction("shoot");
    gs.setTimerSet(20000);
}

export function onNewGame(_action) {
    const gs = game();
    gs.state("balls", createInitialBalls());
    gs.state("shotSerial", 0);
    gs.state("foul", false);
    gs.state("winnerId", -1);
    gs.state("shotInProgress", false);
    gs.state("lastShot", {});
    gs.state("cueBallInHand", false);
    gs.state("cueBallPlacement", {});

    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ensurePlayerFields(player);
        player.set("collectedBalls", []);
        player.set("group", null);
        player.set("power", 0);
        player.set("angle", 0);
        player.set("lastShotPower", 0);
        player.set("lastShotAngle", 0);
    }
}

export function onGameStart(_action) {
    const gs = game();
    ensureState(gs);

    if (!Array.isArray(gs.state("balls")) || gs.state("balls").length === 0) {
        gs.state("balls", createInitialBalls());
    }
    if (typeof gs.state("shotSerial") !== "number") gs.state("shotSerial", 0);
    if (typeof gs.state("foul") !== "boolean") gs.state("foul", false);
    if (typeof gs.state("winnerId") !== "number") gs.state("winnerId", -1);
    if (typeof gs.state("shotInProgress") !== "boolean") gs.state("shotInProgress", false);
    if (!gs.state("lastShot") || typeof gs.state("lastShot") !== "object") gs.state("lastShot", {});
    if (typeof gs.state("cueBallInHand") !== "boolean") gs.state("cueBallInHand", false);
    if (!gs.state("cueBallPlacement") || typeof gs.state("cueBallPlacement") !== "object") gs.state("cueBallPlacement", {});

    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ensurePlayerFields(player);
        player.set("collectedBalls", []);
        player.set("group", null);
        player.set("power", 0);
        player.set("angle", 0);
        player.set("lastShotPower", 0);
        player.set("lastShotAngle", 0);
        player.setRank(2);
        player.setScore(0);
    }

    const starter = chooseStartingPlayer(gs);
    if (!starter) {
        return;
    }

    gs.setNextPlayer(starter.id);
    gs.setNextAction("shoot");
    gs.addEvent("newround", true);
    gs.setTimerSet(20000);
}

export function onJoin(action) {
    if (typeof action?.user?.id !== "number") return;

    const gs = game();
    ensureState(gs);

    const player = gs.player(action.user.id);
    if (!player) return;

    player.setRank(2);
    player.setScore(0);
    ensurePlayerFields(player);
    player.set("collectedBalls", []);
    player.set("group", null);
}

export function onSkip(_action) {
    const gs = game();
    const nextPlayerId = gs.nextPlayer;
    if (typeof nextPlayerId !== "number") {
        return;
    }
    playerLeave(nextPlayerId);
}

export function onLeave(action) {
    playerLeave(action?.user?.id);
}

function playerLeave(id) {
    if (typeof id !== "number") return;

    const gs = game();
    const leaver = gs.player(id);
    if (leaver) {
        leaver.setInGame(false);
    }

    const opponent = getOpponent(gs, id);
    if (opponent) {
        gs.state("winnerId", opponent.id);
        ACOSServer.gameover({ type: "forfeit", payload: opponent.id });
    }
}

export function onAim(action) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    const payload = action?.payload || {};
    const angle = payload?.angle;

    if (typeof playerId !== "number" || typeof angle !== "number" || !Number.isFinite(angle)) {
        return;
    }

    if (gs.nextPlayer !== playerId) {
        ACOSServer.ignore();
        return;
    }

    const player = gs.player(playerId);
    if (!player) return;

    ensurePlayerFields(player);
    player.set("angle", angle);
}

export function onShoot(action) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        return;
    }

    if (gs.nextPlayer !== playerId) {
        ACOSServer.ignore();
        return;
    }

    if (gs.state("cueBallInHand") === true) {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const angle = Number(payload?.angle);
    const power = clamp(Number(payload?.power), 0, BALL.maxPower);

    if (!Number.isFinite(angle) || !Number.isFinite(power) || power <= 0) {
        return;
    }

    const shooter = gs.player(playerId);
    if (!shooter) {
        return;
    }

    ensurePlayerFields(shooter);
    gs.state("shotInProgress", true);
    gs.state("cueBallInHand", false);
    gs.state("cueBallPlacement", {});

    const currentBalls = Array.isArray(gs.state("balls")) ? gs.state("balls") : createInitialBalls();
    const result = simulateShot(currentBalls, angle, power);
    applyShotResult(gs, playerId, angle, power, result);
}

// Backward compatibility with old action name.
export function onPick(action) {
    onShoot(action);
}

export function onCueMove(action) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        return;
    }

    if (gs.nextPlayer !== playerId || gs.state("cueBallInHand") !== true) {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const x = Number(payload?.x);
    const y = Number(payload?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    if (!isCueBallInsideTable(x, y)) {
        return;
    }

    setCueBallPosition(gs, x, y);
    gs.state("cueBallPlacement", {
        x,
        y,
        by: playerId,
        placed: false,
        updatedAt: Date.now(),
    });
}

export function onCuePlace(action) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        return;
    }

    if (gs.nextPlayer !== playerId || gs.state("cueBallInHand") !== true) {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const x = Number(payload?.x);
    const y = Number(payload?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    const balls = Array.isArray(gs.state("balls")) ? gs.state("balls") : createInitialBalls();
    if (!isValidCueBallPlacement(balls, x, y)) {
        return;
    }

    setCueBallPosition(gs, x, y);
    gs.state("cueBallInHand", false);
    gs.state("cueBallPlacement", {
        x,
        y,
        by: playerId,
        placed: true,
        updatedAt: Date.now(),
    });
}
