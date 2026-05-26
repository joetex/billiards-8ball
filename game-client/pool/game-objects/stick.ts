import { IStickConfig, IInputConfig } from './../game.config.type';
import { Mouse } from '../input/mouse';
import { GameConfig } from '../game.config';
import { Assets } from '../assets';
import { Canvas2D } from '../canvas';
import { Vector2 } from '../geom/vector2';
import { mapRange } from '../common/helper';
import { IAssetsConfig } from '../game.config.type';
import { ACOSClient } from '@acosgames/framework';
import { decodePowerFromUint, encodeAngleToUint, encodePowerToUint } from '../pool-physics';
import { lerpAngle } from '../pool-physics';
import { lerp } from '../pool-physics';

//------Configurations------//

const inputConfig: IInputConfig = GameConfig.input;
const stickConfig: IStickConfig = GameConfig.stick;
const sprites: IAssetsConfig = GameConfig.sprites;
const sounds: IAssetsConfig = GameConfig.sounds;
const FULL_PULL_PIXELS = 96; // ~1 inch at 96 DPI
const MIN_METER_SCALE = 0.1;

export class Stick {

    //------Members------//

    private _sprite: HTMLImageElement = Assets.getSprite(sprites.paths.stick);
    private _rotation: number = 0;
    private _lastStickRotation: number = 0;
    private _origin: Vector2 = Vector2.copy(stickConfig.origin);
    private _power: number = 0;
    private _movable: boolean = true;
    private _visible: boolean = true;
    private _aimLocked: boolean = false;
    private _dragAnchor: number = 0;
    private _queuedShot: { power: number; rotation: number } | null = null;

    private _lastSentAngle: number | null = null;
    private _lastSentPower: number | null = null;
    private _lastAimSentAtMs: number = 0;
    //------Properties------//

    public get position(): Vector2 {
        return Vector2.copy(this._position);
    }

    public get rotation(): number {
        return this._rotation;
    }

    public get power(): number {
        return this._power;
    }

    public get aiming(): boolean {
        return this._aimLocked;
    }

