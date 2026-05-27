import { IInputConfig, IBallConfig, ITableConfig, IVector2, IPhysicsConfig, IAssetsConfig, ILabelsConfig, IMatchScoreConfig, IAIConfig } from './../game.config.type';
import { AI } from './../ai/ai-trainer';
import { mapRange } from '../common/helper';
import { Referee } from './referee';
import { Player } from './player';
import { Stick } from './stick';
import { Color } from '../common/color';
import { Vector2 } from '../geom/vector2';
import { GameConfig } from '../game.config';
import { Assets } from '../assets';
import { Canvas2D } from '../canvas';
import { Ball } from './ball';
import { Mouse } from '../input/mouse';
import { State } from './state';
import { ACOSClient, gs } from '@acosgames/framework';
import { 
    applyShotImpulse,
    createInitialBalls, 
    decodeAngleFromUint, 
    decodePowerFromUint, 
    encodeAngleToUint, 
    encodePowerToUint, 
    createLiveSimulation, 
    getCushionLineDefinitions, 
    stepLiveSimulation, 
    lerp,
    type LiveSimulation
} from '../pool-physics';
import { castCueBallGuide, findFirstWallHitForBall } from '../pool-physics';
import { Quaternion } from 'three';

const ball1TextureUrl = 'assets/balls/ball.pool1.webp';
const ball2TextureUrl = 'assets/balls/ball.pool2.webp';
const ball3TextureUrl = 'assets/balls/ball.pool3.webp';
const ball4TextureUrl = 'assets/balls/ball.pool4.webp';
const ball5TextureUrl = 'assets/balls/ball.pool5.webp';
const ball6TextureUrl = 'assets/balls/ball.pool6.webp';
const ball7TextureUrl = 'assets/balls/ball.pool7.webp';
const ball8TextureUrl = 'assets/balls/ball.pool8.webp';
const ball9TextureUrl = 'assets/balls/ball.pool9.webp';
const ball10TextureUrl = 'assets/balls/ball.pool10.webp';
const ball11TextureUrl = 'assets/balls/ball.pool11.webp';
const ball12TextureUrl = 'assets/balls/ball.pool12.webp';
const ball13TextureUrl = 'assets/balls/ball.pool13.webp';
const ball14TextureUrl = 'assets/balls/ball.pool14.webp';
const ball15TextureUrl = 'assets/balls/ball.pool15.webp';
const cueBallTextureUrl = 'assets/balls/ball.cue.webp';

const textureByBallNumber: Record<number, string> = {
    0: cueBallTextureUrl,
    1: ball1TextureUrl,
    2: ball2TextureUrl,
    3: ball3TextureUrl,
    4: ball4TextureUrl,
    5: ball5TextureUrl,
    6: ball6TextureUrl,
    7: ball7TextureUrl,
    8: ball8TextureUrl,
    9: ball9TextureUrl,
    10: ball10TextureUrl,
    11: ball11TextureUrl,
    12: ball12TextureUrl,
    13: ball13TextureUrl,
    14: ball14TextureUrl,
    15: ball15TextureUrl,
};

export const BALL_TEXTURE_PATHS: string[] = [
    ball1TextureUrl, ball2TextureUrl, ball3TextureUrl, ball4TextureUrl,
    ball5TextureUrl, ball6TextureUrl, ball7TextureUrl, ball8TextureUrl,
    ball9TextureUrl, ball10TextureUrl, ball11TextureUrl, ball12TextureUrl,
    ball13TextureUrl, ball14TextureUrl, ball15TextureUrl, cueBallTextureUrl,
    'assets/balls/effect.shadow.webp',
    'assets/balls/effect.light.webp',
];



const physicsConfig: IPhysicsConfig = GameConfig.physics;
const inputConfig: IInputConfig = GameConfig.input;
const ballConfig: IBallConfig = GameConfig.ball;
const tableConfig: ITableConfig = GameConfig.table;
const labelsConfig: ILabelsConfig = GameConfig.labels;
const matchScoreConfig: IMatchScoreConfig = GameConfig.matchScore;
const aiConfig: IAIConfig = GameConfig.ai;
const gameSize: IVector2 = GameConfig.gameSize;
const sprites: IAssetsConfig = GameConfig.sprites;
const sounds: IAssetsConfig = GameConfig.sounds;
const hudBarHeight = 56;  // Visual height of HUD bar at top of screen
const showWallDebugOverlay = true;

function toHashCoord(value: number): string {
    return Number.isFinite(value) ? (Math.round(value * 100) / 100).toFixed(2) : "0.00";
}

function fnv1a64Hex(input: string): string {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    const mask = 0xffffffffffffffffn;
    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash = (hash * prime) & mask;
    }
    return hash.toString(16).padStart(16, "0");
}

function hashBallSnapshot(balls: Array<{ number: number; x: number; y: number; visible: boolean }>): string {
    const normalized = balls
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((b) => `${b.number}:${b.visible ? 1 : 0}:${toHashCoord(b.x)}:${toHashCoord(b.y)}`)
        .join("|");
    return fnv1a64Hex(normalized);
}

export class GameWorld {

    //------Members------//

