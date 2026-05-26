import { IBallConfig, IPhysicsConfig, IAssetsConfig } from './../game.config.type';
import { GameConfig } from '../game.config';
import { Canvas2D } from '../canvas';
import { Assets } from '../assets';
import { Color } from '../common/color';
import { Vector2 } from '../geom/vector2';
import * as THREE from 'three';
import { lerp, type PhysicsDynamicBody } from '../pool-physics';

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
    private _rotationQuaternion: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1); // Ball orientation as quaternion
    private _previousVelocity: Vector2 = Vector2.zero;
    private _lastSpinUpdateMs: number = performance.now();
    private _ballNumber: number = 0;

    private _dynBody: PhysicsDynamicBody | null = null;
    public group: 'solid' | 'stripe' | null = null;

    private _lastPosition: Vector2 = Vector2.zero;
    private _lastRenderPosition: Vector2 = Vector2.zero;
    private _prevPhysicsPos: { x: number; y: number } = { x: 0, y: 0 };

    private _isCueMove: boolean = false;

    //------Properties------//

    public get lastPosition(): Vector2 {
        return Vector2.copy(this._lastPosition);
    }
    public get position(): Vector2 {
        if (this._dynBody) {
            return new Vector2(this._dynBody.center.x, this._dynBody.center.y);
        }
        return Vector2.copy(this._position);
    }

    public set position(value: Vector2) {
        this._lastPosition = Vector2.copy(this._position);
        this._position = value;
    }

    public get nextPosition(): Vector2 {
        this._lastPosition = Vector2.copy(this._position);
        return this.position.add(this._velocity.mult(1 - physicsConfig.friction));
    }

    public get velocity(): Vector2 {
        if (this._dynBody) {
            return new Vector2(this._dynBody.velocity.x, this._dynBody.velocity.y);
        }
        return Vector2.copy(this._velocity);
    }

    public set velocity(value: Vector2) {
        this._moving = value.length > 0;
        this._velocity = value;
    }

    public get moving(): boolean {
        if (this._dynBody) {
            return Math.hypot(this._dynBody.velocity.x, this._dynBody.velocity.y) >= ballConfig.minVelocityLength;
        }
        return this._moving;
    }

    public get color(): Color {
        return this._color;
    }

    public get visible(): boolean {
        if (this._isCueMove) return true; // ball is always visible while being placed
        if (this._dynBody) {
            return this._dynBody.enabled;
        }
        return this._visible;
    }

    public get ballNumber(): number {
        return this._ballNumber;
    }

    public get rotationQuaternion(): THREE.Quaternion {
        return this._rotationQuaternion.clone();
    }
    
    public get dynBody(): PhysicsDynamicBody | null {
        return this._dynBody;
    }

    //------Constructor------//

    constructor(private _position: Vector2, color: Color, textureUrl?: string, ballNumber?: number) {
        this._color = color;
        this._ballNumber = ballNumber ?? 0;
        this._sphereTexture = this.resolveSphereTexture(color, textureUrl);
        this._lastPosition = Vector2.copy(this._position);
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

    private updateSpin(): void {
        const nowMs = performance.now();
        const deltaSeconds = Math.max(0, Math.min(0.05, (nowMs - this._lastSpinUpdateMs) / 500));
        this._lastSpinUpdateMs = nowMs;

        if (deltaSeconds <= 0) {
            return;
        }

        const velocity = this._dynBody
            ? new Vector2(this._dynBody.velocity.x, this._dynBody.velocity.y)
            : this._velocity;
        const speed = velocity.length;
        if (speed <= 0.00001) {
            return;
        }

        const radius = Math.max(ballConfig.diameter / 2, 1);
        // Rolling without slipping in THREE.js world (Y-up) with canvas-space velocity (Y-down):
        //   v_world = (vx_c, -vy_c, 0),  r_contact = (0, 0, -r)
        //   ω × r_contact = -v_world  →  ωx = vy_c/r,  ωy = vx_c/r
        // So the rotation axis is (vy_canvas, vx_canvas, 0)/|v| — NOT the cross product.
        const rotationAxis = new THREE.Vector3(velocity.y / speed, velocity.x / speed, 0);

        // Rolling without slipping: angular speed = linear speed / radius.
        const angle = (speed * deltaSeconds) / radius;
        const deltaQuaternion = new THREE.Quaternion();
        deltaQuaternion.setFromAxisAngle(rotationAxis, angle);
        this._rotationQuaternion.multiplyQuaternions(deltaQuaternion, this._rotationQuaternion);

        this._previousVelocity = Vector2.copy(velocity);
    }

    private resetRotation(): void {
        this._rotationQuaternion.identity();// = { x: 0, y: 0, z: 0, w: 1 };
    }

    /**
     * Link this render ball to a physics body during simulation.
     * Pass null to hide the ball (e.g. it was already pocketed before this shot).
     */
    public linkBody(body: PhysicsDynamicBody | null): void {
        if (body) {
            this._dynBody = body;
            this._visible = true;
            this._lastPosition = new Vector2(body.center.x, body.center.y);
            this._prevPhysicsPos.x = body.center.x;
            this._prevPhysicsPos.y = body.center.y;
        } else {
            this._dynBody = null;
            this._visible = false;
        }
    }

    /** Snapshot current physics position as the interpolation baseline. Call once per fixed physics step, before stepping. */
    public snapshotPhysicsPosition(): void {
        if (this._dynBody && this._dynBody.enabled) {
            this._prevPhysicsPos.x = this._dynBody.center.x;
            this._prevPhysicsPos.y = this._dynBody.center.y;
        }
    }

    //------Public Methods------//

    public shoot(power: number, angle: number): void {
        this._velocity = new Vector2(power * Math.cos(angle), power * Math.sin(angle));
        this._previousVelocity = Vector2.copy(this._velocity);
        this._moving = true;
    }

    public show(position: Vector2): void {
        this._position = position;
        this._lastPosition = Vector2.copy(position);
        this._lastSpinUpdateMs = performance.now();
        this._velocity = Vector2.zero;
        this._visible = true;
        this.resetRotation();
        this._previousVelocity = Vector2.zero;

        if (this._dynBody) {
            this._dynBody.enabled = true;
            this._dynBody.body.setEnabled(true);
            this._dynBody.collider.setEnabled(true);
            this._dynBody.body.setTranslation({ x: position.x, y: position.y }, true);
            this._dynBody.body.setLinvel({ x: 0, y: 0 }, true);
            this._dynBody.center.x = position.x;
            this._dynBody.center.y = position.y;
            // Sync the interpolation baseline so that lerp(prev, center, alpha) returns
            // exactly `position` at any alpha value — prevents jumping when show() is
            // called outside active simulation (e.g. remote observer cue-move updates).
            this._prevPhysicsPos.x = position.x;
            this._prevPhysicsPos.y = position.y;
            this._dynBody.velocity.x = 0;
            this._dynBody.velocity.y = 0;
            this._dynBody.velMag = 0;
        }
        this._isCueMove = false;
    }

    public cueMove(position: Vector2): void {
        this._isCueMove = true;
        this._position = position;
        this._lastPosition = Vector2.copy(position);
        // Keep the body cache in sync so that once _isCueMove is cleared (on cuePlace),
        // the physics lerp anchors are already at the placed position and the ball stays
        // put instead of snapping back to the physics-end position.
        if (this._dynBody) {
            this._dynBody.center.x = position.x;
            this._dynBody.center.y = position.y;
            this._prevPhysicsPos.x = position.x;
            this._prevPhysicsPos.y = position.y;
        }
    }

    public cuePlace(position: Vector2): void {
        this._isCueMove = false;
        // this._position = position;
        // this._lastPosition = Vector2.copy(position);
    }

    public hide(): void {
        this._lastSpinUpdateMs = performance.now();
        this._velocity = Vector2.zero;
        this._moving = false;
        this._visible = false;
        this.resetRotation();
        this._previousVelocity = Vector2.zero;

        if (this._dynBody) {
            this._dynBody.enabled = false;
            this._dynBody.body.setLinvel({ x: 0, y: 0 }, true);
            this._dynBody.body.setEnabled(false);
            this._dynBody.collider.setEnabled(false);
            this._dynBody.center.x = 9999;
            this._dynBody.center.y = 9999;
            this._dynBody.velocity.x = 0;
            this._dynBody.velocity.y = 0;
            this._dynBody.velMag = 0;
        }
    }

    /** Called externally (e.g. during shot playback) to advance spin without moving the ball. */
    public tickSpin(): void {
        const sourceVelocity = this._dynBody
            ? new Vector2(this._dynBody.velocity.x, this._dynBody.velocity.y)
            : this._velocity;
        if (sourceVelocity.length >= ballConfig.minVelocityLength) {
            // this.updateSpin();
        }
    }

    public applyTangentialContactImpulse(contactTangent: Vector2, impulseMagnitude: number): void {
        void contactTangent;
        void impulseMagnitude;
    }

    public update(): void {
        if (this._dynBody) return; // position & velocity driven by simulation body; spin updated in draw()
        if(this._moving) {
            this._velocity = this._velocity.mult(1 - physicsConfig.friction);
            this._position = this._position.add(this._velocity);
            // this.updateSpin();

            if(this._velocity.length < ballConfig.minVelocityLength) {
                this.velocity = Vector2.zero;
                this._moving = false;
            }
        }
    }

    public draw(alpha: number = 1): void {
        if (!this.visible) return;
        let px: number;
        let py: number;
        if (this._dynBody && !this._isCueMove) {
            // Interpolate between the position at the start of the last physics step (prev)
            // and the position at the end of it (curr), using alpha = accumulator / fixedStepMs.
            // This keeps rendering smooth at any display refresh rate regardless of physics FPS.
            // Skip this path during cue-move: alpha oscillates 0→1 each physics step, which
            // would cause the ball to jump between _prevPhysicsPos and _dynBody.center.
            px = lerp(this._prevPhysicsPos.x, this._dynBody.center.x, alpha);
            py = lerp(this._prevPhysicsPos.y, this._dynBody.center.y, alpha);
            this.updateSpin();
        } else {
            // Non-physics path: smooth visual follow toward _position.
            // Used during cue-move (mouse placement) and when no physics body is linked.
            const lerpFactor = 0.25;
            px = lerp(this._lastRenderPosition.x, this._position.x, lerpFactor);
            py = lerp(this._lastRenderPosition.y, this._position.y, lerpFactor);
        }
        this._lastRenderPosition.x = px;
        this._lastRenderPosition.y = py;
        Canvas2D.drawTexturedSphere(
            this._sphereTexture,
            new Vector2(px, py + GameConfig.physicsWorldYOffset),
            ballConfig.diameter / 2,
            this._rotationQuaternion,
            Ball._shadowTexture || undefined,
            Ball._lightTexture || undefined,
        );
    }
}