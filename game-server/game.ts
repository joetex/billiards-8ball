import { ACOSServer } from "@acosgames/framework";
import {
    CUE_BALL_POSITION,
    cloneBalls,
    createInitialBalls,
    decodeAngleFromUint,
    decodePowerFromUint,
    encodeAngleToUint,
    encodePowerToUint,
    isValidCueBallPlacement,
} from "../game-client/pool/pool-physics";

function game() {
    return ACOSServer.game()!;
}

const PRIVATE_BALLS_KEY = "_balls";


function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function oppositeGroup(group: string | null): string | null {
    if (group === "solid") return "stripe";
    if (group === "stripe") return "solid";
    return null;
}

function randomInt(maxExclusive: number): number {
    const r = typeof ACOSServer.random === "function" ? ACOSServer.random() : Math.random();
    return Math.floor(r * maxExclusive);
}

function nextRackSeed(): number {
    const r = typeof ACOSServer.random === "function" ? ACOSServer.random() : Math.random();
    return Math.floor(r * 0x100000000) >>> 0;
}

function getOrCreateRackSeed(gs: any): number {
    const current = Number(gs.state("rackSeed"));
    if (Number.isInteger(current) && current >= 0) {
        return current >>> 0;
    }
    const seed = nextRackSeed();
    gs.state("rackSeed", seed);
    return seed;
}

function createRackBalls(gs: any) {
    return createInitialBalls(getOrCreateRackSeed(gs));
}

function getPrivateBalls(gs: any) {
    const existing = gs.state(PRIVATE_BALLS_KEY);
    if (Array.isArray(existing) && existing.length > 0) {
        return cloneBalls(existing);
    }
    const created = createRackBalls(gs);
    gs.state(PRIVATE_BALLS_KEY, cloneBalls(created));
    return created;
}

function setPrivateBalls(gs: any, balls: any[]) {
    gs.state(PRIVATE_BALLS_KEY, cloneBalls(balls));
}


function ensurePlayerFields(player: any) {
    if (!player) return;
    if (!Array.isArray(player.get("collectedBalls"))) player.set("collectedBalls", []);
    if (typeof player.get("group") !== "string") player.set("group", null);
}

function ensureState(gs: any) {
    const state = gs.state();
    if (!state || typeof state !== "object") {
        setPrivateBalls(gs, createRackBalls(gs));
    }

    if (!Array.isArray(gs.state(PRIVATE_BALLS_KEY))) {
        setPrivateBalls(gs, createRackBalls(gs));
    }

    getOrCreateRackSeed(gs);

    if (typeof gs.state("shotSerial") !== "number") gs.state("shotSerial", 0);
    if (typeof gs.state("foul") !== "boolean") gs.state("foul", false);
    if (typeof gs.state("winnerId") !== "number") gs.state("winnerId", -1);
    if (typeof gs.state("shotInProgress") !== "boolean") gs.state("shotInProgress", false);
    if (typeof gs.state("cueBallInHand") !== "boolean") gs.state("cueBallInHand", false);
    if (!gs.state("cueBallPlacement") || typeof gs.state("cueBallPlacement") !== "object") gs.state("cueBallPlacement", {});
    if (typeof gs.state("cueAngle") !== "number") gs.state("cueAngle", 0);
    if (typeof gs.state("cuePower") !== "number") gs.state("cuePower", 0);
    if (typeof gs.state("shotBy") !== "number") gs.state("shotBy", 0);
    if (typeof gs.state("shotAngle") !== "number") gs.state("shotAngle", 0);
    if (typeof gs.state("shotPower") !== "number") gs.state("shotPower", 0);
    if (typeof gs.state("shotResultsPending") !== "boolean") gs.state("shotResultsPending", false);
    // if (!gs.state("shotResults") || typeof gs.state("shotResults") !== "object") gs.state("shotResults", {});
    if (typeof gs.state("shotResultsSerial") !== "number") gs.state("shotResultsSerial", -1);
}

function getActivePlayers(gs: any) {
    const all = gs.players();
    return all;
    // return all.filter((p) => p && p.inGame !== false);
}

function getOpponent(gs: any, shooterId: number) {
    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        if (players[i].id !== shooterId) return players[i];
    }
    return null;
}