    private _stick!: Stick;
    private _cueBall!: Ball;
    private _8Ball!: Ball;
    private _balls!: Ball[];
    private _players: Player[] = [new Player(), new Player()];
    private _currentPlayerIndex = 0;
    private _turnState!: State;
    private _referee!: Referee;
    private _serverGameState: any = null;
    private _localPlayerId: number | null = null;
    private _lastAimSentAtMs: number = 0;
    private _lastCueMoveSentAtMs: number = 0;
    private _lastSentAngle: number | null = null;
    private _lastSentCueX: number | null = null;
    private _lastSentCueY: number | null = null;
    private _localCuePlacePending: boolean = false;
    private _remoteStickTargetAngle: number = 0;
    private _cueBallInterpFrom: Vector2 | null = null;
    private _cueBallInterpTo: Vector2 | null = null;
    private _cueBallInterpStartMs: number = 0;
    private _cueBallInterpDurationMs: number = 1000;
    private _stickFollowsCueBall: boolean = true;
    private _cueBallPlacementDragging: boolean = false;
    private _shotSimulationInProgress: boolean = false;
    private _liveSimulation: LiveSimulation | null = null;
    private _bodyIdToBall: Map<number, Ball> = new Map();
    private _waitingForShotResult: boolean = false;
    private _cuePlacementIsValid: boolean = false;
    private _ballInHandResetApplied: boolean = false;
    private _playbackCollidedPairs: Set<string> = new Set(); // Track which ball pairs have collided during playback
    private _pocketedBallsThisTurn: Set<number> = new Set(); // Track which balls have been pocketed this turn (across playback and live physics)
    private _lastCuePlaceConfirmedAt: number = 0; // Timestamp when cue-place was confirmed by server
    private _isFirstMessage: boolean = true; // Track if this is the first state message received (for iframe reload handling)
    private _lastStateUpdateMousePos: Vector2 | null = null; // Track mouse position at last state update to prevent aim on replay navigation
    private _mouseHasMovedSinceStateUpdate: boolean = false; // Track if mouse has moved since last state update

    // Break-placement state (first shot of each rack: cue ball can only move along Y axis)
    private _isBreakMode: boolean = false;
    private _cueMoveMouseDownSeen: boolean = false; // Guard: require at least one isDown before accepting isReleased as placement
    private _rippleEffects: Array<{ ballNumber: number; startMs: number; durationMs: number }> = [];
    private _lastRippleShootSerial: number = -1;

    private isNextPlayer: boolean = false; // Track if the next player has been switched (to prevent multiple switches on replay navigation)

    private _linkBallsToLiveSimulationBodies(): void {
        this._bodyIdToBall.clear();
        if (!this._liveSimulation) {
            return;
        }

        for (let i = 0; i < this._balls.length; i++) {
            const body = this._liveSimulation.bodyMap[i] ?? null;
            this._balls[i].linkBody(body);
            if (body) {
                this._bodyIdToBall.set(body.id, this._balls[i]);
            }
        }
    }

    //------Properties------//

    public get currentPlayer(): Player {
        return this._players[this._currentPlayerIndex];
    }

    public get nextPlayer(): Player {
        return this._players[(this._currentPlayerIndex + 1) % this._players.length];
    }

    public get balls(): Ball[] {
        return this._balls
    }

    public getBallByBodyId(bodyId: number): Ball | null {
        return this._bodyIdToBall.get(bodyId) ?? null;
    }

    public get isBallInHand(): boolean {
        if (this._serverGameState !== null) {
            if (this._shotSimulationInProgress || this._waitingForShotResult) {
                return false;
            }
            return this._serverGameState?.state?.cueBallInHand === true && !this._localCuePlacePending;
        }
        return this._turnState.ballInHand;
    }

    public get isTurnValid(): boolean {
        return this._turnState.isValid;
    }

    public get isGameOver(): boolean {
        return this._referee.isGameOver(this.currentPlayer, this._cueBall, this._8Ball);
    }

    public get isBallsMoving(): boolean {
        return this._balls.some(ball => ball.moving);
    }

    public get numOfPocketedBallsOnTurn(): number {
        return this._turnState.pocketedBalls.length;
    }

    //------Constructor------//

    constructor() {
        window.addEventListener('acos-message', this.onAcosMessage as EventListener);
        window.addEventListener('acos-volumechange', this.onVolumeChange as EventListener);
        // this.initMatch();
    }

    private onVolumeChange = (event: CustomEvent) => {
        const volume = event?.detail ?? 1;
        Assets.setMasterVolume(volume);
    };


