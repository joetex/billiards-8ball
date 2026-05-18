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
import { ACOSClient } from '@acosgames/framework';
import { createInitialBalls, decodeAngleFromUint, decodePowerFromUint, encodeAngleToUint, encodePowerToUint, simulateShotFrames } from '../../../shared/pool-physics';

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

//------Configurations------//

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
    private _lastAppliedShotSerial: number = -1;
    private _lastStartedShotSerial: number = -1;
    private _lastSeenServerShotSerial: number = -1;
    private _localCuePlacePending: boolean = false;
    private _remoteStickTargetAngle: number = 0;
    private _cueBallInterpFrom: Vector2 | null = null;
    private _cueBallInterpTo: Vector2 | null = null;
    private _cueBallInterpStartMs: number = 0;
    private _cueBallInterpDurationMs: number = 1000;
    private _lastCuePlacementUpdateAt: number = -1;
    private _pendingServerBalls: any = null;
    private _pendingServerSerial: number = -1;
    private _stickFollowsCueBall: boolean = true;
    private _cueBallPlacementDragging: boolean = false;
    private _shotPlaybackFrames: Array<Array<{ id: number; number: number; type: 'solid' | 'stripe' | 'eight' | 'cue'; x: number; y: number; vx: number; vy: number; visible: boolean }>> | null = null;
    private _shotPlaybackFrameIndex: number = 0;
    private _shotPlaybackLockUntilMs: number = 0;
    private _lastSyncMismatchCount: number = 0;
    private _cuePlacementIsValid: boolean = false;
    private _ballInHandResetApplied: boolean = false;
    private _playbackCollidedPairs: Set<string> = new Set(); // Track which ball pairs have collided during playback
    private _pocketedBallsThisTurn: Set<number> = new Set(); // Track which balls have been pocketed this turn (across playback and live physics)
    private _lastCuePlaceConfirmedAt: number = 0; // Timestamp when cue-place was confirmed by server

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

    public get isBallInHand(): boolean {
        if (this._serverGameState !== null) {
            const inHand = this._serverGameState?.state?.cueBallInHand === true;
            const shotSerial = this._serverGameState?.state?.shotSerial;
            const awaitingShotResolution = typeof shotSerial === 'number' && shotSerial > this._lastAppliedShotSerial;
            const hasActivePlayback = this._shotPlaybackFrames !== null;
            if (awaitingShotResolution || hasActivePlayback) {
                return false;
            }
            return inHand && !this._localCuePlacePending;
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
        this.initMatch();
    }

    //------Private Methods------//

    private createPlaybackBaseBalls(): Array<{ id: number; number: number; type: 'solid' | 'stripe' | 'eight' | 'cue'; x: number; y: number; vx: number; vy: number; visible: boolean }> {
        // Playback must start from the local pre-shot state. Using server state here
        // would use post-shot authoritative positions and break deterministic replay.
        return this._balls.map((ball: Ball) => ({
            id: ball.ballNumber,
            number: ball.ballNumber,
            type: this.ballTypeFromNumber(ball.ballNumber),
            x: ball.position.x,
            y: ball.position.y,
            vx: ball.velocity.x,
            vy: ball.velocity.y,
            visible: ball.visible,
        }));
    }

    private ballTypeFromNumber(ballNumber: number): 'solid' | 'stripe' | 'eight' | 'cue' {
        if (ballNumber === 0) return 'cue';
        if (ballNumber === 8) return 'eight';
        if (ballNumber >= 1 && ballNumber <= 7) return 'solid';
        return 'stripe';
    }

    private getServerCuePlacement(): { x: number; y: number; by?: number; placed?: boolean; updatedAt?: number } | null {
        const placement = this._serverGameState?.state?.cueBallPlacement;
        if (!placement || typeof placement !== 'object') {
            return null;
        }
        if (typeof placement.x !== 'number' || typeof placement.y !== 'number') {
            return null;
        }
        return placement;
    }

    private startCueBallInterpolation(target: Vector2): void {
        this._cueBallInterpFrom = this._cueBall.position;
        this._cueBallInterpTo = target;
        this._cueBallInterpStartMs = performance.now();
    }

    private updateCueBallInterpolation(nowMs: number): void {
        if (!this._cueBallInterpFrom || !this._cueBallInterpTo) {
            return;
        }

        const elapsed = Math.max(0, nowMs - this._cueBallInterpStartMs);
        const t = Math.max(0, Math.min(1, elapsed / this._cueBallInterpDurationMs));
        const x = this._cueBallInterpFrom.x + (this._cueBallInterpTo.x - this._cueBallInterpFrom.x) * t;
        const y = this._cueBallInterpFrom.y + (this._cueBallInterpTo.y - this._cueBallInterpFrom.y) * t;
        this._cueBall.show(new Vector2(x, y));

        if (t >= 1) {
            this._cueBallInterpFrom = null;
            this._cueBallInterpTo = null;
        }
    }

    private simulateShotPlaybackFrames(angle: number, power: number): Array<Array<{ id: number; number: number; type: 'solid' | 'stripe' | 'eight' | 'cue'; x: number; y: number; vx: number; vy: number; visible: boolean }>> {
        const baseBalls = this.createPlaybackBaseBalls();
        return simulateShotFrames(baseBalls, angle, power);
    }

    private startShotPlayback(angle: number, power: number): void {
        if (power <= 0) {
            this._shotPlaybackFrames = null;
            this._shotPlaybackFrameIndex = 0;
            this._shotPlaybackLockUntilMs = 0;
            return;
        }
        this._shotPlaybackFrames = this.simulateShotPlaybackFrames(angle, power);
        this._shotPlaybackFrameIndex = 0;
        this._playbackCollidedPairs.clear(); // Reset collision tracking for new playback
        this._pocketedBallsThisTurn.clear(); // Reset pocket tracking for new turn
        const minLockMs = 120;
        this._shotPlaybackLockUntilMs = performance.now() + Math.max(minLockMs, this._shotPlaybackFrames.length * (1000 / 120));
    }

    private applyPlaybackFrame(frame: Array<{ id: number; number: number; type: 'solid' | 'stripe' | 'eight' | 'cue'; x: number; y: number; vx: number; vy: number; visible: boolean }>): void {
        for (let i = 0; i < frame.length; i++) {
            const src = frame[i];
            const dst = this.findLocalBallForServerBall(src);
            if (!dst) {
                continue;
            }
            if (!src.visible) {
                dst.hide();
                continue;
            }
            if (!dst.visible) {
                dst.show(new Vector2(src.x, src.y));
            } else {
                dst.position = new Vector2(src.x, src.y);
            }
            dst.velocity = new Vector2(src.vx, src.vy);
            dst.tickSpin();
        }
        
        // Detect and play collision sounds during playback
        this.detectPlaybackCollisions();
        // Detect and play pocket sounds during playback
        this.detectPlaybackPockets();
    }

    private updateShotPlayback(): void {
        if (!this._shotPlaybackFrames || this._shotPlaybackFrameIndex >= this._shotPlaybackFrames.length) {
            this._shotPlaybackFrames = null;
            this._shotPlaybackFrameIndex = 0;
            // Don't clear collision tracking - let it persist to prevent duplicate sounds in live physics
            return;
        }
        const frame = this._shotPlaybackFrames[this._shotPlaybackFrameIndex];
        this.applyPlaybackFrame(frame);
        this._shotPlaybackFrameIndex++;
        if (this._shotPlaybackFrameIndex >= this._shotPlaybackFrames.length) {
            this._shotPlaybackFrames = null;
            this._shotPlaybackFrameIndex = 0;
            // Don't clear collision tracking - let it persist to prevent duplicate sounds in live physics
        }
    }

    private restitutionFromSpeed(speed: number): number {
        const span = physicsConfig.restitutionSpeedHigh - physicsConfig.restitutionSpeedLow;
        const safeSpan = span <= 0 ? 1 : span;
        const t = Math.max(0, Math.min(1, (speed - physicsConfig.restitutionSpeedLow) / safeSpan));
        return physicsConfig.minRestitution + t * (physicsConfig.maxRestitution - physicsConfig.minRestitution);
    }

    private lerpAngle(from: number, to: number, t: number): number {
        let diff = to - from;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return from + diff * t;
    }

    private detectPlaybackCollisions(): void {
        // Detect ball-to-ball collisions during playback and play collision sounds
        // This is separate from physics collision resolution - just for audio feedback
        for (let i = 0; i < this._balls.length; i++) {
            const firstBall = this._balls[i];
            if (!firstBall.visible) continue;
            
            for (let j = i + 1; j < this._balls.length; j++) {
                const secondBall = this._balls[j];
                if (!secondBall.visible) continue;
                
                const delta = secondBall.position.subtract(firstBall.position);
                const dist = delta.length;
                
                // Check if balls are colliding (within collision distance)
                if (dist < ballConfig.diameter && dist > 0) {
                    // Create unique pair identifier (always smaller id first)
                    const pairKey = `${Math.min(firstBall.ballNumber, secondBall.ballNumber)}-${Math.max(firstBall.ballNumber, secondBall.ballNumber)}`;
                    
                    // Only play sound once per collision per turn
                    if (!this._playbackCollidedPairs.has(pairKey)) {
                        this._playbackCollidedPairs.add(pairKey);
                        
                        // Calculate collision force for volume (boosted by 50% with minimum floor)
                        const force = firstBall.velocity.length + secondBall.velocity.length;
                        const baseVolume = mapRange(force, 0, ballConfig.maxExpectedCollisionForce, 0, 1);
                        const volume = Math.min(1, Math.max(0.2, baseVolume * 1.5));
                        Assets.playSound(sounds.paths.ballsCollide, volume);
                    }
                } else if (dist >= ballConfig.diameter * 1.5) {
                    // Balls have separated significantly, allow re-collision
                    const pairKey = `${Math.min(firstBall.ballNumber, secondBall.ballNumber)}-${Math.max(firstBall.ballNumber, secondBall.ballNumber)}`;
                    this._playbackCollidedPairs.delete(pairKey);
                }
            }
        }
    }

    private detectPlaybackPockets(): void {
        // Detect balls going into pockets during playback and play pocket sounds
        for (let i = 0; i < this._balls.length; i++) {
            const ball = this._balls[i];
            
            // Check if ball just became invisible (went into pocket)
            if (!ball.visible && !this._pocketedBallsThisTurn.has(ball.ballNumber)) {
                this._pocketedBallsThisTurn.add(ball.ballNumber);
                Assets.playSound(sounds.paths.rail, 1);
            }
        }
    }

    private getTableBoundaries(): { minX: number; maxX: number; minY: number; maxY: number } {
        const ballRadius = ballConfig.diameter / 2;
        // Boundaries in physics space [0, 1500] x [0, 750] where balls actually exist
        // Rendering offset is applied separately during draw()
        const tableLeft = tableConfig.cushionWidth;
        const tableRight = 1500 - tableConfig.cushionWidth;
        const tableTop = tableConfig.cushionWidth;
        const tableBottom = 750 - tableConfig.cushionWidth;
        
        return {
            minX: tableLeft + ballRadius,
            maxX: tableRight - ballRadius,
            minY: tableTop + ballRadius,
            maxY: tableBottom - ballRadius,
        };
    }

    private getBallsByColor(color: Color): Ball[] {
        return this._balls.filter((ball: Ball) => ball.color === color);
    }

    private getStateOrderedBalls(): Ball[] {
        return this._balls;
    }

    private findLocalBallForServerBall(serverBall: any): Ball | null {
        if (!serverBall || typeof serverBall !== 'object') {
            return null;
        }

        if (typeof serverBall.number === 'number') {
            const byNumber = this._balls.find((ball) => ball.ballNumber === serverBall.number);
            if (byNumber) {
                return byNumber;
            }
        }

        if (typeof serverBall.id === 'number' && serverBall.id >= 0 && serverBall.id < this._balls.length) {
            return this._balls[serverBall.id];
        }

        return null;
    }

    private applyAuthoritativeBallsState(rawState: any): void {
        const balls = rawState?.balls;
        if (!Array.isArray(balls) || balls.length === 0) {
            return;
        }
        const freezeForBallInHand = rawState?.cueBallInHand === true && rawState?.shotInProgress !== true;
        for (let i = 0; i < balls.length; i++) {
            const src = balls[i];
            const dst = this.findLocalBallForServerBall(src);
            if (!dst) {
                continue;
            }
            if (!src || typeof src.x !== 'number' || typeof src.y !== 'number') {
                continue;
            }
            const isCueBall = dst.ballNumber === 0;
            if (src.visible === false) {
                if (freezeForBallInHand && isCueBall) {
                    dst.show(new Vector2(src.x, src.y));
                    dst.velocity = Vector2.zero;
                    continue;
                }
                dst.hide();
                continue;
            }
            if (!dst.visible) {
                dst.show(new Vector2(src.x, src.y));
            } else {
                dst.position = new Vector2(src.x, src.y);
            }
            if (freezeForBallInHand) {
                dst.velocity = Vector2.zero;
            } else if (typeof src.vx === 'number' && typeof src.vy === 'number') {
                dst.velocity = new Vector2(src.vx, src.vy);
            }
        }
    }

    private isAimOnlyServerUpdate(previousState: any, nextState: any): boolean {
        if (!previousState || !nextState) {
            return false;
        }

        if (previousState.shotSerial !== nextState.shotSerial) {
            return false;
        }

        const cueChanged = previousState.cueAngle !== nextState.cueAngle || previousState.cuePower !== nextState.cuePower;
        if (!cueChanged) {
            return false;
        }

        const shotContextUnchanged =
            previousState.shotInProgress === nextState.shotInProgress &&
            previousState.shotBy === nextState.shotBy &&
            previousState.shotAngle === nextState.shotAngle &&
            previousState.shotPower === nextState.shotPower &&
            previousState.cueBallInHand === nextState.cueBallInHand;

        if (!shotContextUnchanged) {
            return false;
        }

        const prevBalls = previousState.balls;
        const nextBalls = nextState.balls;
        if (!Array.isArray(prevBalls) || !Array.isArray(nextBalls) || prevBalls.length !== nextBalls.length) {
            return false;
        }

        for (let i = 0; i < prevBalls.length; i++) {
            const prevBall = prevBalls[i];
            const nextBall = nextBalls[i];
            if (!prevBall || !nextBall) {
                return false;
            }
            if (prevBall.number !== nextBall.number || prevBall.visible !== nextBall.visible) {
                return false;
            }
            if (Math.abs(prevBall.x - nextBall.x) > 0.0001 || Math.abs(prevBall.y - nextBall.y) > 0.0001) {
                return false;
            }
            if (Math.abs((prevBall.vx || 0) - (nextBall.vx || 0)) > 0.0001 || Math.abs((prevBall.vy || 0) - (nextBall.vy || 0)) > 0.0001) {
                return false;
            }
        }

        return true;
    }

    private isCueMoveOnlyServerUpdate(previousState: any, nextState: any): boolean {
        if (!previousState || !nextState) {
            return false;
        }

        if (previousState.shotSerial !== nextState.shotSerial) {
            return false;
        }

        // Cue-move packets happen while cue ball is in hand and should not trigger
        // shot playback/authoritative ball-state reconciliation.
        if (nextState.cueBallInHand !== true) {
            return false;
        }

        const shotContextUnchanged =
            previousState.shotInProgress === nextState.shotInProgress &&
            previousState.shotBy === nextState.shotBy &&
            previousState.shotAngle === nextState.shotAngle &&
            previousState.shotPower === nextState.shotPower;

        if (!shotContextUnchanged) {
            return false;
        }

        const prevPlacement = previousState.cueBallPlacement;
        const nextPlacement = nextState.cueBallPlacement;
        const placementChanged =
            !!prevPlacement &&
            !!nextPlacement &&
            (prevPlacement.x !== nextPlacement.x ||
                prevPlacement.y !== nextPlacement.y ||
                prevPlacement.updatedAt !== nextPlacement.updatedAt ||
                prevPlacement.placed !== nextPlacement.placed ||
                prevPlacement.by !== nextPlacement.by);

        if (!placementChanged) {
            return false;
        }

        const prevBalls = previousState.balls;
        const nextBalls = nextState.balls;
        if (!Array.isArray(prevBalls) || !Array.isArray(nextBalls) || prevBalls.length !== nextBalls.length) {
            return false;
        }

        // Only cue ball is allowed to move in a cue-move update.
        for (let i = 0; i < prevBalls.length; i++) {
            const prevBall = prevBalls[i];
            const nextBall = nextBalls[i];
            if (!prevBall || !nextBall || prevBall.number !== nextBall.number) {
                return false;
            }
            if (prevBall.number === 0) {
                continue;
            }
            if (prevBall.visible !== nextBall.visible) {
                return false;
            }
            if (Math.abs(prevBall.x - nextBall.x) > 0.0001 || Math.abs(prevBall.y - nextBall.y) > 0.0001) {
                return false;
            }
            if (Math.abs((prevBall.vx || 0) - (nextBall.vx || 0)) > 0.0001 || Math.abs((prevBall.vy || 0) - (nextBall.vy || 0)) > 0.0001) {
                return false;
            }
        }

        return true;
    }

    private verifyBallSync(rawState: any): void {
        const serverBalls = rawState?.balls;
        if (!Array.isArray(serverBalls) || serverBalls.length === 0) {
            this._lastSyncMismatchCount = 0;
            return;
        }

        let mismatches = 0;
        let maxPositionDelta = 0;

        for (let i = 0; i < serverBalls.length; i++) {
            const src = serverBalls[i];
            const dst = this.findLocalBallForServerBall(src);
            if (!dst || !src || typeof src.x !== 'number' || typeof src.y !== 'number') {
                continue;
            }

            if (src.visible === false) {
                if (dst.visible) {
                    mismatches++;
                }
                continue;
            }

            if (!dst.visible) {
                mismatches++;
                continue;
            }

            const delta = dst.position.distFrom(new Vector2(src.x, src.y));
            maxPositionDelta = Math.max(maxPositionDelta, delta);
            if (delta > 0.75) {
                mismatches++;
            }
        }

        this._lastSyncMismatchCount = mismatches;
        if (mismatches > 0) {
            console.warn('[PoolSync] Final playback mismatch before authoritative snap', {
                mismatches,
                maxPositionDelta,
                shotSerial: rawState?.shotSerial,
            });
        }
    }

    private onAcosMessage = (event: Event): void => {
        const msg = (event as CustomEvent<any>).detail;
        if (!msg || typeof msg !== 'object') {
            return;
        }

        const previousState = this._serverGameState?.state;
        const isAimOnlyUpdate = this.isAimOnlyServerUpdate(previousState, msg?.state);
        const isCueMoveOnlyUpdate = this.isCueMoveOnlyServerUpdate(previousState, msg?.state);

        this._serverGameState = msg;
        const localId = msg?.local?.id;
        if (typeof localId === 'number') {
            this._localPlayerId = localId;
        }

        const cueInHand = msg?.state?.cueBallInHand === true;
        const cuePlacement = this.getServerCuePlacement();

        if (cueInHand) {
            this._localCuePlacePending = false;
        }

        if (cuePlacement) {
            const updatedAt = typeof cuePlacement.updatedAt === 'number' ? cuePlacement.updatedAt : -1;
            if (updatedAt !== this._lastCuePlacementUpdateAt) {
                this._lastCuePlacementUpdateAt = updatedAt;
                const target = new Vector2(cuePlacement.x, cuePlacement.y);

                if (cuePlacement.by === this._localPlayerId) {
                    // Don't apply server updates immediately after local player placed (prevents snap-back)
                    const recentlyPlaced = performance.now() - this._lastCuePlaceConfirmedAt < 500;
                    if (!this._cueBallPlacementDragging && !recentlyPlaced) {
                        this._cueBall.show(target);
                    }
                } else {
                    this.startCueBallInterpolation(target);
                }
            }

            if (cuePlacement.placed === true && cuePlacement.by === this._localPlayerId) {
                this._localCuePlacePending = false;
                this._lastCuePlaceConfirmedAt = performance.now();
            }

            if (cuePlacement.placed === true && cueInHand === false) {
                this._stickFollowsCueBall = true;
                this._stick.show(this._cueBall.position);
            }
        }

        const shotSerial = msg?.state?.shotSerial;

        // Reset serial tracking only on true match reset (first state or serial rollback),
        // not on every pre-break shotSerial=0 state update.
        const shouldResetSerialState =
            typeof shotSerial === 'number' &&
            (this._lastSeenServerShotSerial < 0 || shotSerial < this._lastSeenServerShotSerial);
        if (shouldResetSerialState) {
            this._lastAppliedShotSerial = -1;
            this._lastStartedShotSerial = -1;
            this._lastSeenServerShotSerial = shotSerial;
            this._pendingServerBalls = null;
            this._pendingServerSerial = -1;
            this._shotPlaybackFrames = null;
            this._shotPlaybackFrameIndex = 0;

            if (msg.state) {
                this.applyAuthoritativeBallsState(msg.state);
                this._lastAppliedShotSerial = shotSerial;
            }

            this._stickFollowsCueBall = true;
            this._stick.show(this._cueBall.position);
        }

        // Always queue the latest server state for position sync.
        // Applied after any active playback finishes (see update()).
        if (msg.state && !isAimOnlyUpdate && !isCueMoveOnlyUpdate) {
            const authoritativeBalls = Array.isArray(msg.state.shotResultBalls) && msg.state.shotResultBalls.length > 0
                ? msg.state.shotResultBalls
                : msg.state.balls;
            this._pendingServerBalls = authoritativeBalls ? { ...msg.state, balls: authoritativeBalls } : msg.state;
            this._pendingServerSerial = typeof shotSerial === 'number' ? shotSerial : -1;
        }

        const hasUnplayedRemoteShotSerial = typeof shotSerial === 'number' && shotSerial > this._lastStartedShotSerial;
        if (
            hasUnplayedRemoteShotSerial &&
            typeof shotSerial === 'number' &&
            shotSerial > this._lastStartedShotSerial &&
            typeof msg?.state?.shotBy === 'number' &&
            this._localPlayerId !== null &&
            msg.state.shotBy !== this._localPlayerId &&
            typeof msg?.state?.shotAngle === 'number' &&
            typeof msg?.state?.shotPower === 'number'
        ) {
            const shotPower = decodePowerFromUint(msg.state.shotPower);
            if (shotPower > 0) {
                const shotAngle = decodeAngleFromUint(msg.state.shotAngle);
                this._lastStartedShotSerial = shotSerial;
                this._stick.show(this._cueBall.position);
                this.shootCueBall(shotPower, shotAngle, false);
            }
        }

        if (typeof shotSerial === 'number') {
            this._lastSeenServerShotSerial = Math.max(this._lastSeenServerShotSerial, shotSerial);
        }

    }

    private isLocalPlayersTurn(): boolean {
        if (this._localPlayerId === null) {
            return false;
        }

        const nextPlayer = this._serverGameState?.room?.next_player;
        return typeof nextPlayer === 'number' && nextPlayer === this._localPlayerId;
    }

    private syncStickFromServer(): void {
        if (!this._stick.visible || this._stick.aiming || this.isLocalPlayersTurn()) {
            return;
        }

        const nextPlayer = this._serverGameState?.room?.next_player;
        if (typeof nextPlayer !== 'number') {
            return;
        }

        const cueAngle = this._serverGameState?.state?.cueAngle;
        if (typeof cueAngle === 'number') {
            this._remoteStickTargetAngle = decodeAngleFromUint(cueAngle);
        }

        // Lerp stick rotation toward the server-provided target each frame
        this._stick.rotation = this.lerpAngle(this._stick.rotation, this._remoteStickTargetAngle, 0.05);
    }

    private sendAimUpdate(nowMs: number): void {
        const shotInProgress = this._serverGameState?.state?.shotInProgress === true;
        if (
            !this.isLocalPlayersTurn() ||
            !this._stick.visible ||
            this.isBallsMoving ||
            this.isBallInHand ||
            this._stick.aiming ||
            this._shotPlaybackFrames !== null ||
            this._pendingServerBalls !== null ||
            shotInProgress ||
            !this._stickFollowsCueBall
        ) {
            return;
        }

        if (nowMs - this._lastAimSentAtMs < 1000) {
            return;
        }

        const currentAngleUint = encodeAngleToUint(this._stick.rotation);
        // Only send if quantized angle changed by at least 1 unit.
        if (this._lastSentAngle !== null && Math.abs(currentAngleUint - this._lastSentAngle) < 1) {
            return;
        }

        this._lastAimSentAtMs = nowMs;
        this._lastSentAngle = currentAngleUint;
        ACOSClient.send('aim', { angle: currentAngleUint });
    }

    private handleInput(): void {
        if (!AI.finishedSession) {
            return;
        }

        // Never allow a new local shot while waiting for authoritative shot resolution.
        if (this._pendingServerBalls !== null || this._shotPlaybackFrames !== null) {
            return;
        }

        if (!this.isLocalPlayersTurn()) {
            return;
        }

        const queuedShot = this._stick.consumeQueuedShot();
        if (queuedShot) {
            const shotAngleUint = encodeAngleToUint(queuedShot.rotation);
            const shotPowerUint = encodePowerToUint(queuedShot.power);
            const shotAngle = decodeAngleFromUint(shotAngleUint);
            const shotPower = decodePowerFromUint(shotPowerUint);
            if (shotPower <= 0) {
                return;
            }
            ACOSClient.send('shoot', { angle: shotAngleUint, power: shotPowerUint });
            this._lastSentAngle = shotAngleUint;
            this._lastAimSentAtMs = performance.now();
            this.shootCueBall(shotPower, shotAngle);
        }
    }

    private getRayCollisionWithWall(origin: Vector2, direction: Vector2): { point: Vector2; t: number } | null {
        const bounds = this.getTableBoundaries();
        const { minX, maxX, minY, maxY } = bounds;

        const candidates: { point: Vector2; t: number }[] = [];

        if (direction.x > 0) {
            const t = (maxX - origin.x) / direction.x;
            const y = origin.y + direction.y * t;
            if (t > 0 && y >= minY && y <= maxY) candidates.push({ point: new Vector2(maxX, y), t });
        }
        if (direction.x < 0) {
            const t = (minX - origin.x) / direction.x;
            const y = origin.y + direction.y * t;
            if (t > 0 && y >= minY && y <= maxY) candidates.push({ point: new Vector2(minX, y), t });
        }
        if (direction.y > 0) {
            const t = (maxY - origin.y) / direction.y;
            const x = origin.x + direction.x * t;
            if (t > 0 && x >= minX && x <= maxX) candidates.push({ point: new Vector2(x, maxY), t });
        }
        if (direction.y < 0) {
            const t = (minY - origin.y) / direction.y;
            const x = origin.x + direction.x * t;
            if (t > 0 && x >= minX && x <= maxX) candidates.push({ point: new Vector2(x, minY), t });
        }

        if (candidates.length === 0) return null;

        return candidates.reduce((closest, candidate) => candidate.t < closest.t ? candidate : closest);
    }

    private getRayCollisionWithBall(origin: Vector2, direction: Vector2): { ball: Ball; point: Vector2; t: number } | null {
        const collisionDistance = ballConfig.diameter;
        let result: { ball: Ball; point: Vector2; t: number } | null = null;

        this._balls.forEach((ball: Ball) => {
            if (!ball.visible || ball.color === Color.white) {
                return;
            }

            const center = ball.position;
            const toCenter = origin.subtract(center);
            const a = direction.dot(direction);
            const b = 2 * toCenter.dot(direction);
            const c = toCenter.dot(toCenter) - collisionDistance * collisionDistance;
            const discriminant = b * b - 4 * a * c;

            if (discriminant < 0) {
                return;
            }

            const t = (-b - Math.sqrt(discriminant)) / (2 * a);
            if (t <= 0) {
                return;
            }

            const hitPoint = origin.add(direction.mult(t));
            if (!result || t < result.t) {
                result = { ball, point: hitPoint, t };
            }
        });

        return result;
    }

    private drawCueGuides(): void {
        if (!this.isLocalPlayersTurn() || this.isBallInHand || this.isBallsMoving || !this._stick.visible) {
            return;
        }

        const renderOffset = new Vector2(0, GameConfig.physicsWorldYOffset);
        const origin = this._cueBall.position;
        const renderOrigin = origin.add(renderOffset);
        const direction = new Vector2(Math.cos(this._stick.rotation), Math.sin(this._stick.rotation));
        const wallHit = this.getRayCollisionWithWall(origin, direction);
        const ballHit = this.getRayCollisionWithBall(origin, direction);

        if (!wallHit && !ballHit) {
            return;
        }

        if (ballHit && (!wallHit || ballHit.t < wallHit.t)) {
            Canvas2D.drawLine(renderOrigin, ballHit.point.add(renderOffset), '#ffffff', 2);
            Canvas2D.drawCircle(ballHit.point.add(renderOffset), (ballConfig.diameter / 2), '#ffffff', false, 2);

            const struckBallCenter = ballHit.ball.position;
            const struckDirRaw = struckBallCenter.subtract(ballHit.point);
            if (struckDirRaw.length > 0) {
                const struckDirection = struckDirRaw.mult(1 / struckDirRaw.length);
                const struckWallHit = this.getRayCollisionWithWall(struckBallCenter, struckDirection);
                const struckEnd = struckWallHit ? struckWallHit.point : struckBallCenter.add(struckDirection.mult(250));
                Canvas2D.drawLine(struckBallCenter.add(renderOffset), struckEnd.add(renderOffset), '#ffffff', 2);
            }
            return;
        }

        if (wallHit) {
            Canvas2D.drawLine(renderOrigin, wallHit.point.add(renderOffset), '#ffffff', 2);
            Canvas2D.drawCircle(wallHit.point.add(renderOffset), (ballConfig.diameter / 2), '#ffffff', false, 2);
        }
    }

    private isBallPosOutsideTopBorder(position: Vector2): boolean {
        const bounds = this.getTableBoundaries();
        return position.y < bounds.minY;
    }

    private isBallPosOutsideLeftBorder(position: Vector2): boolean {
        const bounds = this.getTableBoundaries();
        return position.x < bounds.minX;
    }

    private isBallPosOutsideRightBorder(position: Vector2): boolean {
        const bounds = this.getTableBoundaries();
        return position.x > bounds.maxX;
    }

    private isBallPosOutsideBottomBorder(position: Vector2): boolean {
        const bounds = this.getTableBoundaries();
        return position.y > bounds.maxY;
    }

    private handleCollisionWithTopCushion(ball: Ball): void {
        const bounds = this.getTableBoundaries();
        ball.position = new Vector2(ball.position.x, bounds.minY);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    private handleCollisionWithLeftCushion(ball: Ball): void {
        const bounds = this.getTableBoundaries();
        ball.position = new Vector2(bounds.minX, ball.position.y);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    private handleCollisionWithRightCushion(ball: Ball): void {
        const bounds = this.getTableBoundaries();
        ball.position = new Vector2(bounds.maxX, ball.position.y);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    private handleCollisionWithBottomCushion(ball: Ball): void {
        const bounds = this.getTableBoundaries();
        ball.position = new Vector2(ball.position.x, bounds.maxY);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    private isCueBallCollisionDisabled(): boolean {
        return this._serverGameState?.state?.cueBallInHand === true || this._localCuePlacePending;
    }

    private resolveBallCollisionWithCushion(ball: Ball): void {

        if (ball.ballNumber === 0 && this.isCueBallCollisionDisabled()) {
            return;
        }

        let collided: boolean = false;

        if(this.isBallPosOutsideTopBorder(ball.nextPosition)) {
            this.handleCollisionWithTopCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideLeftBorder(ball.nextPosition)) {
            this.handleCollisionWithLeftCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideRightBorder(ball.nextPosition)) {
            this.handleCollisionWithRightCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideBottomBorder(ball.nextPosition)) {
            this.handleCollisionWithBottomCushion(ball);
            collided = true;
        }

        if(collided) {
            const restitution = this.restitutionFromSpeed(ball.velocity.length);
            ball.velocity = ball.velocity.mult(restitution);
        }
    }

    private resolveBallsCollision (first: Ball, second: Ball): boolean {

        if(!first.visible || !second.visible){
            return false;
        }

        const delta: Vector2 = second.position.subtract(first.position);
        const dist: number = delta.length;

        if (dist >= ballConfig.diameter || dist === 0) {
            return false;
        }

        const normal: Vector2 = delta.mult(1 / dist);
        const penetration: number = ballConfig.diameter - dist;
        const separation: Vector2 = normal.mult(penetration / 2);

        first.position = first.position.add(separation.mult(-1));
        second.position = second.position.add(separation);

        const relativeVelocity: Vector2 = second.velocity.subtract(first.velocity);
        const velocityAlongNormal: number = relativeVelocity.dot(normal);

        if (velocityAlongNormal >= 0) {
            return false;  // Balls already separating, no collision to resolve
        }

        const impactSpeed: number = Math.abs(velocityAlongNormal);
        const restitution: number = this.restitutionFromSpeed(impactSpeed);
        const impulseMagnitude: number = -((1 + restitution) * velocityAlongNormal) / 2;
        const impulse: Vector2 = normal.mult(impulseMagnitude);

        first.velocity = first.velocity.add(impulse.mult(-1));
        second.velocity = second.velocity.add(impulse);
        
        return true;
    }

    private handleCollisions(): void {
        for(let i = 0 ; i < this._balls.length ; i++ ){ 
            
            this.resolveBallCollisionWithCushion(this._balls[i]);

            for(let j = i + 1 ; j < this._balls.length ; j++ ){
                const firstBall = this._balls[i];
                const secondBall = this._balls[j];

                if (
                    this.isCueBallCollisionDisabled() &&
                    (firstBall.ballNumber === 0 || secondBall.ballNumber === 0)
                ) {
                    continue;
                }

                const collided = this.resolveBallsCollision(firstBall, secondBall);
                
                if(collided){
                    // Only play sound if this collision pair hasn't been heard during playback
                    const pairKey = `${Math.min(firstBall.ballNumber, secondBall.ballNumber)}-${Math.max(firstBall.ballNumber, secondBall.ballNumber)}`;
                    if (!this._playbackCollidedPairs.has(pairKey)) {
                        this._playbackCollidedPairs.add(pairKey);
                        const force: number = firstBall.velocity.length + secondBall.velocity.length
                        const baseVolume: number = mapRange(force, 0, ballConfig.maxExpectedCollisionForce, 0, 1);
                        const volume: number = Math.min(1, Math.max(0.2, baseVolume * 1.5));
                        Assets.playSound(sounds.paths.ballsCollide, volume);
                    }

                    if(!this._turnState.firstCollidedBallColor) {
                        const color: Color = firstBall.color === Color.white ? secondBall.color : firstBall.color;
                        this._turnState.firstCollidedBallColor = color;
                    }
                }
            }
        }    
    }

    private isInsidePocket(position: Vector2): boolean {
        return tableConfig.pocketsPositions
            .some((pocketPos: IVector2) => position.distFrom(Vector2.copy(pocketPos)) <= tableConfig.pocketRadius);

    }

    private resolveBallInPocket(ball: Ball): void {

        if (this.isInsidePocket(ball.position)) {
            ball.hide();
        }
    }

    private isValidPlayerColor(color: Color): boolean {
        return color === Color.red || color === Color.yellow;
    }

    private handleBallsInPockets(): void {
        this._balls.forEach((ball: Ball) => {
            this.resolveBallInPocket(ball);
            if (!ball.visible && !this._turnState.pocketedBalls.includes(ball)) {
                // Only play sound if this ball wasn't pocketed during playback
                if (!this._pocketedBallsThisTurn.has(ball.ballNumber)) {
                    this._pocketedBallsThisTurn.add(ball.ballNumber);
                    Assets.playSound(sounds.paths.rail, 1);
                }
                if(!this.currentPlayer.color && this.isValidPlayerColor(ball.color)) {
                    this.currentPlayer.color = ball.color;
                    this.nextPlayer.color = ball.color === Color.yellow ? Color.red : Color.yellow;
                }
                this._turnState.pocketedBalls.push(ball);
            }
        });
    }

    private handleBallInHand(): void {

        const nowMs = performance.now();

        // Entering foul placement: teleport cue to break-area start only once,
        // after playback has completed and ball-in-hand is active.
        if (!this._ballInHandResetApplied) {
            const breakPosition = Vector2.copy(GameConfig.cueBallPosition);
            this._cueBall.show(breakPosition);
            this._cueBallPlacementDragging = false;
            this._cuePlacementIsValid = this.isValidPosToPlaceCueBall(this._cueBall.position);
            this._ballInHandResetApplied = true;
            this._lastSentCueX = breakPosition.x;
            this._lastSentCueY = breakPosition.y;
            this._lastCueMoveSentAtMs = nowMs;
            // Clear collision and pocket tracking from previous turn
            this._playbackCollidedPairs.clear();
            this._pocketedBallsThisTurn.clear();
            ACOSClient.send('cue-move', { x: breakPosition.x, y: breakPosition.y });
        }

        // During foul placement, keep cue ball visible unless still in playback
        // Only show after playback completes to prevent showing ball that's in pocket
        const nowInPlayback = this._shotPlaybackFrames !== null;
        if (!this._cueBall.visible && !nowInPlayback) {
            const serverCuePlacement = this.getServerCuePlacement();
            if (serverCuePlacement) {
                this._cueBall.show(new Vector2(serverCuePlacement.x, serverCuePlacement.y));
            } else {
                this._cueBall.show(Vector2.copy(GameConfig.cueBallPosition));
            }
        }

        const cueRadius = ballConfig.diameter / 2;
        const currentCuePosition = this._cueBall.position;
        // Convert mouse position from game space to physics space
        const mousePhysicsPosition = new Vector2(Mouse.position.x, Mouse.position.y - GameConfig.physicsWorldYOffset);
        const pointerDown = Mouse.isDown(inputConfig.mousePlaceBallButton);
        const pointerPressed = Mouse.isPressed(inputConfig.mousePlaceBallButton);
        const pointerOnCueBall = mousePhysicsPosition.distFrom(currentCuePosition) <= cueRadius;

        // Keep replay authoritative: do not allow placement while a shot replay/state apply is pending.
        const shotInProgress = this._serverGameState?.state?.shotInProgress === true;
        if (this._pendingServerBalls !== null || this._shotPlaybackFrames !== null || shotInProgress) {
            this._stick.movable = false;
            this._stick.visible = false;
            this._cueBallPlacementDragging = false;
            this._cuePlacementIsValid = false;
            return;
        }

        if (!this.isLocalPlayersTurn()) {
            this._stick.movable = false;
            this._stick.visible = false;
            this._cueBallPlacementDragging = false;
            this.updateCueBallInterpolation(nowMs);
            return;
        }

        if (this._cueBallPlacementDragging && pointerDown) {
            this._cueBall.show(mousePhysicsPosition);
        }

        this._cuePlacementIsValid = this.isValidPosToPlaceCueBall(this._cueBall.position);

        if (pointerPressed && !this._cueBallPlacementDragging) {
            if (pointerOnCueBall || !this._cueBall.visible) {
                this._cueBallPlacementDragging = true;
                if (!pointerOnCueBall) {
                    this._cueBall.show(mousePhysicsPosition);
                }
            }
        }

        if (this._cueBallPlacementDragging && !pointerDown) {
            this._cueBallPlacementDragging = false;
            this._cuePlacementIsValid = this.isValidPosToPlaceCueBall(this._cueBall.position);
            if (this._cuePlacementIsValid) {
                this._localCuePlacePending = true;
                this.placeBallInHand(this._cueBall.position);
                // Send physics space coordinates (already correct - no offset needed)
                ACOSClient.send('cue-place', { x: this._cueBall.position.x, y: this._cueBall.position.y });
                return;
            }
        }

        if (this._cueBallPlacementDragging && this._cuePlacementIsValid && nowMs - this._lastCueMoveSentAtMs >= 100) {
            const currentX = this._cueBall.position.x;
            const currentY = this._cueBall.position.y;
            // Only send if position changed by more than a small threshold (1 pixel)
            if (
                this._lastSentCueX !== null && this._lastSentCueY !== null &&
                Math.hypot(currentX - this._lastSentCueX, currentY - this._lastSentCueY) < 1
            ) {
                // Position hasn't moved enough, skip sending
            } else {
                this._lastCueMoveSentAtMs = nowMs;
                this._lastSentCueX = currentX;
                this._lastSentCueY = currentY;
                ACOSClient.send('cue-move', { x: currentX, y: currentY });
            }
        }

        this._stick.movable = false;
        this._stick.visible = false;
    }

    private handleGameOver(): void {
        if (this._turnState.isValid) {
            this.currentPlayer.overallScore++;
        }
        else {
            this.nextPlayer.overallScore++;
        }
        this.initMatch();
    }

    private nextTurn(): void {

        const foul = !this._turnState.isValid;

        // Clear collision and pocket tracking for new turn
        this._playbackCollidedPairs.clear();
        this._pocketedBallsThisTurn.clear();

        if (this.isGameOver) {
            this.handleGameOver();
            return;
        }

        if(!this._cueBall.visible){
            this._cueBall.show(Vector2.copy(GameConfig.cueBallPosition));
        }

        if(foul || this._turnState.pocketedBalls.length === 0) {
            this._currentPlayerIndex++;
            this._currentPlayerIndex = this._currentPlayerIndex % this._players.length;
        }

        this._stick.show(this._cueBall.position);

        this._turnState = new State();
        this._turnState.ballInHand = foul;

        if (this.isAITurn()) {
            AI.startSession(this);
        }
    }

    private drawCurrentPlayerLabel(): void {
        const leftName = this.getPlayerDisplayName(0);
        const rightName = this.getPlayerDisplayName(1);
        const centerY = hudBarHeight / 2 + 10;
        Canvas2D.drawText(leftName, 'bold 28px Arial', '#f4f8f2', new Vector2(24, centerY), 'left');
        Canvas2D.drawText(rightName, 'bold 28px Arial', '#f4f8f2', new Vector2(gameSize.x - 24, centerY), 'right');
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
            const byShortId = statePlayers.find((p: any) => p?.shortid === roomEntry || p?.shortId === roomEntry);
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
        const resolved = this.readPlayerNameField(player);
        if (resolved) {
            return resolved;
        }

        return 'Unknown';
    }

    private getCapturedBallsForPlayer(index: number): Ball[] {
        const player = this._players[index];
        if (!player || !player.color) {
            return [];
        }
        return this.getBallsByColor(player.color).filter((ball: Ball) => !ball.visible);
    }

    private getBallTexturePath(ball: Ball): string {
        return textureByBallNumber[ball.ballNumber] || cueBallTextureUrl;
    }

    private drawCapturedBallsRow(start: Vector2, balls: Ball[], alignRight: boolean): void {
        if (balls.length === 0) {
            return;
        }

        const maxShown = Math.min(7, balls.length);
        for (let i = 0; i < maxShown; i++) {
            const offsetX = (alignRight ? -1 : 1) * i * 38;
            const ball = balls[i];
            const texturePath = this.getBallTexturePath(ball);
            const texture = Assets.getSprite(texturePath);
            if (!texture) {
                continue;
            }
            // Identity quaternion (no rotation) for static HUD balls
            const identityQuaternion = { x: 0, y: 0, z: 0, w: 1 };
            Canvas2D.drawTexturedSphere(texture, new Vector2(start.x + offsetX, start.y), 19, identityQuaternion);
        }
    }

    private drawMatchScores(): void {
        const leftCaptured = this.getCapturedBallsForPlayer(0);
        const rightCaptured = this.getCapturedBallsForPlayer(1);

        const leftName = this.getPlayerDisplayName(0);
        const rightName = this.getPlayerDisplayName(1);
        const leftNameWidthEstimate = Math.max(110, Math.min(360, leftName.length * 15));
        const rightNameWidthEstimate = Math.max(110, Math.min(360, rightName.length * 15));

        const centerY = hudBarHeight / 2;
        const leftBallsStart = new Vector2(24 + leftNameWidthEstimate + 34, centerY);
        const rightBallsStart = new Vector2(gameSize.x - 24 - rightNameWidthEstimate - 34, centerY);

        this.drawCapturedBallsRow(leftBallsStart, leftCaptured, false);
        this.drawCapturedBallsRow(rightBallsStart, rightCaptured, true);
    }

    private drawOverallScores(): void {
        const left = this._players[0]?.overallScore ?? 0;
        const right = this._players[1]?.overallScore ?? 0;
        Canvas2D.drawText(`${left}`, 'bold 20px Impact', '#dfe8df', new Vector2(24, hudBarHeight - 4), 'left');
        Canvas2D.drawText(`${right}`, 'bold 20px Impact', '#dfe8df', new Vector2(gameSize.x - 24, hudBarHeight - 4), 'right');
    }

    private drawCuePlacementIndicator(): void {
        const color = this._cuePlacementIsValid ? '#3dde7f' : '#ff4a4a';
        const renderPosition = new Vector2(this._cueBall.position.x, this._cueBall.position.y + GameConfig.physicsWorldYOffset);
        Canvas2D.drawCircle(renderPosition, ballConfig.diameter * 0.62, color, false, 3);
    }

    private drawHudBackdrop(): void {
        Canvas2D.drawRect(Vector2.zero, new Vector2(gameSize.x, hudBarHeight), 'rgba(8, 12, 10, 0.35)', true);
        Canvas2D.drawLine(new Vector2(0, hudBarHeight), new Vector2(gameSize.x, hudBarHeight), 'rgba(220, 230, 220)', 1);
    }

    private isInsideTableBoundaries(position: Vector2): boolean {
        let insideTable: boolean =  !this.isInsidePocket(position);
        insideTable = insideTable && !this.isBallPosOutsideTopBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideLeftBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideRightBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideBottomBorder(position);

        return insideTable;
    }

    private isAITurn(): boolean {
        return AI.finishedSession && aiConfig.on && this._currentPlayerIndex === aiConfig.playerIndex;
    }

    //------Public Methods------//

    public initMatch(): void {
        const textureByNumber: Record<number, string> = {
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

        const initialBalls = createInitialBalls();
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

            return new Ball(new Vector2(ball.x, ball.y), color, textureByNumber[ball.number], ball.number);
        });

        this._cueBall = this._balls.find((ball) => ball.ballNumber === 0)!;
        this._8Ball = this._balls.find((ball) => ball.ballNumber === 8)!;

        this._stick = new Stick(Vector2.copy(GameConfig.cueBallPosition));

        this._currentPlayerIndex = 0;

        this._players.forEach((player: Player) => {
            player.matchScore = 0;
            player.color = null;
        });
        this._turnState = new State();
        this._referee = new Referee();

        if (this.isAITurn()) {
            AI.startSession(this);
        }
    }

    public isValidPosToPlaceCueBall(position: Vector2): boolean {
        let noOverlap: boolean =  this._balls.every((ball: Ball) => {
            return ball.color === Color.white || 
                   ball.position.distFrom(position) > ballConfig.diameter;
        })

        return noOverlap && this.isInsideTableBoundaries(position);
    }

    public placeBallInHand(position: Vector2): void {
        this._cueBall.position = position;
        this._cueBall.velocity = Vector2.zero;
        this._cueBall.show(position); // Ensure cue ball is visible after placement
        this._turnState.ballInHand = false;
        this._stickFollowsCueBall = true;
        this._stick.show(this._cueBall.position);
    }

    public concludeTurn(): void {
        if(this.currentPlayer.color) {
            this.currentPlayer.matchScore = 8 - this.getBallsByColor(this.currentPlayer.color).filter((ball: Ball) => ball.visible).length - this.getBallsByColor(Color.black).filter((ball: Ball) => ball.visible).length;
        }

        if(this.nextPlayer.color) {
            this.nextPlayer.matchScore = 8 - this.getBallsByColor(this.nextPlayer.color).filter((ball: Ball) => ball.visible).length - this.getBallsByColor(Color.black).filter((ball: Ball) => ball.visible).length;
        }

        this._turnState.isValid = this._referee.isValidTurn(this.currentPlayer, this._turnState);
    }

    public shootCueBall(power: number, rotation: number, clearPendingServerState: boolean = true): void {
        if(power > 0) {
            this._stick.rotation = rotation;
            this._stick.shoot();
            this._stick.movable = false;
            this._stickFollowsCueBall = false;
            if (clearPendingServerState) {
                this._pendingServerBalls = null;
                this._pendingServerSerial = -1;
            }
            this.startShotPlayback(rotation, power);
            setTimeout(() => this._stick.hide(), GameConfig.timeoutToHideStickAfterShot);
        }
    }

    public update(): void {

        const inBallInHand = this.isBallInHand;
        if (!inBallInHand) {
            this._ballInHandResetApplied = false;
        }

        if(inBallInHand) {
            this.handleBallInHand();
            return;
        }

        this.updateShotPlayback();
        const nowMs = performance.now();
        const playbackLocked = nowMs < this._shotPlaybackLockUntilMs;
        const hasActivePlayback = this._shotPlaybackFrames !== null;
        let appliedAuthoritativeThisFrame = false;

        if (!hasActivePlayback && !playbackLocked && this._pendingServerBalls !== null) {
            this.verifyBallSync(this._pendingServerBalls);
            this.applyAuthoritativeBallsState(this._pendingServerBalls);
            if (this._pendingServerSerial > this._lastAppliedShotSerial) {
                this._lastAppliedShotSerial = this._pendingServerSerial;
            }
            this._pendingServerBalls = null;
            this._pendingServerSerial = -1;
            this._shotPlaybackLockUntilMs = 0;
            appliedAuthoritativeThisFrame = true;
        }

        if (!hasActivePlayback && !appliedAuthoritativeThisFrame) {
            this._balls.forEach((ball: Ball) => ball.update());
            this.handleCollisions();
            this.handleBallsInPockets();
        }
        this.syncStickFromServer();
        this._stick.movable = this.isLocalPlayersTurn();
        // Keep stick anchored to cue ball position every frame
        if (this._stick.visible && this._stickFollowsCueBall) {
            this._stick.position = this._cueBall.position;
        }
        this._stick.update();
        this.sendAimUpdate(nowMs);
        this.handleInput();

        if(!this.isBallsMoving && !this._stick.visible) {
            this.concludeTurn();
            this._stickFollowsCueBall = true;
            this.nextTurn();
        }
    }

    public draw(): void {
        // Render cue guides and cue placement indicator at max FPS for smooth visuals
        // (these don't affect physics, only visual feedback)
        
        // Draw table texture at natural sim world size (1500×750), positioned below HUD bar
        const tableSprite = Assets.getSprite(sprites.paths.table);
        if (tableSprite) {
            Canvas2D.drawImage(tableSprite, new Vector2(0, GameConfig.physicsWorldYOffset), 0, Vector2.zero, { x: 1500, y: 750 });
        }
        this._balls.forEach((ball: Ball) => ball.draw());
        if (this.isBallInHand && this.isLocalPlayersTurn()) {
            this.drawCuePlacementIndicator();
        }
        this.drawCueGuides();
        this._stick.draw();
        this.drawHudBackdrop();
        this.drawCurrentPlayerLabel();
        this.drawMatchScores();
        this.drawOverallScores();
    }
}