function setCueBallPosition(gs: any, x: number, y: number) {
    const balls = getPrivateBalls(gs);
    const cueBall = balls.find((b) => b.type === "cue");
    if (!cueBall) {
        return;
    }

    cueBall.visible = true;
    cueBall.x = x;
    cueBall.y = y;
    setPrivateBalls(gs, balls);
}

function toStateBall(b: any) {
    return { number: b.number, type: b.type, x: b.x, y: b.y, visible: b.visible !== false };
}


function assignGroupsIfNeeded(gs: any, shooter: any, opponent: any, pocketed: any[]) {
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

function pushCollectedBall(player: any, ballNumber: number) {
    const existing = Array.isArray(player.get("collectedBalls")) ? player.get("collectedBalls") : [];
    if (existing.includes(ballNumber)) {
        return;
    }
    player.set("collectedBalls", [...existing, ballNumber]);
}

function updateCollected(gs: any, shooter: any, opponent: any, pocketed: any[]) {
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

function chooseStartingPlayer(gs: any) {
    const players = getActivePlayers(gs);
    if (players.length === 0) return null;
    return players[randomInt(players.length)] || null;
}

function applyShotResult(gs: any, shooterId: number, angleUint: number, powerUint: number, result: any) {
    const state = gs.state();
    const shooter = gs.player(shooterId);
    const opponent = getOpponent(gs, shooterId);

    if (!shooter) {
        return;
    }

    ensurePlayerFields(shooter);
    if (opponent) ensurePlayerFields(opponent);

    const isBreakShot = (state.shotSerial || 0) === 0;
    const shooterGroupBeforeShot = shooter.get("group");

    assignGroupsIfNeeded(gs, shooter, opponent, result.pocketed);
    updateCollected(gs, shooter, opponent, result.pocketed);

    const shooterGroup = shooter.get("group");
    const shooterCollectedCount = Array.isArray(shooter.get("collectedBalls")) ? shooter.get("collectedBalls").length : 0;

    // Simplified 8-ball rules:
    // - Break: cue ball must not be pocketed and at least 2 object balls must hit a cushion.
    // - After groups are assigned, pocketing opponent-group balls is a foul.
    // - Scratch is always a foul.
    const breakFoul = isBreakShot && (!result.cuePocketed && result.objectBallRailHits < 2);
    const wrongGroupPocketed = !!(
        (shooterGroupBeforeShot === "solid" || shooterGroupBeforeShot === "stripe")
        && result.pocketed.some((p: any) => (p.type === "solid" || p.type === "stripe") && p.type !== shooterGroupBeforeShot)
    );
    const foul = result.cuePocketed || breakFoul || wrongGroupPocketed;

    let winnerId = -1;
    if (result.eightPocketed) {
        if (!foul && shooterGroup && shooterCollectedCount >= 7) {
            winnerId = shooter.id;
        } else if (opponent) {
            winnerId = opponent.id;
        }
    }

    gs.state("cueAngle", angleUint);
    gs.state("cuePower", powerUint);
    gs.state("shotBy", shooter.id);
    gs.state("shotAngle", angleUint);
    gs.state("shotPower", powerUint);

    setPrivateBalls(gs, result.balls);
    gs.state("foul", foul);
    gs.state("winnerId", winnerId);
    gs.state("shotInProgress", false);
    gs.state("cueBallInHand", foul);
    gs.state("shotSerial", (state.shotSerial || 0) + 1);

    const ownPocketed = shooterGroup
        ? result.pocketed.some((p: any) => p.type === shooterGroup)
        : result.pocketed.some((p: any) => p.type === "solid" || p.type === "stripe");

    let nextPlayerId = shooter.id;
    if (foul || !ownPocketed) {
        nextPlayerId = opponent ? opponent.id : shooter.id;
    }

    if (foul) {
        const balls = getPrivateBalls(gs);
        const cueBall = balls.find((b: any) => b.type === "cue");
        if (cueBall) {
            cueBall.visible = true;
            cueBall.x = CUE_BALL_POSITION.x;
            cueBall.y = CUE_BALL_POSITION.y;
            cueBall.vx = 0;
            cueBall.vy = 0;
            setPrivateBalls(gs, balls);
            gs.state("cueBallPlacement", {
                x: cueBall.x,
                y: cueBall.y,
                by: nextPlayerId,
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

    gs.setNextPlayer(nextPlayerId);
    gs.setNextAction(foul ? "cue-move" : "shoot");
    gs.setTimerSet(20000);

    if (foul) {
        gs.addEvent("foul");
    }
}

export function onNewGame(_action: any) {
    const gs = game();
    gs.state("rackSeed", nextRackSeed());
    setPrivateBalls(gs, createRackBalls(gs));
    // gs.state("shotSerial", 0);
    // gs.state("foul", false);
    gs.state("winnerId", -1);
    // gs.state("shotInProgress", false);
    gs.state("cueBallInHand", false);
    gs.state("cueBallPlacement", {});
    gs.state("cueAngle", 0);
    gs.state("cuePower", 0);
    gs.state("shotBy", 0);
    // gs.state("shotAngle", 0);
    // gs.state("shotPower", 0);
    // gs.state("shotResultsPending", false);
    // gs.state("shotResults", {});
    // gs.state("shotResultsSerial", -1);

    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ensurePlayerFields(player);
        player.set("collectedBalls", []);
        player.set("group", null);
    }
}

export function onGameStart(_action: any) {
    const gs = game();
    ensureState(gs);
    // if (typeof gs.state("shotSerial") !== "number") gs.state("shotSerial", 0);
    // if (typeof gs.state("foul") !== "boolean") gs.state("foul", false);
    if (typeof gs.state("winnerId") !== "number") gs.state("winnerId", -1);
    // if (typeof gs.state("shotInProgress") !== "boolean") gs.state("shotInProgress", false);
    if (typeof gs.state("cueBallInHand") !== "boolean") gs.state("cueBallInHand", false);
    if (!gs.state("cueBallPlacement") || typeof gs.state("cueBallPlacement") !== "object") gs.state("cueBallPlacement", {});
    if (typeof gs.state("cueAngle") !== "number") gs.state("cueAngle", 0);
    if (typeof gs.state("cuePower") !== "number") gs.state("cuePower", 0);
    if (typeof gs.state("shotBy") !== "number") gs.state("shotBy", 0);
    // if (typeof gs.state("shotAngle") !== "number") gs.state("shotAngle", 0);
    // if (typeof gs.state("shotPower") !== "number") gs.state("shotPower", 0);

    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ensurePlayerFields(player);
        player.set("collectedBalls", []);
        player.set("group", null);
        player.setRank(2);
        player.setScore(0);
    }

    const starter = chooseStartingPlayer(gs);
    if (!starter) {
        return;
    }

    gs.setNextPlayer(starter.id);
    gs.state("cueBallInHand", true); // Break shot: first action is cue-move, ball is in hand
    gs.setNextAction("cue-move");
    gs.addEvent("newround", true);
    gs.setTimerSet(20000);
}

export function onJoin(action: any) {
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

export function onSkip(_action: any) {
    const gs = game();

    // If waiting for client shot results, the 30-second timer expired — cancel the game.
    if (gs.state("shotResultsPending") === true) {
        gs.state("shotResultsPending", false);
        gs.state("_shotResults", {});
        gs.state("shotInProgress", false);
        gs.addEvent("shot-mismatch");
        ACOSServer.gameover({ type: "timeout", payload: -1 });
        return;
    }

    const nextPlayerId = gs.nextPlayer;
    if (typeof nextPlayerId !== "number") {
        return;
    }
    playerLeave(nextPlayerId);
}

function normalizePocketedNumbers(values: any): number[] {
    if (!Array.isArray(values)) return [];
    const unique = new Set<number>();
    for (let i = 0; i < values.length; i++) {
        const n = Number(values[i]);
        if (!Number.isInteger(n) || n < 0 || n > 15) continue;
        unique.add(n);
    }
    return [...unique].sort((a, b) => a - b);
}

function comparePocketedNumbers(a: number[], b: number[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function buildShotResultFromClientHashPayload(beforeShotBalls: any[], payload: any) {
    const pocketedNumbers = normalizePocketedNumbers(payload?.pocketedNumbers);
    const pocketedSet = new Set<number>(pocketedNumbers);

    const nextBalls = cloneBalls(beforeShotBalls);
    const pocketed: any[] = [];

    for (let i = 0; i < nextBalls.length; i++) {
        const ball = nextBalls[i];
        if (!ball) continue;

        if (pocketedSet.has(ball.number)) {
            ball.visible = false;
            ball.vx = 0;
            ball.vy = 0;
            pocketed.push({ number: ball.number, type: ball.type });
        }
    }

    const cuePocketed = payload?.cuePocketed === true || pocketedSet.has(0);
    const eightPocketed = payload?.eightPocketed === true || pocketedSet.has(8);

    if (cuePocketed) {
        const cueBall = nextBalls.find((b) => b.type === "cue");
        if (cueBall) {
            cueBall.visible = true;
            cueBall.x = CUE_BALL_POSITION.x;
            cueBall.y = CUE_BALL_POSITION.y;
            cueBall.vx = 0;
            cueBall.vy = 0;
        }
    }

    return {
        balls: nextBalls,
        pocketed,
        cuePocketed,
        eightPocketed,
        railHit: payload?.railHit === true,
        objectBallRailHits: typeof payload?.objectBallRailHits === "number" ? payload.objectBallRailHits : 0,
        firstHitType: payload?.firstHitType ?? null,
        firstHitNumber: typeof payload?.firstHitNumber === "number" ? payload.firstHitNumber : null,
    };
}

export function onShotResult(action: any) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        ACOSServer.ignore();
        return;
    }

    // Only accept while waiting for shot results.
    if (gs.state("shotResultsPending") !== true) {
        // ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const resultSerial = payload?.shotSerial;
    const expectedSerial = gs.state("shotResultsSerial");
    if (typeof resultSerial !== "number" || resultSerial !== expectedSerial) {
        // ACOSServer.ignore();
        return;
    }

    const hash64 = typeof payload?.hash64 === "string" ? payload.hash64 : "";
    if (!hash64) {
        return;
    }
    const pocketedNumbers = normalizePocketedNumbers(payload?.pocketedNumbers);

    // Store result for this player (ignore duplicates).
    const shotResults = gs.state("_shotResults") ?? {};
    if (shotResults[playerId]) {
        // ACOSServer.ignore();
        return;
    }

    shotResults[playerId] = {
        hash64,
        pocketedNumbers,
        firstHitType: payload.firstHitType ?? null,
        firstHitNumber: payload.firstHitNumber ?? null,
        cuePocketed: payload.cuePocketed === true || pocketedNumbers.includes(0),
        eightPocketed: payload.eightPocketed === true || pocketedNumbers.includes(8),
        railHit: payload.railHit === true,
        objectBallRailHits: typeof payload.objectBallRailHits === "number" ? payload.objectBallRailHits : 0,
    };
    gs.state("_shotResults", shotResults);

    const activePlayers = getActivePlayers(gs);
    const expectedCount = Math.max(1, activePlayers.length);
    const receivedCount = Object.keys(shotResults).length;

    if (receivedCount < expectedCount) {
        // Still waiting for more results.
        return;
    }

    // All results received — compare compact simulation signatures.
    const resultValues: any[] = Object.values(shotResults);
    const firstResult = resultValues[0];
    let match = true;

    for (let i = 1; i < resultValues.length; i++) {
        if (firstResult.hash64 !== resultValues[i].hash64) {
            match = false;
            break;
        }
        if (!comparePocketedNumbers(firstResult.pocketedNumbers, resultValues[i].pocketedNumbers)) {
            match = false;
            break;
        }
    }

    gs.state("shotResultsPending", false);
    gs.state("_shotResults", {});

    if (!match) {
        console.log("NOTE: Shot result mismatch between clients — possible cheating or desync. Ending game.");
        gs.state("shotInProgress", false);
        gs.addEvent("shot-mismatch");
        ACOSServer.gameover({ type: "mismatch", payload: -1 });
        return;
    }

    // Results match — apply game rules and advance the turn.
    const shooterId = gs.state("shotBy");
    const angleUint = gs.state("shotAngle");
    const powerUint = gs.state("shotPower");
    const ballsBeforeShot = getPrivateBalls(gs);
    const compactResult = buildShotResultFromClientHashPayload(ballsBeforeShot, firstResult);
    applyShotResult(gs, shooterId, angleUint, powerUint, compactResult);
}

export function onLeave(action: any) {
    playerLeave(action?.user?.id);
}

function playerLeave(id: number) {
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

export function onAim(action: any) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    const payload = action?.payload || {};
    const angleUintRaw = Number(payload?.angle);
    const powerUintRaw = Number(payload?.power);

    if (typeof playerId !== "number" || !Number.isFinite(angleUintRaw) || !Number.isFinite(powerUintRaw)) {
        return;
    }

    if (gs.nextPlayer !== playerId) {
        ACOSServer.ignore();
        return;
    }

    if (gs.state("shotInProgress") === true || gs.state("cueBallInHand") === true) {
        ACOSServer.ignore();
        return;
    }

    const angleUint = encodeAngleToUint(decodeAngleFromUint(angleUintRaw));
    const powerUint = encodePowerToUint(decodePowerFromUint(powerUintRaw));
    gs.state("cueAngle", angleUint);
    gs.state("cuePower", powerUint);
    gs?.addEvent("aim");
}

export function onShoot(action: any) {
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

    // if (gs.state("shotInProgress") === true) {
    //     ACOSServer.ignore();
    //     return;
    // }

    // if (gs.state("cueBallInHand") === true) {
    //     ACOSServer.ignore();
    //     return;
    // }

    // const cuePlacement = gs.state("cueBallPlacement");
    // if (
    //     cuePlacement &&
    //     typeof cuePlacement === "object" &&
    //     cuePlacement.by === playerId &&
    //     cuePlacement.placed !== true
    // ) {
    //     ACOSServer.ignore();
    //     return;
    // }

    const payload = action?.payload || {};
    const angleUintRaw = Number(payload?.angle);
    const powerUintRaw = Number(payload?.power);
    if (!Number.isFinite(angleUintRaw) || !Number.isFinite(powerUintRaw)) {
        return;
    }

    const angleUint = encodeAngleToUint(decodeAngleFromUint(angleUintRaw));
    const powerUint = encodePowerToUint(decodePowerFromUint(powerUintRaw));
    const power = decodePowerFromUint(powerUint);
    if (!Number.isFinite(power) || power <= 0) {
        return;
    }

    const shooter = gs.player(playerId);
    if (!shooter) {
        return;
    }

    ensurePlayerFields(shooter);

    // Record the shot parameters in state so clients can read them from the shoot event.
    gs.state("cueAngle", angleUint);
    gs.state("cuePower", powerUint);
    gs.state("shotBy", shooter.id);
    gs.state("shotAngle", angleUint);
    gs.state("shotPower", powerUint);

    // Broadcast shoot event — all clients will simulate locally and report back.
    gs.state("shotResultsPending", true);
    gs.state("shotResultsSerial", gs.state("shotSerial") ?? 0);
    // gs.state("_shotResults", 0);
    gs.addEvent("shoot");
    gs?.setNextAction("shoot-result");
    gs?.setNextPlayer(-2);
    gs.setTimerSet(30000);
}


// Backward compatibility with old action name.
export function onPick(action: any) {
    onShoot(action);
}

export function onCueMove(action: any) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        return;
    }

    if (gs.nextPlayer !== playerId || gs.state("cueBallInHand") !== true || gs.nextAction !== "cue-move") {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const rawX = Number(payload?.x);
    const y = Number(payload?.y);
    if (!Number.isFinite(rawX) || !Number.isFinite(y)) {
        return;
    }
    // During the break shot (first shot of the rack), X is locked to the break line
    const isBreakShot = (gs.state("shotSerial") ?? 0) === 0;
    const x = isBreakShot ? CUE_BALL_POSITION.x : rawX;

    const balls = getPrivateBalls(gs);
    if (!isValidCueBallPlacement(balls, x, y)) {
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
    gs?.addEvent("cue-move", { x, y, by: playerId });
}

export function onCuePlace(action: any) {
    const gs = game();
    ensureState(gs);

    const playerId = action?.user?.id;
    if (typeof playerId !== "number") {
        return;
    }

    if (gs.nextPlayer !== playerId || gs.state("cueBallInHand") !== true || gs.nextAction !== "cue-move") {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const rawX = Number(payload?.x);
    const y = Number(payload?.y);
    if (!Number.isFinite(rawX) || !Number.isFinite(y)) {
        return;
    }
    // During the break shot (first shot of the rack), X is locked to the break line
    const isBreakShot = (gs.state("shotSerial") ?? 0) === 0;
    const x = isBreakShot ? CUE_BALL_POSITION.x : rawX;

    const balls = getPrivateBalls(gs);
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

    gs?.addEvent("cue-place", { x, y, by: playerId });
    // (c) After placement, opponent (now nextPlayer) takes their shot
    gs.setNextAction("shoot");
    gs.setTimerSet(20000);
}
