import { IBallConfig, IPhysicsConfig, IAssetsConfig } from './../game.config.type';
import { GameConfig } from '../game.config';
import { Canvas2D } from '../canvas';
import { Assets } from '../assets';
import { Color } from '../common/color';
import { Vector2 } from '../geom/vector2';

const cueBallTextureUrl = 'assets/balls/ball.cue.webp';
const pool1TextureUrl = 'assets/balls/ball.pool1.webp';
const pool8TextureUrl = 'assets/balls/ball.pool8.webp';
const pool9TextureUrl = 'assets/balls/ball.pool9.webp';
const sphereShadowUrl = 'assets/balls/effect.shadow.webp';
const sphereLightUrl = 'assets/balls/effect.light.webp';

const physicsConfig: IPhysicsConfig = GameConfig.physics;
const sprites: IAssetsConfig = GameConfig.sprites;
const ballConfig: IBallConfig = GameConfig.ball;

export class Ball {

    //------Members------//

    private static _textureCache: Map<string, HTMLImageElement> = new Map();
    private static _shadowTexture: HTMLImageElement | null = null;
    private static _lightTexture: HTMLImageElement | null = null;

    private _sphereTexture: HTMLImageElement;
    private _color: Color;
    private _velocity: Vector2 = Vector2.zero;
    private _moving: boolean = false;
    private _visible: boolean = true;
    private _spinRoll: number = 0;
    private _spinVelocity = { x: 0, y: 0, z: 0 };
    private _surfaceOffset: Vector2 = Vector2.zero;
    private _previousVelocity: Vector2 = Vector2.zero;
    private static readonly _precisionFactor: number = 1_000_000;


    //------Properties------//

    public get position(): Vector2 {
        return Vector2.copy(this._position);
    }

    public set position(value: Vector2) {
        this._position = Ball.quantizeVector(value);
    }

    public get nextPosition(): Vector2 {
        return this.position.add(this._velocity.mult(1 - physicsConfig.friction));
    }

    public get velocity(): Vector2 {
        return Vector2.copy(this._velocity);
    }

    public set velocity(value: Vector2) {
        const quantized = Ball.quantizeVector(value);
        this._moving = quantized.length > 0 ? true : false;
        this._velocity = quantized;
    }

    public get moving(): boolean {
        return this._moving;
    }

    public get color(): Color {
        return this._color;
    }

    public get visible(): boolean {
        return this._visible;
    }

    //------Constructor------//

    constructor(private _position: Vector2, color: Color, textureUrl?: string) {
        this._color = color;
        this._sphereTexture = this.resolveSphereTexture(color, textureUrl);
        if (!Ball._shadowTexture) {
            Ball._shadowTexture = Ball.getCachedTexture(sphereShadowUrl);
        }
        if (!Ball._lightTexture) {
            Ball._lightTexture = Ball.getCachedTexture(sphereLightUrl);
        }
    }

    //------Private Methods------//

    private static getCachedTexture(url: string): HTMLImageElement {
        // Prefer preloaded image from Assets
        const preloaded = Assets.getSprite(url);
        if (preloaded) return preloaded;

        // Fallback: load on demand (should not happen if preloadTextures was called)
        const cached = Ball._textureCache.get(url);
        if (cached) return cached;

        const texture = new Image();
        texture.onerror = () => console.error('[Ball] Failed to load texture:', url);
        texture.src = url;
        Ball._textureCache.set(url, texture);
        return texture;
    }

    private resolveSphereTexture(color: Color, textureUrl?: string): HTMLImageElement {
        if (textureUrl) {
            return Ball.getCachedTexture(textureUrl);
        }

        switch(color) {
            case Color.white:
                return Ball.getCachedTexture(cueBallTextureUrl);
            case Color.black:
                return Ball.getCachedTexture(pool8TextureUrl);
            case Color.red:
                return Ball.getCachedTexture(pool1TextureUrl);
            case Color.yellow:
            default:
                return Ball.getCachedTexture(pool9TextureUrl);
        }
    }

    private static wrapOffset(value: number, period: number): number {
        if (period <= 0) {
            return 0;
        }
        const mod = value % period;
        return mod < 0 ? mod + period : mod;
    }

    private static quantize(value: number): number {
        return Math.round(value * Ball._precisionFactor) / Ball._precisionFactor;
    }

    private static quantizeVector(value: Vector2): Vector2 {
        return new Vector2(Ball.quantize(value.x), Ball.quantize(value.y));
    }