    private onAcosMessage = (event: Event): void => {
        const msg = (event as CustomEvent<any>).detail;
        if (!msg || typeof msg !== 'object') {
            return;
        }

        this._lastStateUpdateMousePos = Mouse.position;
        this._mouseHasMovedSinceStateUpdate = false;

        this._serverGameState = msg;

        const game = gs(msg);
        const roomEvents = game.eventsMap();

        this._serverGameState = msg;
        const localId = msg?.local?.id;
        if (typeof localId === 'number') {
            this._localPlayerId = localId;
        }

        this.isNextPlayer = game.nextPlayer == localId;

        const events = game.events();
        const firstEvent = events.length > 0 ? events[0] : { type: 'none' };
        const eventPayload = (firstEvent as any)?.payload ?? (firstEvent as any)?.data ?? null;

        switch (firstEvent.type) {
            case 'gamestart':
                this._isBreakMode = true;
                this._cueMoveMouseDownSeen = false;
                this.initMatch();
                break;
            case 'newgame':
                this._isBreakMode = true;
                this._cueMoveMouseDownSeen = false;
                this.initMatch();
                break;
            case 'shoot': {
                if (!this._stick.visible) {
                    this._stick.show(this._cueBall.position);
                }

                const shootAngleUint = game.state("cueAngle") ?? 0;
                const shootPowerUint = game.state("cuePower") ?? 0;
                const shootAngle = decodeAngleFromUint(shootAngleUint);
                const shootPower = decodePowerFromUint(shootPowerUint);
                this._stick.serverUpdate(shootAngle, shootPower);

                // Non-next player starts simulation from server-confirmed angle/power
                // Guard: only start if simulation is not already running/settled
                if (!this.isNextPlayer && !this._shotSimulationInProgress && !this._waitingForShotResult) {
                    this._startSimulationWithShot(shootAngleUint, shootPowerUint);
                }
                break;
            }
            case 'aim':
                break;
            case 'cue-move': {
                // Remote player is moving the cue ball — sync for observer via lerp
                if (!this.isNextPlayer) {
                    const placement = eventPayload && typeof eventPayload === 'object'
                        ? eventPayload
                        : game.state('cueBallPlacement');
                    if (placement && typeof placement.x === 'number' && typeof placement.y === 'number') {
                        this._cueBallInterpFrom = this._cueBall.position;
                        this._cueBallInterpTo = new Vector2(placement.x, placement.y);
                        this._cueBallInterpStartMs = performance.now();
                        this._cueBallInterpDurationMs = 2000;
                    }
                }
                break;
            }
            case 'cue-place': {
                // Placement confirmed — sync cue ball position and prepare next shot
                const placement = eventPayload && typeof eventPayload === 'object'
                    ? eventPayload
                    : game.state('cueBallPlacement');
                if (placement && typeof placement.x === 'number' && typeof placement.y === 'number') {
                    this._cueBall.show(new Vector2(placement.x, placement.y));
                }
                this._waitingForShotResult = false;
                this._shotSimulationInProgress = false;
                this._localCuePlacePending = false;
                this._stick.show(this._cueBall.position);
                break;
            }
            case 'foul': {
                // Shot processed, foul — reset simulation and wait for cue placement
                this._waitingForShotResult = false;
                this._shotSimulationInProgress = false;
                // Hide stick while the next player places the cue ball
                this._stick.hide();
                break;
            }
            case 'shot-mismatch':
                break;
            default:
                break;
        }

        // Detect normal turn transition (server advances to shoot without a dedicated shot-result event)
        if (this._waitingForShotResult && game.nextAction === 'shoot') {
            this._waitingForShotResult = false;
            this._shotSimulationInProgress = false;
            this._stick.show(this._cueBall.position);
            const nextAngle = decodeAngleFromUint(game.state('cueAngle') ?? 0);
            const nextPower = decodePowerFromUint(game.state('cuePower') ?? 0);
            this._stick.serverUpdate(nextAngle, nextPower);
        }

        if (this._waitingForShotResult && game.nextAction === 'cue-move') {
            this._waitingForShotResult = false;
            this._shotSimulationInProgress = false;
            this._localCuePlacePending = false;
            this._cueMoveMouseDownSeen = false;
            const placement = game.state('cueBallPlacement');
            if (placement && typeof placement.x === 'number' && typeof placement.y === 'number') {
                this._cueBall.show(new Vector2(placement.x, placement.y));
            }
            this._stick.hide();
        }

    }


    public initMatch(): void {
        const rackSeedRaw = this._serverGameState?.state?.rackSeed;
        const rackSeed = Number.isFinite(Number(rackSeedRaw)) ? Number(rackSeedRaw) : 0;
        const serverBalls = this._serverGameState?.state?.balls;
        const templateBalls = createInitialBalls(rackSeed);
        const initialBalls = templateBalls.map((template) => ({ ...template }));

        if (Array.isArray(serverBalls)) {
            for (let i = 0; i < serverBalls.length; i++) {
                const sb = serverBalls[i];
                const number = Number(sb?.number);
                if (!Number.isInteger(number) || number < 0 || number >= initialBalls.length) continue;

                const base = initialBalls[number];
                const nextType = sb?.type === "cue" || sb?.type === "eight" || sb?.type === "solid" || sb?.type === "stripe"
                    ? sb.type
                    : base.type;

                initialBalls[number] = {
                    ...base,
                    id: typeof sb?.id === "number" ? sb.id : number,
                    number,
                    type: nextType,
                    x: typeof sb?.x === "number" ? sb.x : base.x,
                    y: typeof sb?.y === "number" ? sb.y : base.y,
                    vx: typeof sb?.vx === "number" ? sb.vx : 0,
                    vy: typeof sb?.vy === "number" ? sb.vy : 0,
                    visible: sb?.visible !== false,
                };
            }
        }

        this._balls = initialBalls.map((ball) => {
            let color: Color;
            if (ball.type === 'cue') {
                color = Color.white;
            } else if (ball.type === 'eight') {
                color = Color.black;
            } else if (ball.type === 'solid') {
                color = Color.yellow;
            } else {
                color = Color.red;
            }

            return new Ball(new Vector2(ball.x, ball.y), color, textureByBallNumber[ball.number], ball.number);
        });

        this._cueBall = this._balls[0]; // cue ball is always at index 0
        this._8Ball = this._balls[8];   // 8-ball is always at index 8;

        this._stick = new Stick(Vector2.copy(GameConfig.cueBallPosition));

        this._players.forEach((player: Player) => {
            player.matchScore = 0;
            player.color = null;
        });
        this._turnState = new State();
        this._referee = new Referee();

        if (!this._stick.visible) {
            this._stick.show(this._cueBall.position);
        }

        this._liveSimulation = createLiveSimulation(initialBalls);
        this._linkBallsToLiveSimulationBodies();

    }

    private _startSimulationWithShot(angleUint: number, powerUint: number): void {
        this._isBreakMode = false; // first shot clears break-placement mode
        this._rippleEffects = []; // clear any pending ripples when shot begins
        const initialBalls = this._balls.map((ball, i) => {
            const number = ball.ballNumber;
            const simBall = this._liveSimulation?.balls?.[i];
            const type = simBall?.type
                ?? (number === 0 ? 'cue' : (number === 8 ? 'eight' : (number < 8 ? 'solid' : 'stripe')));
            return {
                id: i,
                number,
                type,
                x: ball.position.x,
                y: ball.position.y,
                vx: 0,
                vy: 0,
                visible: ball.visible,
                dynBody: null,
            };
        });

        this._liveSimulation = createLiveSimulation(initialBalls);
        this._linkBallsToLiveSimulationBodies();

        // Cue ball is always at index 0 with the standardised ordering
        const cueBallBody = this._liveSimulation?.bodyMap[0];
        if (cueBallBody) {
            const angle = decodeAngleFromUint(angleUint);
            const power = decodePowerFromUint(powerUint);
            applyShotImpulse(cueBallBody, angle, power);
        }
        this._shotSimulationInProgress = true;
        this._waitingForShotResult = false;
    }

