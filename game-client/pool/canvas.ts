import { IVector2 } from './game.config.type';
import { GameConfig } from './game.config';
import { Vector2 } from './geom/vector2';
import * as THREE from 'three';

class Canvas2D_Singleton {

    //------Members------//

    private _canvasContainer: HTMLElement;
    private _canvas : HTMLCanvasElement;
    private _renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.OrthographicCamera;
    private _staticLight: THREE.AmbientLight;
    private _directionalLight: THREE.DirectionalLight;
    private _unitPlane: THREE.PlaneGeometry;
    private _textureCache: Map<string, THREE.Texture> = new Map();
    private _frameObjects: THREE.Object3D[] = [];
    private _frameMaterials: THREE.Material[] = [];
    private _frameGeometries: THREE.BufferGeometry[] = [];
    private _frameTextures: THREE.Texture[] = [];
    private _renderOrderCounter: number = 0;
    private _loadingOverlay: HTMLElement | null = null;
    private _scale!: Vector2;
    private _offset!: Vector2;

    //------Properties------//
    
    public get scaleX() {
        return this._scale.x;
    }

    public get scaleY() {
        return this._scale.y;
    }

    public get offsetX() {
        return this._offset.x;
    }

    public get offsetY() {
        return this._offset.y;
    }

    //------Constructor------//