    private updateSpin(): void {
        const radius = ballConfig.diameter / 2;
        const safeRadius = Math.max(radius, 1);
        const speed = this._velocity.length;

        // Rolling on a table: omega = n x v / r (n points out of table)
        const targetOmegaX = -this._velocity.y / safeRadius;
        const targetOmegaY = this._velocity.x / safeRadius;

        const prevSpeed = this._previousVelocity.length;
        let targetOmegaZ = 0;
        if (speed > 0.0001 && prevSpeed > 0.0001) {
            const signedTurn = (this._previousVelocity.x * this._velocity.y - this._previousVelocity.y * this._velocity.x) / (prevSpeed * speed);
            targetOmegaZ = signedTurn * (speed / safeRadius) * 0.65;
        }

        const followVelocity = 0.2;
        const followTurn = 0.16;
        this._spinVelocity.x = this._spinVelocity.x * (1 - followVelocity) + targetOmegaX * followVelocity;
        this._spinVelocity.y = this._spinVelocity.y * (1 - followVelocity) + targetOmegaY * followVelocity;
        this._spinVelocity.z = this._spinVelocity.z * (1 - followTurn) + targetOmegaZ * followTurn;

        const angularDamping = 1 - Math.min(0.35, physicsConfig.friction * 8);
        this._spinVelocity.x *= angularDamping;
        this._spinVelocity.y *= angularDamping;
        this._spinVelocity.z *= angularDamping;

        const textureDriftScale = radius * 0.48;
        // Visual mapping from angular axes to UV drift. The minus sign keeps rolling direction intuitive.
        const offsetDelta = new Vector2(-this._spinVelocity.y * textureDriftScale, this._spinVelocity.x * textureDriftScale);
        this._surfaceOffset.addTo(offsetDelta);

        const period = radius * 2;
        this._surfaceOffset = new Vector2(
            Ball.wrapOffset(this._surfaceOffset.x, period),
            Ball.wrapOffset(this._surfaceOffset.y, period),
        );

        this._spinRoll = Ball.quantize(this._spinRoll + this._spinVelocity.z * 0.26);
        this._previousVelocity = Vector2.copy(this._velocity);
    }

    //------Public Methods------//

    public shoot(power: number, angle: number): void {
        this._velocity = Ball.quantizeVector(new Vector2(power * Math.cos(angle), power * Math.sin(angle)));
        this._previousVelocity = Vector2.copy(this._velocity);
        this._moving = true;
    }

    public show(position: Vector2): void {
        this._position = position;
        this._velocity = Vector2.zero;
        this._visible = true;
        this._spinVelocity = { x: 0, y: 0, z: 0 };
        this._surfaceOffset = Vector2.zero;
        this._spinRoll = 0;
        this._previousVelocity = Vector2.zero;
    }

    public hide(): void {
        this._velocity = Vector2.zero;
        this._moving = false;
        this._visible = false;
        this._spinVelocity = { x: 0, y: 0, z: 0 };
        this._surfaceOffset = Vector2.zero;
        this._previousVelocity = Vector2.zero;
    }

    public update(): void {
        if(this._moving) {
            this._velocity = Ball.quantizeVector(this._velocity.mult(1 - physicsConfig.friction));
            this._position = Ball.quantizeVector(this._position.add(this._velocity));
            this.updateSpin();

            if(this._velocity.length < ballConfig.minVelocityLength) {
                this.velocity = Vector2.zero;
                this._moving = false;
            }
        } else {
            const spinMagnitude = Math.abs(this._spinVelocity.x) + Math.abs(this._spinVelocity.y) + Math.abs(this._spinVelocity.z);
            if (spinMagnitude > 0.001) {
                const idleSpinDecay = 1 - Math.min(0.03, physicsConfig.friction * 2.2);
                const idleRollDecay = 1 - Math.min(0.022, physicsConfig.friction * 1.8);
                this._spinVelocity.x *= idleSpinDecay;
                this._spinVelocity.y *= idleSpinDecay;
                this._spinVelocity.z *= idleRollDecay;

                const radius = ballConfig.diameter / 2;
                const period = radius * 2;
                const textureDriftScale = radius * 0.32;
                this._surfaceOffset.addTo(new Vector2(-this._spinVelocity.y * textureDriftScale, this._spinVelocity.x * textureDriftScale));
                this._surfaceOffset = new Vector2(
                    Ball.wrapOffset(this._surfaceOffset.x, period),
                    Ball.wrapOffset(this._surfaceOffset.y, period),
                );
                this._spinRoll = Ball.quantize(this._spinRoll + this._spinVelocity.z * 0.2);
            }
        }
    }

    public draw(): void {
        if(this._visible){
            Canvas2D.drawTexturedSphere(
                this._sphereTexture,
                this._position,
                ballConfig.diameter / 2,
                this._spinRoll,
                this._surfaceOffset,
                // Ball._shadowTexture || undefined,
                // Ball._lightTexture || undefined,
            );
            Canvas2D.drawCircle(this._position, ballConfig.diameter / 2, 'rgba(255,255,255,0.45)', false, 1);
        }
    }
}