    private _syncBallsFromServerState(stateBalls: any[]): void {
        this._bodyIdToBall.clear();
        for (const renderBall of this._balls) {
            const sb = stateBalls.find(b => b.number === renderBall.ballNumber);
            if (!sb) continue;
            if (!sb.visible) {
                renderBall.hide();
            } else {
                renderBall.show(new Vector2(sb.x, sb.y));
            }
        }
    }

    public update(_fixedDeltaMs: number = 1000 / 60): void {

        const inBallInHand = this.isBallInHand;
        if (!inBallInHand) {
            this._ballInHandResetApplied = false;
        }

        if (!this._serverGameState) return;

        const game = gs(this._serverGameState);
        const events = game.events();
        const firstEvent = events.length > 0 ? events[0] : { type: 'none' };


        if (this._shotSimulationInProgress) {
            this._balls.forEach((ball) => ball.snapshotPhysicsPosition());
            // Run one 60 Hz physics step per fixed game-loop update; rendering stays smooth
            // via alpha interpolation in Ball.draw().
            stepLiveSimulation(this._liveSimulation!, 0, 1);
            const sim = this._liveSimulation!;

            if (sim.settled && !this._waitingForShotResult) {
                this._waitingForShotResult = true;
                const compactBalls = sim.balls.map((b) => ({ number: b.number, x: b.x, y: b.y, visible: b.visible }));
                const hash64 = hashBallSnapshot(compactBalls);
                const pocketedNumbers = sim.pocketedBalls.map((p) => p.number).sort((a, b) => a - b);
                ACOSClient.send('shoot-result', {
                    shotSerial: this._serverGameState?.state?.shotSerial,
                    hash64,
                    pocketedNumbers,
                    firstHitType: sim.firstHitType,
                    firstHitNumber: sim.firstHitNumber,
                    cuePocketed: sim.cuePocketed,
                    eightPocketed: sim.eightPocketed,
                    railHit: sim.railHit,
                    objectBallRailHits: sim.objectBallRailHits,
                });
                this._shotSimulationInProgress = false;
            }

            return;
        }


        switch (firstEvent.type) {
            case 'shoot':
                // if (this._shotSimulationInProgress) {


                // }
                break;
        }

        switch (game.nextAction) {
            case 'gamestart':
                break;
            case 'newgame':
                break;
            case 'shoot': {
                // Trigger group-ball ripple once per turn (only when groups are known)
                const rippleShotSerial = game.state('shotSerial') ?? 0;
                if (rippleShotSerial !== this._lastRippleShootSerial) {
                    this._lastRippleShootSerial = rippleShotSerial;
                    this._triggerGroupRipples();
                }
                if (!this.isNextPlayer) {
                    let power = game.state("cuePower") ?? 0;
                    let angle = game.state("cueAngle") ?? 0;

                    angle = decodeAngleFromUint(angle);
                    power = decodePowerFromUint(power);
                    this._stick.serverUpdate(angle, power);
                } else {
                    const shotFired = this._stick.clientUpdate();
                    if (shotFired && !this._shotSimulationInProgress) {
                        const shot = this._stick.consumeQueuedShot();
                        if (shot) {
                            this._startSimulationWithShot(
                                encodeAngleToUint(shot.rotation),
                                encodePowerToUint(shot.power),
                            );
                        }
                    }
                }
                break;
            }
            case 'cue-move':
                if (this.isNextPlayer && this._serverGameState?.state?.cueBallInHand === true
                    && !this._localCuePlacePending) {
                    const mousePos = Mouse.position;
                    let physicsPos: Vector2;
                    // Derive break mode from server state so reconnecting players also get correct behaviour
                    this._isBreakMode = (game.state('shotSerial') ?? 0) === 0;

                    if (this._isBreakMode) {
                        // Break placement: X fixed at break line. Y always tracks mouse cursor.
                        // User hovers to position, then clicks (press + release) to confirm.
                        const ballRadius = ballConfig.diameter / 2;
                        const tableMinY = 80 + ballRadius;
                        const tableMaxY = 661 - ballRadius;
                        const clampedY = Math.max(tableMinY, Math.min(tableMaxY,
                            mousePos.y - GameConfig.physicsWorldYOffset));
                        physicsPos = new Vector2(GameConfig.cueBallPosition.x, clampedY);
                        if (Mouse.isDown(0)) {
                            this._cueMoveMouseDownSeen = true;
                        }
                    } else {
                        // Regular foul: free placement anywhere on the table
                        if (Mouse.isDown(0)) {
                            this._cueMoveMouseDownSeen = true;
                        }
                        physicsPos = new Vector2(
                            mousePos.x,
                            mousePos.y - GameConfig.physicsWorldYOffset
                        );
                    }

                    this._cueBall.cueMove(physicsPos);

                    // Throttle cue-move broadcasts: max once per 2 s, only when position changed.
                    const nowMs = performance.now();
                    if (nowMs - this._lastCueMoveSentAtMs > 2000
                        && (this._lastSentCueX !== physicsPos.x || this._lastSentCueY !== physicsPos.y)) {
                        this._lastCueMoveSentAtMs = nowMs;
                        this._lastSentCueX = physicsPos.x;
                        this._lastSentCueY = physicsPos.y;
                        ACOSClient.send('cue-move', { x: physicsPos.x, y: physicsPos.y });
                    }

                    if (Mouse.isReleased(0) && this._cueMoveMouseDownSeen) {
                        // Guard ensures stale isReleased from a previous action (e.g. clicking
                        // the start-game button) doesn’t trigger immediate placement.
                        ACOSClient.send('cue-place', { x: physicsPos.x, y: physicsPos.y });
                        this._localCuePlacePending = true;
                        this._cueBall.cuePlace(physicsPos);
                    }
                }
                break;
            case 'shoot-result':
                // Simulation already running (started by 'shoot' event); do not restart here
                break;
            case 'shoot-mismatch':
                // Handled in shoot-result for better sync
                break;
            default:
                break;
        }






        // if (inBallInHand) {
        //     this.handleBallInHand();
        //     return;
        // }

        // this.updateShotSimulation();
        // const nowMs = performance.now();

        // if (!this._shotSimulationInProgress) {
        //     this._balls.forEach((ball: Ball) => ball.update());
        //     this.handleCollisions();
        //     this.handleBallsInPockets();
        // }
        // this.syncStickFromServer();
        // this._stick.movable = this.isLocalPlayersTurn();
        // // Keep stick anchored to cue ball position every frame
        // if (this._stick.visible && this._stickFollowsCueBall) {
        //     this._stick.position = this._cueBall.position;
        //     this._stick.update();
        //     this.sendAimUpdate(nowMs);
        // }
        // this.handleInput();

        // if (!this.isBallsMoving && !this._stick.visible && !this._waitingForShotResult) {
        //     this.concludeTurn();
        //     this._stickFollowsCueBall = true;
        //     this.nextTurn();
        // }
    }

