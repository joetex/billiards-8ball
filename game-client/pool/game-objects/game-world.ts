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
    private _lastAppliedShotSerial: number = -1;
    private _remoteStickTargetAngle: number = 0;
    private _pendingServerBalls: any = null;
    private _pendingServerSerial: number = -1;

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

    private getBallsByColor(color: Color): Ball[] {
        return this._balls.filter((ball: Ball) => ball.color === color);
    }

    private getStateOrderedBalls(): Ball[] {
        return this._balls;
    }

    private applyAuthoritativeBallsState(rawState: any): void {
        const balls = rawState?.balls;
        if (!Array.isArray(balls) || balls.length === 0) {
            return;
        }

        const localBalls = this.getStateOrderedBalls();
        const count = Math.min(localBalls.length, balls.length);

        for (let i = 0; i < count; i++) {
            const src = balls[i];
            const dst = localBalls[i];

            if (!src || typeof src.x !== 'number' || typeof src.y !== 'number') {
                continue;
            }

            if (src.visible === false) {
                dst.hide();
                continue;
            }

            dst.show(new Vector2(src.x, src.y));
            if (typeof src.vx === 'number' && typeof src.vy === 'number') {
                dst.velocity = new Vector2(src.vx, src.vy);
            }
        }
    }

    private onAcosMessage = (event: Event): void => {
        const msg = (event as CustomEvent<any>).detail;
        if (!msg || typeof msg !== 'object') {
            return;
        }

        this._serverGameState = msg;
        const localId = msg?.local?.id;
        if (typeof localId === 'number') {
            this._localPlayerId = localId;
        }

        const shotSerial = msg?.state?.shotSerial;
        if (typeof shotSerial === 'number' && shotSerial > this._lastAppliedShotSerial) {
            // Store authoritative state; defer applying until local balls stop moving
            this._pendingServerBalls = msg.state;
            this._pendingServerSerial = shotSerial;

            // Trigger local ball simulation for opponent shots so they animate on this client
            const lastShot = msg?.state?.lastShot;
            if (lastShot && typeof lastShot.by === 'number' && lastShot.by !== this._localPlayerId) {
                if (typeof lastShot.angle === 'number' && typeof lastShot.power === 'number' && lastShot.power > 0) {
                    this._stick.show(this._cueBall.position);
                    this.shootCueBall(lastShot.power, lastShot.angle);
                }
            }
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
        const players = this._serverGameState?.players;
        if (!Array.isArray(players) || typeof nextPlayer !== 'number') {
            return;
        }

        const player = players[nextPlayer];
        const angle = player?.angle;
        if (typeof angle === 'number') {
            this._remoteStickTargetAngle = angle;
        }

        // Lerp stick rotation toward the server-provided target each frame
        this._stick.rotation = this.lerpAngle(this._stick.rotation, this._remoteStickTargetAngle, 0.05);
    }

    private sendAimUpdate(nowMs: number): void {
        if (!this.isLocalPlayersTurn() || !this._stick.visible || this.isBallsMoving || this.isBallInHand) {
            return;
        }

        if (nowMs - this._lastAimSentAtMs < 1000) {
            return;
        }

        this._lastAimSentAtMs = nowMs;
        ACOSClient.send('aim', { angle: this._stick.rotation });
    }

    private handleInput(): void {
        if (!AI.finishedSession) {
            return;
        }

        if (!this.isLocalPlayersTurn()) {
            return;
        }

        const queuedShot = this._stick.consumeQueuedShot();
        if (queuedShot) {
            ACOSClient.send('shoot', { angle: queuedShot.rotation, power: queuedShot.power });
            this.shootCueBall(queuedShot.power, queuedShot.rotation);
        }
    }

    private getRayCollisionWithWall(origin: Vector2, direction: Vector2): { point: Vector2; t: number } | null {
        const ballRadius = ballConfig.diameter / 2;
        const minX = tableConfig.cushionWidth + ballRadius;
        const maxX = gameSize.x - tableConfig.cushionWidth - ballRadius;
        const minY = tableConfig.cushionWidth + ballRadius;
        const maxY = gameSize.y - tableConfig.cushionWidth - ballRadius;

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

        const origin = this._cueBall.position;
        const direction = new Vector2(Math.cos(this._stick.rotation), Math.sin(this._stick.rotation));
        const wallHit = this.getRayCollisionWithWall(origin, direction);
        const ballHit = this.getRayCollisionWithBall(origin, direction);

        if (!wallHit && !ballHit) {
            return;
        }

        if (ballHit && (!wallHit || ballHit.t < wallHit.t)) {
            Canvas2D.drawLine(origin, ballHit.point, '#ffffff', 2);
            Canvas2D.drawCircle(ballHit.point, (ballConfig.diameter / 2) * 0.74, '#ffffff', false, 2);

            const struckBallCenter = ballHit.ball.position;
            const struckDirRaw = struckBallCenter.subtract(ballHit.point);
            if (struckDirRaw.length > 0) {
                const struckDirection = struckDirRaw.mult(1 / struckDirRaw.length);
                const struckWallHit = this.getRayCollisionWithWall(struckBallCenter, struckDirection);
                const struckEnd = struckWallHit ? struckWallHit.point : struckBallCenter.add(struckDirection.mult(250));
                Canvas2D.drawLine(struckBallCenter, struckEnd, '#ffffff', 2);
            }
            return;
        }

        if (wallHit) {
            Canvas2D.drawLine(origin, wallHit.point, '#ffffff', 2);
            Canvas2D.drawCircle(wallHit.point, (ballConfig.diameter / 2)  * 0.74, '#ffffff', false, 2);
        }
    }

    private isBallPosOutsideTopBorder(position: Vector2): boolean {
        const topBallEdge: number = position.y - ballConfig.diameter / 2;
        return topBallEdge <= tableConfig.cushionWidth;
    }

    private isBallPosOutsideLeftBorder(position: Vector2): boolean {
        const leftBallEdge: number = position.x - ballConfig.diameter / 2;
        return leftBallEdge <= tableConfig.cushionWidth;
    }

    private isBallPosOutsideRightBorder(position: Vector2): boolean {
        const rightBallEdge: number = position.x + ballConfig.diameter / 2;
        return rightBallEdge >= gameSize.x - tableConfig.cushionWidth;
    }

    private isBallPosOutsideBottomBorder(position: Vector2): boolean {
        const bottomBallEdge: number = position.y + ballConfig.diameter / 2;
        return bottomBallEdge >= gameSize.y - tableConfig.cushionWidth;
    }

    private handleCollisionWithTopCushion(ball: Ball): void {
        ball.position = ball.position.addY(tableConfig.cushionWidth - ball.position.y + ballConfig.diameter / 2);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    private handleCollisionWithLeftCushion(ball: Ball): void {
        ball.position = ball.position.addX(tableConfig.cushionWidth - ball.position.x + ballConfig.diameter / 2);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    private handleCollisionWithRightCushion(ball: Ball): void {
        ball.position = ball.position.addX(gameSize.x - tableConfig.cushionWidth - ball.position.x - ballConfig.diameter / 2);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    private handleCollisionWithBottomCushion(ball: Ball): void {
        ball.position = ball.position.addY(gameSize.y - tableConfig.cushionWidth - ball.position.y - ballConfig.diameter / 2);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    private resolveBallCollisionWithCushion(ball: Ball): void {

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
            return true;
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
                const collided = this.resolveBallsCollision(firstBall, secondBall);
                
                if(collided){
                    const force: number = firstBall.velocity.length + secondBall.velocity.length
                    const volume: number = mapRange(force, 0, ballConfig.maxExpectedCollisionForce, 0, 1);
                    Assets.playSound(sounds.paths.ballsCollide, volume);

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
                Assets.playSound(sounds.paths.rail, 1);
                if(!this.currentPlayer.color && this.isValidPlayerColor(ball.color)) {
                    this.currentPlayer.color = ball.color;
                    this.nextPlayer.color = ball.color === Color.yellow ? Color.red : Color.yellow;
                }
                this._turnState.pocketedBalls.push(ball);
            }
        });
    }

    private handleBallInHand(): void {

        if (!this.isLocalPlayersTurn()) {
            this._stick.movable = false;
            this._stick.visible = false;
            return;
        }

        if(Mouse.isPressed(inputConfig.mousePlaceBallButton) && this.isValidPosToPlaceCueBall(Mouse.position)) {
            this.placeBallInHand(Mouse.position);
        }
        else {
            this._stick.movable = false;
            this._stick.visible = false;
            this._cueBall.position = Mouse.position;
        }
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
        
        Canvas2D.drawText(
            (labelsConfig.currentPlayer.text || 'PLAYER ') + (this._currentPlayerIndex + 1), 
            labelsConfig.currentPlayer.font, 
            labelsConfig.currentPlayer.color, 
            labelsConfig.currentPlayer.position, 
            labelsConfig.currentPlayer.alignment
            );
    }

    private drawMatchScores(): void {
        for(let i = 0 ; i < this._players.length ; i++){    
            for(let j = 0 ; j < this._players[i].matchScore ; j++){
                const scorePosition: Vector2 = Vector2.copy(matchScoreConfig.scoresPositions[i]).addToX(j * matchScoreConfig.unitMargin);
                const scoreSprite: HTMLImageElement = this._players[i].color === Color.red ? Assets.getSprite(sprites.paths.redScore) : Assets.getSprite(sprites.paths.yellowScore);
                Canvas2D.drawImage(scoreSprite, scorePosition);
            }
        }    
    }

    private drawOverallScores(): void {
        for(let i = 0 ; i < this._players.length ; i++){ 
            Canvas2D.drawText(
                this._players[i].overallScore.toString(), 
                labelsConfig.overalScores[i].font,
                labelsConfig.overalScores[i].color,
                labelsConfig.overalScores[i].position,
                labelsConfig.overalScores[i].alignment
                );   
        }
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

        const solidTextures: string[] = [
            ball1TextureUrl,
            ball2TextureUrl,
            ball3TextureUrl,
            ball4TextureUrl,
            ball5TextureUrl,
            ball6TextureUrl,
            ball7TextureUrl,
        ];

        const stripeTextures: string[] = [
            ball9TextureUrl,
            ball10TextureUrl,
            ball11TextureUrl,
            ball12TextureUrl,
            ball13TextureUrl,
            ball14TextureUrl,
            ball15TextureUrl,
        ];

        const redBalls: Ball[] = GameConfig.redBallsPositions
            .map((position: IVector2, index: number) => new Ball(Vector2.copy(position), Color.yellow, solidTextures[index % solidTextures.length]));

        const yellowBalls: Ball[] = GameConfig.yellowBallsPositions
            .map((position: IVector2, index: number) => new Ball(Vector2.copy(position), Color.red, stripeTextures[index % stripeTextures.length]));
        
        this._8Ball = new Ball(Vector2.copy(GameConfig.eightBallPosition), Color.black, ball8TextureUrl);

        this._cueBall = new Ball(Vector2.copy(GameConfig.cueBallPosition), Color.white, cueBallTextureUrl);

        this._stick = new Stick(Vector2.copy(GameConfig.cueBallPosition));

        this._balls = [
            ...redBalls, 
            ... yellowBalls, 
            this._8Ball,
            this._cueBall, 
        ];

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
        this._turnState.ballInHand = false;
        this._stick.show(this._cueBall.position);
    }

    public concludeTurn(): void {

        this._turnState.pocketedBalls.forEach((ball: Ball) => {
            const ballIndex: number = this._balls.indexOf(ball);
            if(ball.color != Color.white) {
                this._balls.splice(ballIndex, 1);
            }
        });
        
        if(this.currentPlayer.color) {
            this.currentPlayer.matchScore = 8 - this.getBallsByColor(this.currentPlayer.color).length - this.getBallsByColor(Color.black).length;
        }

        if(this.nextPlayer.color) {
            this.nextPlayer.matchScore = 8 - this.getBallsByColor(this.nextPlayer.color).length - this.getBallsByColor(Color.black).length;
        }

        this._turnState.isValid = this._referee.isValidTurn(this.currentPlayer, this._turnState);
    }

    public shootCueBall(power: number, rotation: number): void {
        if(power > 0) {
            this._stick.rotation = rotation;
            this._stick.shoot();
            this._cueBall.shoot(power, rotation);
            this._stick.movable = false;
            setTimeout(() => this._stick.hide(), GameConfig.timeoutToHideStickAfterShot);
        }
    }

    public update(): void {

        if(this.isBallInHand) {
            this.handleBallInHand();
            return;
        }

        this._balls.forEach((ball: Ball) => ball.update());
        this.handleCollisions();
        this.handleBallsInPockets();
        this.syncStickFromServer();
        this._stick.movable = this.isLocalPlayersTurn();
        // Keep stick anchored to cue ball position every frame
        if (this._stick.visible) {
            this._stick.position = this._cueBall.position;
        }
        this._stick.update();
        this.sendAimUpdate(performance.now());
        this.handleInput();

        // Apply pending authoritative server positions once all local balls have settled
        if (this._pendingServerBalls !== null && !this.isBallsMoving) {
            this.applyAuthoritativeBallsState(this._pendingServerBalls);
            this._lastAppliedShotSerial = this._pendingServerSerial;
            this._pendingServerBalls = null;
            this._pendingServerSerial = -1;
        }

        if(!this.isBallsMoving && !this._stick.visible) {
            this.concludeTurn();
            this.nextTurn();
        }
    }

    public draw(): void {
        Canvas2D.drawImage(Assets.getSprite(sprites.paths.table), Vector2.zero, 0, Vector2.zero, gameSize);
        this.drawCurrentPlayerLabel();
        this.drawMatchScores();
        this.drawOverallScores();
        this._balls.forEach((ball: Ball) => ball.draw());
        this.drawCueGuides();
        this._stick.draw();
    }
}