    constructor(canvas : HTMLCanvasElement, canvasContainer: HTMLElement) {
        this._canvasContainer = canvasContainer;
        this._canvas = canvas;
        this._scene = new THREE.Scene();
        this._camera = new THREE.OrthographicCamera(
            -GameConfig.gameSize.x / 2,
            GameConfig.gameSize.x / 2,
            GameConfig.gameSize.y / 2,
            -GameConfig.gameSize.y / 2,
            -200,
            200,
        );
        this._camera.position.z = 100;

        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true, alpha: true });
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this._renderer.autoClear = true;

        this._unitPlane = new THREE.PlaneGeometry(1, 1);
        this._staticLight = new THREE.AmbientLight(0xffffff, 1.0);
        this._directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        this._directionalLight.position.set(-0.35, 0.65, 1.0);
        this._scene.add(this._staticLight);
        this._scene.add(this._directionalLight);

        this.resizeCanvas();
    }

    //------Public Methods------//

    private toWorldX(x: number): number {
        return x - GameConfig.gameSize.x / 2;
    }

    private toWorldY(y: number): number {
        return GameConfig.gameSize.y / 2 - y;
    }

    private parseColor(colorString: string): { color: string; opacity: number } {
        // Parse rgba(r, g, b, a) and extract alpha component
        const rgbaMatch = colorString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
        if (rgbaMatch) {
            const r = rgbaMatch[1];
            const g = rgbaMatch[2];
            const b = rgbaMatch[3];
            const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1.0;
            return { color: `rgb(${r}, ${g}, ${b})`, opacity: a };
        }
        // Return as-is for hex colors or named colors
        return { color: colorString, opacity: 1.0 };
    }

    private registerFrameObject(object: THREE.Object3D): void {
        object.renderOrder = this._renderOrderCounter++;
        this._scene.add(object);
        this._frameObjects.push(object);
    }

    private getTextureForImage(sprite: HTMLImageElement): THREE.Texture | null {
        if (!sprite || !sprite.complete || sprite.naturalWidth === 0) {
            return null;
        }

        const key = sprite.currentSrc || sprite.src;
        if (key && this._textureCache.has(key)) {
            return this._textureCache.get(key)!;
        }

        const texture = new THREE.Texture(sprite);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        if (key) {
            this._textureCache.set(key, texture);
        }

        return texture;
    }

    private registerFrameMaterial(material: THREE.Material): void {
        this._frameMaterials.push(material);
    }

    private registerFrameGeometry(geometry: THREE.BufferGeometry): void {
        this._frameGeometries.push(geometry);
    }

    private registerFrameTexture(texture: THREE.Texture): void {
        this._frameTextures.push(texture);
    }

    public resizeCanvas(): void {
        const originalCanvasWidth = GameConfig.gameSize.x;
        const originalCanvasHeight = GameConfig.gameSize.y;
        const targetRatio = originalCanvasWidth / originalCanvasHeight;

        const hostRect = this._canvasContainer.parentElement?.getBoundingClientRect();
        const fallbackWidth = document.documentElement.clientWidth;
        const fallbackHeight = document.documentElement.clientHeight;
        const hostWidth = Math.max(1, Math.floor(hostRect?.width ?? fallbackWidth));
        const hostHeight = Math.max(1, Math.floor(hostRect?.height ?? fallbackHeight));
        const hostRatio = hostWidth / hostHeight;

        let newWidth: number;
        let newHeight: number;
        if (hostRatio > targetRatio) {
            newHeight = hostHeight;
            newWidth = Math.floor(hostHeight * targetRatio);
        } else {
            newWidth = hostWidth;
            newHeight = Math.floor(hostWidth / targetRatio);
        }
        
        this._canvasContainer.style.width = newWidth + 'px';
        this._canvasContainer.style.height = newHeight + 'px';
        this._scale = new Vector2(newWidth / originalCanvasWidth, newHeight / originalCanvasHeight);

        this._renderer.setSize(newWidth, newHeight, false);
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const rect = this._canvas.getBoundingClientRect();
        this._offset = new Vector2(rect.left + window.scrollX, rect.top + window.scrollY);
    }


    public clear() : void {
        for (let i = 0; i < this._frameObjects.length; i++) {
            this._scene.remove(this._frameObjects[i]);
        }
        this._frameObjects = [];

        for (let i = 0; i < this._frameMaterials.length; i++) {
            this._frameMaterials[i].dispose();
        }
        this._frameMaterials = [];

        for (let i = 0; i < this._frameGeometries.length; i++) {
            this._frameGeometries[i].dispose();
        }
        this._frameGeometries = [];

        for (let i = 0; i < this._frameTextures.length; i++) {
            this._frameTextures[i].dispose();
        }
        this._frameTextures = [];

        this._renderOrderCounter = 0;
    }

    public drawImage(
            sprite: HTMLImageElement,
            position: IVector2 = { x: 0, y: 0 }, 
            rotation: number = 0, 
            origin: IVector2 = { x: 0, y: 0 },
            size?: IVector2
        ) {
        const texture = this.getTextureForImage(sprite);
        if (!texture) {
            return;
        }

        const drawWidth = size ? size.x : sprite.width;
        const drawHeight = size ? size.y : sprite.height;

        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
        const mesh = new THREE.Mesh(this._unitPlane, material);
        mesh.scale.set(drawWidth, drawHeight, 1);

        // Keep parity with Canvas2D transform order:
        // translate(position) -> rotate(rotation) -> drawImage at (-origin.x, -origin.y).
        // This makes the configured origin the orbit/pivot point.
        const localCenterOffsetX = drawWidth / 2 - origin.x;
        const localCenterOffsetY = drawHeight / 2 - origin.y;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotatedOffsetX = localCenterOffsetX * cos - localCenterOffsetY * sin;
        const rotatedOffsetY = localCenterOffsetX * sin + localCenterOffsetY * cos;

        const centerX = position.x + rotatedOffsetX;
        const centerY = position.y + rotatedOffsetY;
        mesh.position.set(this.toWorldX(centerX), this.toWorldY(centerY), 0);
        mesh.rotation.z = -rotation;

        this.registerFrameMaterial(material);
        this.registerFrameObject(mesh);
    }


    public drawText(text: string, font:string, color: string, position: IVector2, textAlign: string = 'left', textBaseline: string = 'alphabetic'): void {
        if (!text) {
            return;
        }

        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.font = font;
        const measuredWidth = Math.max(1, Math.ceil(ctx.measureText(text).width) + 8);
        const fontSizeMatch = font.match(/(\d+)px/);
        const fontSize = fontSizeMatch ? Math.max(8, Number(fontSizeMatch[1])) : 18;
        const measuredHeight = Math.ceil(fontSize * 1.5);

        textCanvas.width = measuredWidth;
        textCanvas.height = measuredHeight;

        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign as CanvasTextAlign;
        ctx.textBaseline = textBaseline as CanvasTextBaseline;

        let anchorX = 0;
        if (textAlign === 'center') {
            anchorX = measuredWidth / 2;
        } else if (textAlign === 'right' || textAlign === 'end') {
            anchorX = measuredWidth;
        }

        let anchorY = measuredHeight;
        if (textBaseline === 'top' || textBaseline === 'hanging') {
            anchorY = 0;
        } else if (textBaseline === 'middle') {
            anchorY = measuredHeight / 2;
        } else if (textBaseline === 'alphabetic') {
            anchorY = Math.round(measuredHeight * 0.8);
        }

        ctx.fillText(text, anchorX, anchorY);

        const texture = new THREE.CanvasTexture(textCanvas);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
        const mesh = new THREE.Mesh(this._unitPlane, material);
        mesh.scale.set(measuredWidth, measuredHeight, 1);

        const centerX = position.x + (measuredWidth / 2 - anchorX);
        const centerY = position.y + (measuredHeight / 2 - anchorY);
        mesh.position.set(this.toWorldX(centerX), this.toWorldY(centerY), 0);

        this.registerFrameTexture(texture);
        this.registerFrameMaterial(material);
        this.registerFrameObject(mesh);
    }

    public drawLine(start: IVector2, end: IVector2, color: string, width: number = 1): void {
        const points = [
            new THREE.Vector3(this.toWorldX(start.x), this.toWorldY(start.y), 0),
            new THREE.Vector3(this.toWorldX(end.x), this.toWorldY(end.y), 0),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color, linewidth: width, transparent: true, depthTest: false, depthWrite: false });
        const line = new THREE.Line(geometry, material);

        this.registerFrameGeometry(geometry);
        this.registerFrameMaterial(material);
        this.registerFrameObject(line);
    }

    public drawCircle(position: IVector2, radius: number, color: string, filled: boolean = false, width: number = 1): void {
        const worldX = this.toWorldX(position.x);
        const worldY = this.toWorldY(position.y);

        if (filled) {
            const geometry = new THREE.CircleGeometry(radius, 32);
            const { color: baseColor, opacity } = this.parseColor(color);
            const material = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity, depthTest: false, depthWrite: false });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(worldX, worldY, 0);

            this.registerFrameGeometry(geometry);
            this.registerFrameMaterial(material);
            this.registerFrameObject(mesh);
        } else {
            const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
            const points2D = curve.getPoints(40);
            const points3D = points2D.map((p) => new THREE.Vector3(p.x, p.y, 0));
            const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
            const material = new THREE.LineBasicMaterial({ color, linewidth: width, transparent: true, depthTest: false, depthWrite: false });
            const lineLoop = new THREE.LineLoop(geometry, material);
            lineLoop.position.set(worldX, worldY, 0);

            this.registerFrameGeometry(geometry);
            this.registerFrameMaterial(material);
            this.registerFrameObject(lineLoop);
        }
    }

    public drawRect(position: IVector2, size: IVector2, color: string, filled: boolean = true, width: number = 1): void {
        if (filled) {
            const { color: baseColor, opacity } = this.parseColor(color);
            const material = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity, depthTest: false, depthWrite: false });
            const mesh = new THREE.Mesh(this._unitPlane, material);
            mesh.scale.set(size.x, size.y, 1);
            mesh.position.set(this.toWorldX(position.x + size.x / 2), this.toWorldY(position.y + size.y / 2), 0);

            this.registerFrameMaterial(material);
            this.registerFrameObject(mesh);
        } else {
            const left = this.toWorldX(position.x);
            const top = this.toWorldY(position.y);
            const right = this.toWorldX(position.x + size.x);
            const bottom = this.toWorldY(position.y + size.y);
            const points = [
                new THREE.Vector3(left, top, 0),
                new THREE.Vector3(right, top, 0),
                new THREE.Vector3(right, bottom, 0),
                new THREE.Vector3(left, bottom, 0),
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color, linewidth: width, transparent: true, depthTest: false, depthWrite: false });
            const lineLoop = new THREE.LineLoop(geometry, material);

            this.registerFrameGeometry(geometry);
            this.registerFrameMaterial(material);
            this.registerFrameObject(lineLoop);
        }
    }

    public drawTexturedSphere(
        texture: HTMLImageElement,
        position: IVector2,
        radius: number,
        rotationQuaternion: { x: number; y: number; z: number; w: number },
        shadow?: HTMLImageElement,
        highlight?: HTMLImageElement
    ): void {
        const baseTexture = this.getTextureForImage(texture);
        if (!baseTexture) {
            return;
        }

        const map = baseTexture.clone();
        map.needsUpdate = true;
        map.wrapS = THREE.ClampToEdgeWrapping;
        map.wrapT = THREE.ClampToEdgeWrapping;

        const geometry = new THREE.SphereGeometry(radius, 24, 24);
        const material = new THREE.MeshPhongMaterial({ map, transparent: true, emissiveIntensity: 1, shininess: 80 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.toWorldX(position.x), this.toWorldY(position.y), 0.2);
        
        // Apply rotation using quaternion for proper angular momentum
        mesh.quaternion.set(
            rotationQuaternion.x,
            rotationQuaternion.y,
            rotationQuaternion.z,
            rotationQuaternion.w
        );

        this.registerFrameTexture(map);
        this.registerFrameGeometry(geometry);
        this.registerFrameMaterial(material);
        this.registerFrameObject(mesh);

        if (shadow && shadow.complete && shadow.naturalWidth > 0) {
            const shadowTex = this.getTextureForImage(shadow);
            if (shadowTex) {
                const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.2, depthTest: false, depthWrite: false });
                const shadowMesh = new THREE.Mesh(this._unitPlane, shadowMat);
                shadowMesh.scale.set(radius * 2.1, radius * 2.1, 1);
                shadowMesh.position.set(this.toWorldX(position.x), this.toWorldY(position.y), -0.1);
                this.registerFrameMaterial(shadowMat);
                this.registerFrameObject(shadowMesh);
            }
        }

        if (highlight && highlight.complete && highlight.naturalWidth > 0) {
            const highlightTex = this.getTextureForImage(highlight);
            if (highlightTex) {
                const highlightMat = new THREE.MeshBasicMaterial({ map: highlightTex, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false });
                const highlightMesh = new THREE.Mesh(this._unitPlane, highlightMat);
                highlightMesh.scale.set(radius * 2, radius * 2, 1);
                highlightMesh.position.set(this.toWorldX(position.x), this.toWorldY(position.y), 0.35);
                this.registerFrameMaterial(highlightMat);
                this.registerFrameObject(highlightMesh);
            }
        }
    }

    public changeCursor(cursor: string): void {
        this._canvas.style.cursor = cursor;
    }

    public endFrame(): void {
        this._renderer.render(this._scene, this._camera);
    }

    public showLoadingOverlay(message: string = 'Loading assets...'): void {
        if (!this._loadingOverlay) {
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.inset = '0';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.background = 'radial-gradient(circle at center, rgba(18,28,26,0.92), rgba(8,12,11,0.96))';
            overlay.style.color = '#e8efe9';
            overlay.style.font = '700 22px Georgia, serif';
            overlay.style.letterSpacing = '0.06em';
            overlay.style.textTransform = 'uppercase';
            overlay.style.zIndex = '30';
            this._canvasContainer.style.position = 'relative';
            this._canvasContainer.appendChild(overlay);
            this._loadingOverlay = overlay;
        }

        this._loadingOverlay.textContent = message;
        this._loadingOverlay.style.display = 'flex';
    }

    public hideLoadingOverlay(): void {
        if (this._loadingOverlay) {
            this._loadingOverlay.style.display = 'none';
        }
    }
}

const canvas : HTMLCanvasElement = document.getElementById('screen') as HTMLCanvasElement;
const container : HTMLElement = document.getElementById('gameArea') as HTMLElement;
export const Canvas2D = new Canvas2D_Singleton(canvas, container);

window.addEventListener('resize', Canvas2D.resizeCanvas.bind(Canvas2D));