    public draw(alpha: number = 1): void {
        // Apply cue ball position lerp for observer (cue-move events arrive every 2 s)
        if (this._cueBallInterpTo !== null) {
            const nowMs = performance.now();
            const t = 1.0;// Math.min(1, (nowMs - this._cueBallInterpStartMs) / this._cueBallInterpDurationMs);
            const interpX = lerp(this._cueBallInterpFrom!.x, this._cueBallInterpTo.x, t);
            const interpY = lerp(this._cueBallInterpFrom!.y, this._cueBallInterpTo.y, t);
            this._cueBall.cueMove(new Vector2(interpX, interpY));
            if (t >= 1) {
                this._cueBallInterpTo = null;
            }
        }
        this.drawTableLayers();
        this.drawBottomBar();
        if (showWallDebugOverlay) {
            this.drawWallDebugOverlay();
        }
        this._balls.forEach((ball: Ball) => ball.draw(alpha));
        this.drawRippleEffects();
        // if (this.isBallInHand && this.isLocalPlayersTurn()) {
        //     this.drawCuePlacementIndicator();
        // }
        this.drawCueGuides();
        this._stick.draw();
    }

    private resolveRoomPlayerAtIndex(index: number): any {
        const roomPlayers = this._serverGameState?.room?.players;
        const statePlayers = this._serverGameState?.players;

        const roomEntry = Array.isArray(roomPlayers) ? roomPlayers[index] : null;
        if (roomEntry && typeof roomEntry === 'object') {
            return roomEntry;
        }

        if (typeof roomEntry === 'number' && Array.isArray(statePlayers)) {
            return statePlayers[roomEntry] ?? null;
        }

        if (typeof roomEntry === 'string' && Array.isArray(statePlayers)) {
            const byShortId = statePlayers.find((player: any) => player?.shortid === roomEntry || player?.shortId === roomEntry);
            if (byShortId) {
                return byShortId;
            }
        }

        if (Array.isArray(statePlayers) && statePlayers[index]) {
            return statePlayers[index];
        }

        return null;
    }

    private readPlayerNameField(player: any): string | null {
        if (!player || typeof player !== 'object') {
            return null;
        }

        const candidates = [
            player.displayname,
            player.displayName,
            player.name,
            player.username,
            player.nick,
            player.shortid,
            player.shortId,
            player.profile?.displayname,
            player.profile?.displayName,
            player.profile?.name,
            player.user?.displayname,
            player.user?.displayName,
            player.user?.name,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }

        return null;
    }

    private getPlayerDisplayName(index: number): string {
        const player = this.resolveRoomPlayerAtIndex(index);
        return this.readPlayerNameField(player) ?? `Player ${index + 1}`;
    }

    private getCollectedBallNumbersForPlayer(index: number): number[] {
        const player = this.resolveRoomPlayerAtIndex(index);
        const collectedBalls = player?.get?.('collectedBalls') ?? player?.collectedBalls;
        if (!Array.isArray(collectedBalls)) {
            return [];
        }

        return collectedBalls.filter((ballNumber: unknown): ballNumber is number => typeof ballNumber === 'number');
    }

    private drawHudBackdrop(): void {
        Canvas2D.drawRect(Vector2.zero, new Vector2(GameConfig.gameSize.x, hudBarHeight), 'rgba(8, 12, 10)', true);
        Canvas2D.drawLine(new Vector2(0, hudBarHeight), new Vector2(GameConfig.gameSize.x, hudBarHeight), 'rgba(220, 230, 220)', 1);
    }

    private drawBottomBar(): void {
        const barY = 750; // table bottom edge in game coordinates
        const barHeight = GameConfig.gameSize.y - barY; // 56px
        const barCenterY = barY + barHeight / 2;
        Canvas2D.drawRect(new Vector2(0, barY), new Vector2(GameConfig.gameSize.x, barHeight), 'rgba(8, 12, 10)', true);
        Canvas2D.drawLine(new Vector2(0, barY), new Vector2(GameConfig.gameSize.x, barY), 'rgba(220, 230, 220)', 1);
        const leftName = this.getPlayerDisplayName(0);
        const rightName = this.getPlayerDisplayName(1);
        const leftBalls = this.getCollectedBallNumbersForPlayer(0);
        const rightBalls = this.getCollectedBallNumbersForPlayer(1);
        Canvas2D.drawText(leftName, 'bold 26px Arial', '#f4f8f2', new Vector2(20, barCenterY), 'left', 'middle');
        Canvas2D.drawText(rightName, 'bold 26px Arial', '#f4f8f2', new Vector2(GameConfig.gameSize.x - 20, barCenterY), 'right', 'middle');
        const leftNameW = Math.max(100, Math.min(320, leftName.length * 14));
        const rightNameW = Math.max(100, Math.min(320, rightName.length * 14));
        this.drawCapturedBallsRow(new Vector2(30 + leftNameW + 16, barCenterY), leftBalls, false);
        this.drawCapturedBallsRow(new Vector2(GameConfig.gameSize.x - 30 - rightNameW - 16, barCenterY), rightBalls, true);
    }

