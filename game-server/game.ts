import { ACOSServer } from "@acosgames/framework";
import {
    BALL,
    CUE_BALL_POSITION,
    cloneBalls,
    createInitialBalls,
    decodeAngleFromUint,
    decodePowerFromUint,
    encodeAngleToUint,
    encodePowerToUint,
    isCueBallInsideTable,
    isValidCueBallPlacement,
    simulateShot,
} from "../shared/pool-physics";

function game() {
    return ACOSServer.game();
}


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


function ensurePlayerFields(player) {
    if (!player) return;
    if (!Array.isArray(player.get("collectedBalls"))) player.set("collectedBalls", []);
    if (typeof player.get("group") !== "string") player.set("group", null);
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
    if (typeof gs.state("cueBallInHand") !== "boolean") gs.state("cueBallInHand", false);
    if (!gs.state("cueBallPlacement") || typeof gs.state("cueBallPlacement") !== "object") gs.state("cueBallPlacement", {});
    if (typeof gs.state("cueAngle") !== "number") gs.state("cueAngle", 0);
    if (typeof gs.state("cuePower") !== "number") gs.state("cuePower", 0);
    if (typeof gs.state("shotBy") !== "number") gs.state("shotBy", 0);
    if (typeof gs.state("shotAngle") !== "number") gs.state("shotAngle", 0);
    if (typeof gs.state("shotPower") !== "number") gs.state("shotPower", 0);
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

function applyShotResult(gs, shooterId, angleUint, powerUint, result) {
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
        && result.pocketed.some((p) => (p.type === "solid" || p.type === "stripe") && p.type !== shooterGroupBeforeShot)
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

    gs.state("balls", result.balls);
    gs.state("shotResultBalls", cloneBalls(result.balls));
    gs.state("foul", foul);
    gs.state("winnerId", winnerId);
    gs.state("shotInProgress", false);
    gs.state("cueBallInHand", foul);
    gs.state("shotSerial", (state.shotSerial || 0) + 1);

    const ownPocketed = shooterGroup
        ? result.pocketed.some((p) => p.type === shooterGroup)
        : result.pocketed.some((p) => p.type === "solid" || p.type === "stripe");

    let nextPlayerId = shooter.id;
    if (foul || !ownPocketed) {
        nextPlayerId = opponent ? opponent.id : shooter.id;
    }

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
    gs.setNextAction("shoot");
    gs.setTimerSet(20000);
}

export function onNewGame(_action) {
    const gs = game();
    gs.state("balls", createInitialBalls());
    gs.state("shotResultBalls", []);
    gs.state("shotSerial", 0);
    gs.state("foul", false);
    gs.state("winnerId", -1);
    gs.state("shotInProgress", false);
    gs.state("cueBallInHand", false);
    gs.state("cueBallPlacement", {});
    gs.state("cueAngle", 0);
    gs.state("cuePower", 0);
    gs.state("shotBy", 0);
    gs.state("shotAngle", 0);
    gs.state("shotPower", 0);

    const players = getActivePlayers(gs);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ensurePlayerFields(player);
        player.set("collectedBalls", []);
        player.set("group", null);
    }
}

export function onGameStart(_action) {
    const gs = game();
    ensureState(gs);

    if (!Array.isArray(gs.state("balls")) || gs.state("balls").length === 0) {
        gs.state("balls", createInitialBalls());
    }
    if (!Array.isArray(gs.state("shotResultBalls"))) gs.state("shotResultBalls", []);
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
    const angleUintRaw = Number(payload?.angle);

    if (typeof playerId !== "number" || !Number.isFinite(angleUintRaw)) {
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
    gs.state("cueAngle", angleUint);
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

    if (gs.state("shotInProgress") === true) {
        ACOSServer.ignore();
        return;
    }

    if (gs.state("cueBallInHand") === true) {
        ACOSServer.ignore();
        return;
    }

    const cuePlacement = gs.state("cueBallPlacement");
    if (
        cuePlacement &&
        typeof cuePlacement === "object" &&
        cuePlacement.by === playerId &&
        cuePlacement.placed !== true
    ) {
        ACOSServer.ignore();
        return;
    }

    const payload = action?.payload || {};
    const angleUintRaw = Number(payload?.angle);
    const powerUintRaw = Number(payload?.power);
    if (!Number.isFinite(angleUintRaw) || !Number.isFinite(powerUintRaw)) {
        return;
    }

    const angleUint = encodeAngleToUint(decodeAngleFromUint(angleUintRaw));
    const powerUint = encodePowerToUint(decodePowerFromUint(powerUintRaw));
    const angle = decodeAngleFromUint(angleUint);
    const power = decodePowerFromUint(powerUint);
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
    const shotSerial = typeof gs.state("shotSerial") === "number" ? gs.state("shotSerial") : 0;
    const isBreakShot = shotSerial === 0;
    const result = isBreakShot
        ? simulateShot(currentBalls, angle, power)
        : simulateShot(currentBalls, angle, power, {
            maxSteps: 1800,
        });
    applyShotResult(gs, playerId, angleUint, powerUint, result);
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

    const balls = Array.isArray(gs.state("balls")) ? gs.state("balls") : createInitialBalls();
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