    public set movable(value: boolean) {
        this._movable = value;
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    public get lastStickRotation(): number {
        return this._lastStickRotation;
    }

    public set rotation(value: number) {
        this._lastStickRotation = this._rotation;
        this._rotation = value;
    }

    public set position(value: Vector2) {
        this._position = value;
    }

    //------Constructor------//

    constructor(private _position: Vector2) { }

    //------Private Methods------//

    private get pullDirection(): Vector2 {
        return new Vector2(-Math.cos(this._rotation), -Math.sin(this._rotation));
    }

    private projectMouseOnPullAxis(): number {
        const toMouse = Mouse.position.subtract(this._position);
        return toMouse.dot(this.pullDirection);
    }

    private updateVisualPowerState(): void {
        const maxOffset = stickConfig.maxPower * stickConfig.movementPerFrame;
        const offset = mapRange(this._power, 0, stickConfig.maxPower, 0, maxOffset);
        this._origin = Vector2.copy(stickConfig.origin).addX(offset);

    }

    private updatePowerFromDrag(): void {
        const pullDistance = Math.max(0, this.projectMouseOnPullAxis() - this._dragAnchor);
        if (pullDistance <= 0) {
            this._power = 0;
            this.updateVisualPowerState();
            return;
        }

        const normalizedPull = Math.min(1, pullDistance / FULL_PULL_PIXELS);
        const meterScale = MIN_METER_SCALE + normalizedPull * (1 - MIN_METER_SCALE);
        this._power = stickConfig.maxPower * meterScale;
        this.updateVisualPowerState();
    }

    private queueShotIfAny(): void {
        if (this._power > 0) {
            this._queuedShot = { power: this._power, rotation: this._rotation };
        }
        // this._aimLocked = false;
        this._power = 0;
        this._origin = Vector2.copy(stickConfig.origin);
    }



    private updateRotation(): void {
        const opposite: number = Mouse.position.y - this._position.y;
        const adjacent: number = Mouse.position.x - this._position.x;
        let targetRotation = Math.atan2(opposite, adjacent);
        // Lerp stick rotation toward the server-provided target each frame
        this._rotation = lerpAngle(this._rotation, targetRotation, 0.5);
    }

    private handleAimInput(): boolean {
        if (Mouse.isDown(inputConfig.mouseShootButton) && !this._aimLocked) {
            this._aimLocked = true;
            this._dragAnchor = this.projectMouseOnPullAxis();
            this._power = 0;
            this._origin = Vector2.copy(stickConfig.origin);
            return false;
        }

        if (!this._aimLocked) {
            return false;
        }

        if (Mouse.isDown(inputConfig.mouseShootButton)) {
            this.updatePowerFromDrag();
            return false;
        }

        // Finalize as soon as the button is up. This avoids getting stuck if isReleased
        // is missed between fixed-timestep updates.
        const shotAngleUint = encodeAngleToUint(this._rotation);
        const shotPowerUint = encodePowerToUint(this._power);
        const shotPower = decodePowerFromUint(shotPowerUint);

        this._aimLocked = false;
        this._dragAnchor = 0;

        if (shotPower <= 0) {
            // Zero pull cancels the shot and returns immediately to free-aim mode.
            this._power = 0;
            this._origin = Vector2.copy(stickConfig.origin);
            return false;
        }

        this._queuedShot = { rotation: this._rotation, power: shotPower };
        this.shoot();
        ACOSClient.send('shoot', { angle: shotAngleUint, power: shotPowerUint });

        setTimeout(() => this.hide(), GameConfig.timeoutToHideStickAfterShot);
        return true;
    }

    private drawPowerMeter(): void {
        if (!this._aimLocked) return;

        const meterPos = new Vector2(36, GameConfig.gameSize.y - 42);
        const meterSize = new Vector2(220, 18);
        const fillSize = new Vector2(meterSize.x * (this._power / stickConfig.maxPower), meterSize.y);

        Canvas2D.drawRect(meterPos, meterSize, 'rgba(0, 0, 0, 0.45)', true);
        Canvas2D.drawRect(meterPos, meterSize, '#f5f5f5', false, 2);
        Canvas2D.drawRect(meterPos, fillSize, '#ffffff', true);
    }

    //------Public Methods------//

    public serverUpdate(angle: number, power: number): boolean {
        // this._rotation = angle;
        this._power = lerp(this._power, power, 0.1);

        // Lerp stick rotation toward the server-provided target each frame.
        // Factor 0.3 → convergence in ~0.25 s at 60 fps ((1-0.3)^15 ≈ 0.005).
        this._rotation = lerpAngle(this._rotation, angle, 0.3);

        this.updateVisualPowerState();

        return true;
    }

    public hide(): void {
        this._power = 0;
        this._visible = false;
        this._movable = false;
        this._aimLocked = false;
        this._queuedShot = null;
        this._origin = Vector2.copy(stickConfig.origin);
    }

    public show(position: Vector2): void {
        this._position = position;
        this._origin = Vector2.copy(stickConfig.origin);
        this._movable = true;
        this._visible = true;
        this._aimLocked = false;
        this._queuedShot = null;
        this._power = 0;
    }

    public shoot(): void {
        this._origin = Vector2.copy(stickConfig.shotOrigin);
        const volume: number = mapRange(this._power, 0, stickConfig.maxPower, 0, 1);
        Assets.playSound(sounds.paths.strike, volume);
    }

    public consumeQueuedShot(): { power: number; rotation: number } | null {
        const shot = this._queuedShot;
        this._queuedShot = null;
        return shot;
    }

    public clientUpdate(): boolean {
        if (this._movable) {
            if (!this._aimLocked) {
                this.updateRotation();
                // return;
            }

            if (this.handleAimInput()) {
                return true;
            }

            const currentAngleUint = encodeAngleToUint(this._rotation);
                const currentPowerUint = encodePowerToUint(this._power);
                // Skip if both quantized values are unchanged since the last send.
                if (this._lastSentAngle === currentAngleUint && this._lastSentPower === currentPowerUint) {
                    return false;
                }

                const nowMs = performance.now();
                // Throttle to at most once per 2 s (bypass on first send when _lastSentAngle is null).
                if (this._lastSentAngle !== null && nowMs - this._lastAimSentAtMs < 2000) {
                    return false;
                }

                this._lastAimSentAtMs = nowMs;
                this._lastSentAngle = currentAngleUint;
                this._lastSentPower = currentPowerUint;
                ACOSClient.send('aim', { angle: currentAngleUint, power: currentPowerUint });
        }
        return false;
    }

    public draw(): void {
        if (this._visible) {
            // Apply physics world Y offset to position stick below HUD
            const drawPosition = new Vector2(this._position.x, this._position.y + GameConfig.physicsWorldYOffset);
            Canvas2D.drawImage(this._sprite, drawPosition, this._rotation, this._origin);
            this.drawPowerMeter();
        }
    }

}