    private drawCapturedBallsRow(start: Vector2, ballNumbers: number[], alignRight: boolean): void {
        if (ballNumbers.length === 0) {
            return;
        }

        const maxShown = Math.min(7, ballNumbers.length);
        for (let i = 0; i < maxShown; i++) {
            const offsetX = (alignRight ? -1 : 1) * i * 46;
            const texturePath = textureByBallNumber[ballNumbers[i]] || cueBallTextureUrl;
            const texture = Assets.getSprite(texturePath);
            if (!texture) {
                continue;
            }

            Canvas2D.drawTexturedSphere(texture, new Vector2(start.x + offsetX, start.y), 22, new Quaternion());
        }
    }

    private drawPlayerHud(): void {
        const leftName = this.getPlayerDisplayName(0);
        const rightName = this.getPlayerDisplayName(1);
        const leftBalls = this.getCollectedBallNumbersForPlayer(0);
        const rightBalls = this.getCollectedBallNumbersForPlayer(1);
        const centerY = hudBarHeight / 2 + 1;

        Canvas2D.drawText(leftName, 'bold 28px Arial', '#f4f8f2', new Vector2(24, centerY), 'left', 'middle');
        Canvas2D.drawText(rightName, 'bold 28px Arial', '#f4f8f2', new Vector2(GameConfig.gameSize.x - 24, centerY), 'right', 'middle');

        const leftNameWidthEstimate = Math.max(110, Math.min(360, leftName.length * 15));
        const rightNameWidthEstimate = Math.max(110, Math.min(360, rightName.length * 15));
        const leftBallsStart = new Vector2(24 + leftNameWidthEstimate + 34, centerY);
        const rightBallsStart = new Vector2(GameConfig.gameSize.x - 24 - rightNameWidthEstimate - 34, centerY);

        this.drawCapturedBallsRow(leftBallsStart, leftBalls, false);
        this.drawCapturedBallsRow(rightBallsStart, rightBalls, true);
    }

    private drawTablePart(spritePath: string, position: Vector2, size: Vector2, rotation: number = 0): void {
        const sprite = Assets.getSprite(spritePath);
        if (!sprite) {
            return;
        }

        Canvas2D.drawImage(sprite, position, rotation, new Vector2(size.x / 2, size.y / 2), size);
    }

    private drawTableLayers(): void {
        const tableWidth = 1500;
        const tableHeight = 750;
        const tableTop = GameConfig.physicsWorldYOffset;
        const tableBottom = tableTop + tableHeight;
        const cornerPocketRadius = tableConfig.cornerPocketRadius;
        const middlePocketRadius = tableConfig.middlePocketRadius;
        const railThickness = Math.round(tableConfig.cushionWidth * 1.6);
        const cornerPocketSize = new Vector2(Math.round(cornerPocketRadius * 2), Math.round(cornerPocketRadius * 2));
        const middlePocketSize = new Vector2(Math.round(middlePocketRadius * 2), Math.round(middlePocketRadius * 2));
        const pockets = tableConfig.pocketsPositions;

        // this.drawTablePart(sprites.paths.tableCorners, new Vector2(tableWidth / 2, tableTop + tableHeight / 2), new Vector2(tableWidth, tableHeight));
        // this.drawTablePart(sprites.paths.tableCloth, new Vector2(tableWidth / 2, tableTop + tableHeight / 2), new Vector2(tableWidth-cornerPocketRadius*2, tableHeight-cornerPocketRadius*2));

        const topLeft = pockets[0];
        const topMiddle = pockets[1];
        const topRight = pockets[2];
        const bottomLeft = pockets[3];
        const bottomMiddle = pockets[4];
        const bottomRight = pockets[5];

        const topLeftSpan = topMiddle.x - middlePocketRadius - (topLeft.x + cornerPocketRadius);
        const topRightSpan = topRight.x - middlePocketRadius - (topMiddle.x + middlePocketRadius);
        const bottomLeftSpan = bottomMiddle.x - middlePocketRadius - (bottomLeft.x + cornerPocketRadius);
        const bottomRightSpan = bottomRight.x - middlePocketRadius - (bottomMiddle.x + middlePocketRadius);
        const leftSpan = bottomLeft.y - middlePocketRadius - (topLeft.y + cornerPocketRadius);
        const rightSpan = bottomRight.y - middlePocketRadius - (topRight.y + cornerPocketRadius);

        const topRailY = tableTop + railThickness / 2;
        const bottomRailY = tableBottom - railThickness / 2;
        const leftRailX = railThickness / 2;
        const rightRailX = tableWidth - railThickness / 2;

        // this.drawTablePart(sprites.paths.wallCushionSmall, new Vector2((topLeft.x + cornerPocketRadius + topLeftSpan / 2), topRailY), new Vector2(topLeftSpan, railThickness));
        // this.drawTablePart(sprites.paths.wallCushionSmall, new Vector2((topMiddle.x + middlePocketRadius + topRightSpan / 2), topRailY), new Vector2(topRightSpan, railThickness));
        // this.drawTablePart(sprites.paths.wallCushionSmall, new Vector2((bottomLeft.x + cornerPocketRadius + bottomLeftSpan / 2), bottomRailY), new Vector2(bottomLeftSpan, railThickness), 180*Math.PI/180);
        // this.drawTablePart(sprites.paths.wallCushionSmall, new Vector2((bottomMiddle.x + middlePocketRadius + bottomRightSpan / 2), bottomRailY), new Vector2(bottomRightSpan, railThickness), 180*Math.PI/180);

        // this.drawTablePart(sprites.paths.cushionLong, new Vector2(leftRailX, pockets[0].y + cornerPocketRadius*2 + leftSpan / 2), new Vector2(railThickness, leftSpan), 180*Math.PI/180);
        // this.drawTablePart(sprites.paths.cushionLong, new Vector2(rightRailX, pockets[2].y + cornerPocketRadius*2 + rightSpan / 2), new Vector2(railThickness, rightSpan), 0);


        const holeSprites = [
            sprites.paths.holeTopLeft,
            sprites.paths.holeTopMiddle,
            sprites.paths.holeTopRight,
            sprites.paths.holeBottomLeft,
            sprites.paths.holeBottomMiddle,
            sprites.paths.holeBottomRight,
        ];

        // for (let i = 0; i < pockets.length; i++) {
        //     const pocket = pockets[i];
        //     if( i === 1 || i === 4) {
        //         this.drawTablePart(holeSprites[i], new Vector2(pocket.x, pocket.y + tableTop), middlePocketSize);
        //     } else {
        //         this.drawTablePart(holeSprites[i], new Vector2(pocket.x, pocket.y + tableTop), cornerPocketSize);
        //     }
        // }

        const tableSprite = Assets.getSprite(sprites.paths.table);
        if (tableSprite) {
            Canvas2D.drawImage(tableSprite, new Vector2(0, GameConfig.physicsWorldYOffset), 0, Vector2.zero, { x: 1500, y: 750 });
        }
    }

