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
    private _rotationQuaternion: { x: number; y: number; z: number; w: number } = { x: 0, y: 0, z: 0, w: 1 }; // Ball orientation as quaternion
    private _previousVelocity: Vector2 = Vector2.zero;
    private static readonly _precisionFactor: number = 100_000_000;
    private _ballNumber: number = 0;

    private _lastPosition: Vector2 = Vector2.zero;

    //------Properties------//

    public get lastPosition(): Vector2 {
        return Vector2.copy(this._lastPosition);
    }
    public get position(): Vector2 {
        return Vector2.copy(this._position);
    }

    public set position(value: Vector2) {
        this._lastPosition = Vector2.copy(this._position);
        this._position = Ball.quantizeVector(value);
    }

    public get nextPosition(): Vector2 {
        this._lastPosition = Vector2.copy(this._position);
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

    public get ballNumber(): number {
        return this._ballNumber;
    }

    public get rotationQuaternion(): { x: number; y: number; z: number; w: number } {
        return { ...this._rotationQuaternion };
    }

    //------Constructor------//

    constructor(private _position: Vector2, color: Color, textureUrl?: string, ballNumber?: number) {
        this._color = color;
        this._ballNumber = ballNumber ?? 0;
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

        if (speed > 0.0001) {
            // Calculate distance traveled this frame
            const distance = speed;
            
            // Angular rotation for rolling without slipping: angle = distance / radius
            // Negate to get correct rolling direction
            const deltaRotation = -distance / safeRadius;
            
            // Calculate rotation axis perpendicular to velocity direction (in 3D: -vy, vx, 0)
            // For velocity (vx, vy), the ball rotates around axis (-vy, vx, 0) normalized
            const axisX = -this._velocity.y;
            const axisY = this._velocity.x;
            const axisZ = 0;
            const axisLength = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
            
            if (axisLength > 0.0001 && Math.abs(deltaRotation) > 0.0001) {
                // Normalize axis
                const ax = axisX / axisLength;
                const ay = axisY / axisLength;
                const az = axisZ / axisLength;
                
                // Create incremental rotation quaternion using axis-angle
                const halfAngle = deltaRotation / 2;
                const sinHalf = Math.sin(halfAngle);
                const cosHalf = Math.cos(halfAngle);
                
                const deltaQ = {
                    x: ax * sinHalf,
                    y: ay * sinHalf,
                    z: az * sinHalf,
                    w: cosHalf
                };
                
                // Multiply current quaternion by delta (q_new = delta * q_current)
                // This applies the new rotation to the existing orientation
                const qx = deltaQ.w * this._rotationQuaternion.x + deltaQ.x * this._rotationQuaternion.w + 
                           deltaQ.y * this._rotationQuaternion.z - deltaQ.z * this._rotationQuaternion.y;
                const qy = deltaQ.w * this._rotationQuaternion.y - deltaQ.x * this._rotationQuaternion.z + 
                           deltaQ.y * this._rotationQuaternion.w + deltaQ.z * this._rotationQuaternion.x;
                const qz = deltaQ.w * this._rotationQuaternion.z + deltaQ.x * this._rotationQuaternion.y - 
                           deltaQ.y * this._rotationQuaternion.x + deltaQ.z * this._rotationQuaternion.w;
                const qw = deltaQ.w * this._rotationQuaternion.w - deltaQ.x * this._rotationQuaternion.x - 
                           deltaQ.y * this._rotationQuaternion.y - deltaQ.z * this._rotationQuaternion.z;
                
                // Normalize to prevent drift
                const qLength = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
                if (qLength > 0.0001) {
                    this._rotationQuaternion.x = qx / qLength;
                    this._rotationQuaternion.y = qy / qLength;
                    this._rotationQuaternion.z = qz / qLength;
                    this._rotationQuaternion.w = qw / qLength;
                }
            }
        }
        
        this._previousVelocity = Vector2.copy(this._velocity);
    }

    private resetRotation(): void {
        this._rotationQuaternion = { x: 0, y: 0, z: 0, w: 1 };
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
        this.resetRotation();
        this._previousVelocity = Vector2.zero;
    }

    public hide(): void {
        this._velocity = Vector2.zero;
        this._moving = false;
        this._visible = false;
        this.resetRotation();
        this._previousVelocity = Vector2.zero;
    }

    /** Called externally (e.g. during shot playback) to advance spin without moving the ball. */
    public tickSpin(): void {
        if (this._velocity.length >= ballConfig.minVelocityLength) {
            this.updateSpin();
        }
    }

    public applyTangentialContactImpulse(contactTangent: Vector2, impulseMagnitude: number): void {
        void contactTangent;
        void impulseMagnitude;
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
        }
    }

    public draw(): void {
        if(this._visible){
            // Apply physics world Y offset to position table below HUD
            const drawPosition = new Vector2(this._position.x, this._position.y + GameConfig.physicsWorldYOffset);
            Canvas2D.drawTexturedSphere(
                this._sphereTexture,
                drawPosition,
                ballConfig.diameter / 2,
                this._rotationQuaternion,
                // Ball._shadowTexture || undefined,
                // Ball._lightTexture || undefined,
            );
            // Canvas2D.drawCircle(this._position, ballConfig.diameter / 2, 'rgba(255,255,255,0.45)', false, 1);
            // if (this._ballNumber > 0) {
            //     const fontSize = Math.max(8, Math.round(ballConfig.diameter * 0.48));
            //     Canvas2D.drawText(
            //         this._ballNumber.toString(),
            //         `bold ${fontSize}px Arial`,
            //         '#ffffff',
            //         { x: this._position.x, y: this._position.y + fontSize * 0.35 },
            //         'center',
            //         'alphabetic',
            //     );
            // }
        }
    }
}