    private drawWallDebugOverlay(): void {
        const offsetY = GameConfig.physicsWorldYOffset;
        const walls = getCushionLineDefinitions();

        for (const wall of walls) {
            Canvas2D.drawLine(
                new Vector2(wall.start.x, wall.start.y + offsetY),
                new Vector2(wall.end.x, wall.end.y + offsetY),
                'rgba(255, 90, 90)',
                2,
            );
        }

        //draw ball physics boundaries
        for (const ball of this._balls) {
            // Canvas2D.drawCircle(ball.position.add(new Vector2(0, offsetY)), ballConfig.diameter / 2, 'rgba(90, 255, 90)', false, 1);
            // Canvas2D.drawNativeCircle(ball.position.add(new Vector2(0, offsetY)), ballConfig.diameter / 2, 'rgba(80, 160, 255, 0.9)', false, 1);
        }
    }


    private drawCueGuides(): void {
        if (!this.isNextPlayer || this.isBallInHand || this.isBallsMoving || !this._stick.visible) {
            return;
        }
        if (!this._liveSimulation) {
            return;
        }

        const renderOffset = new Vector2(0, GameConfig.physicsWorldYOffset);
        const origin = this._cueBall.position;
        const renderOrigin = origin.add(renderOffset);
        const rawDir = new Vector2(Math.cos(this._stick.rotation), Math.sin(this._stick.rotation));
        const dirLen = rawDir.length;
        if (dirLen <= 1e-9) return;
        const unitDir = rawDir.mult(1 / dirLen);

        // --- Primary guide: physics shape-cast of the cue ball through the live world ---
        // castCueBallGuide uses Rapier's castShape with a Ball shape, so:
        //   • centerAtContact is already offset from walls by ball radius (ghost ball won't penetrate cushions)
        //   • ball collision uses the same Rapier geometry as the real physics, not idealised ray math
        const firstHit = castCueBallGuide(
            this._liveSimulation,
            { x: origin.x, y: origin.y },
            { x: unitDir.x, y: unitDir.y },
            5000,
            0, // exclude cue ball body
        );

        if (!firstHit) return;

        const contactPos = new Vector2(firstHit.centerAtContact.x, firstHit.centerAtContact.y);

        // Draw aim line from cue ball to ghost ball contact point
        Canvas2D.drawLine(renderOrigin, contactPos.add(renderOffset), '#ffffff', 2);
        // Draw ghost ball at contact centre (correctly offset from wall/ball by radius)
        Canvas2D.drawCircle(contactPos.add(renderOffset), ballConfig.diameter / 2, '#ffffff', false, 2);

        if (!firstHit.isWall && firstHit.ballIndex != null && firstHit.ballIndex > 0) {
            // --- Secondary guide: cut-angle continuation from the struck ball ---
            const struckBall = this._balls[firstHit.ballIndex];
            if (struckBall?.visible) {
                const struckCenter = struckBall.position;
                // Cut direction: from ghost-ball contact point toward struck ball centre
                const cutDirRaw = struckCenter.subtract(contactPos);
                const cutLen = cutDirRaw.length;
                if (cutLen > 0) {
                    const cutUnitDir = cutDirRaw.mult(1 / cutLen);
                    // Analytic wall cast with ball-radius offset for the continuation line
                    const wallHit = findFirstWallHitForBall(
                        { x: struckCenter.x, y: struckCenter.y },
                        { x: cutUnitDir.x, y: cutUnitDir.y },
                        5000,
                    );
                    const cutEnd = wallHit
                        ? new Vector2(wallHit.centerAtContact.x, wallHit.centerAtContact.y)
                        : struckCenter.add(cutUnitDir.mult(250));
                    Canvas2D.drawLine(
                        struckCenter.add(renderOffset),
                        cutEnd.add(renderOffset),
                        '#ffffff',
                        2,
                    );
                }
            }
        }
    }

    private raycastWalls(origin: Vector2, direction: Vector2, maxDistance: number): { point: Vector2; distance: number } | null {
        let bestHit: { point: Vector2; distance: number } | null = null;
        for (const line of getCushionLineDefinitions()) {
            const hit = this.raySegmentIntersection(
                origin,
                direction,
                new Vector2(line.start.x, line.start.y),
                new Vector2(line.end.x, line.end.y),
                maxDistance,
            );
            if (!hit) {
                continue;
            }
            if (!bestHit || hit.distance < bestHit.distance) {
                bestHit = hit;
            }
        }
        return bestHit;
    }

    private raycastObjectBalls(origin: Vector2, direction: Vector2, maxDistance: number): { point: Vector2; distance: number; ball: Ball | null } | null {
        const dirLen = direction.length;
        if (dirLen <= 1e-9) {
            return null;
        }

        const unitDir = direction.mult(1 / dirLen);
        const collisionDistance = ballConfig.diameter; // center-to-center distance at first contact
        let bestHit: { point: Vector2; distance: number; ball: Ball | null } | null = null;

        for (const ball of this._balls) {
            if (!ball.visible || ball.ballNumber === 0) {
                continue;
            }

            const center = ball.position;
            const toCenter = origin.subtract(center);
            const a = unitDir.dot(unitDir);
            const b = 2 * toCenter.dot(unitDir);
            const c = toCenter.dot(toCenter) - collisionDistance * collisionDistance;
            const discriminant = b * b - 4 * a * c;

            if (discriminant < 0) {
                continue;
            }

            const t = (-b - Math.sqrt(discriminant)) / (2 * a);
            if (!Number.isFinite(t) || t <= 0 || t > maxDistance) {
                continue;
            }

            const hitPoint = origin.add(unitDir.mult(t));
            if (!bestHit || t < bestHit.distance) {
                bestHit = {
                    point: hitPoint,
                    distance: t,
                    ball,
                };
            }
        }

        return bestHit;
    }

    private raySegmentIntersection(
        rayOrigin: Vector2,
        rayDirection: Vector2,
        segmentA: Vector2,
        segmentB: Vector2,
        maxDistance: number,
    ): { point: Vector2; distance: number } | null {
        const segmentDirection = segmentB.subtract(segmentA);
        const denominator = rayDirection.x * segmentDirection.y - rayDirection.y * segmentDirection.x;
        if (Math.abs(denominator) < 1e-9) {
            return null;
        }

        const aMinusO = segmentA.subtract(rayOrigin);
        const rayT = (aMinusO.x * segmentDirection.y - aMinusO.y * segmentDirection.x) / denominator;
        const segU = (aMinusO.x * rayDirection.y - aMinusO.y * rayDirection.x) / denominator;

        if (rayT < 0 || rayT > maxDistance || segU < 0 || segU > 1) {
            return null;
        }

        return {
            point: rayOrigin.add(rayDirection.mult(rayT)),
            distance: rayT,
        };
    }

    private rayCircleIntersection(
        rayOrigin: Vector2,
        rayDirection: Vector2,
        circleCenter: Vector2,
        radius: number,
        maxDistance: number,
    ): { point: Vector2; distance: number } | null {
        const m = rayOrigin.subtract(circleCenter);
        const b = m.dot(rayDirection);
        const c = m.dot(m) - radius * radius;

        if (c <= 0) {
            return null;
        }

        const discriminant = b * b - c;
        if (discriminant < 0) {
            return null;
        }

        const t = -b - Math.sqrt(discriminant);
        if (t < 0 || t > maxDistance) {
            return null;
        }

        return {
            point: rayOrigin.add(rayDirection.mult(t)),
            distance: t,
        };
    }

    private _triggerGroupRipples(): void {
        if (!this._serverGameState) return;
        const shooterGroup = this._resolveNextPlayerGroup();
        if (!shooterGroup) return;

        const nowMs = performance.now();
        for (const ball of this._balls) {
            if (!ball.visible) continue;
            const n = ball.ballNumber;
            const ballType = n > 0 && n < 8 ? 'solid' : (n > 8 ? 'stripe' : null);
            if (ballType !== shooterGroup) continue;
            // Two staggered rings per ball for a wave effect
            this._rippleEffects.push({ ballNumber: n, startMs: nowMs, durationMs: 2200 });
            this._rippleEffects.push({ ballNumber: n, startMs: nowMs + 550, durationMs: 2200 });
        }
    }

    private _resolveNextPlayerGroup(): string | null {
        if (!this._serverGameState) return null;
        const game = gs(this._serverGameState);
        const nextId = game.nextPlayer;
        const statePlayers: any[] = this._serverGameState?.players ?? [];
        for (let i = 0; i < 2; i++) {
            const sp = Array.isArray(statePlayers) ? statePlayers.find((p: any) => p?.id === nextId) : null;
            const player = sp ?? this.resolveRoomPlayerAtIndex(i);
            const pid = player?.id ?? player?.get?.('id');
            if (pid !== nextId && sp == null) continue;
            const group = player?.get?.('group') ?? player?.group;
            if (group === 'solid' || group === 'stripe') return group;
            break;
        }
        // Fallback: iterate indices
        for (let i = 0; i < 2; i++) {
            const player = this.resolveRoomPlayerAtIndex(i);
            if (!player) continue;
            const pid = player?.id ?? player?.get?.('id') ?? player?.user?.id;
            if (pid !== nextId) continue;
            const group = player?.get?.('group') ?? player?.group;
            return (group === 'solid' || group === 'stripe') ? group : null;
        }
        return null;
    }

    private drawRippleEffects(): void {
        if (this._rippleEffects.length === 0) return;
        const nowMs = performance.now();
        const ballRadius = ballConfig.diameter / 2;
        const renderOffsetY = GameConfig.physicsWorldYOffset;

        // Prune expired effects in-place
        this._rippleEffects = this._rippleEffects.filter(e => nowMs < e.startMs + e.durationMs);

        for (const effect of this._rippleEffects) {
            if (nowMs < effect.startMs) continue;
            const ball = this._balls.find(b => b.ballNumber === effect.ballNumber);
            if (!ball || !ball.visible) continue;

            const progress = Math.min(1, (nowMs - effect.startMs) / effect.durationMs);
            const alpha = (1 - progress) * 0.5;
            const innerR = ballRadius * (1.05 + 1.4 * progress);
            const outerR = innerR + ballRadius * 0.3;
            const pos = { x: ball.position.x, y: ball.position.y + renderOffsetY };
            Canvas2D.drawRing(pos, innerR, outerR, 'rgb(255, 248, 180)', alpha);
        }
    }
}