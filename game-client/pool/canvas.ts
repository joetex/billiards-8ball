import { IVector2 } from './game.config.type';
import { GameConfig } from './game.config';
import { Vector2 } from './geom/vector2';

class Canvas2D_Singleton {

    //------Members------//

    private _canvasContainer: HTMLElement;
    private _canvas : HTMLCanvasElement;
    private _context : CanvasRenderingContext2D;
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
        this._context = this._canvas.getContext('2d') as CanvasRenderingContext2D;
        this.resizeCanvas();
    }

    //------Public Methods------//

    public resizeCanvas(): void {
        
        const originalCanvasWidth = GameConfig.gameSize.x;
        const originalCanvasHeight = GameConfig.gameSize.y;
        const widthToHeight: number = originalCanvasWidth / originalCanvasHeight;

        let newHeight: number = document.documentElement.clientHeight;
        let newWidth: number = document.documentElement.clientWidth;
       
        const newWidthToHeight: number = newWidth / newHeight;

        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }
        
        this._canvasContainer.style.width = newWidth + 'px';
        this._canvasContainer.style.height = newHeight + 'px';
        this._scale = new Vector2(newWidth / originalCanvasWidth, newHeight / originalCanvasHeight);

        this._canvas.width = newWidth;
        this._canvas.height = newHeight;
        
        if (this._canvas.offsetParent) {
            this._offset = new Vector2(this._canvas.offsetLeft, this._canvas.offsetTop);
        }
    }


    public clear() : void {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    public drawImage(
            sprite: HTMLImageElement,
            position: IVector2 = { x: 0, y: 0 }, 
            rotation: number = 0, 
            origin: IVector2 = { x: 0, y: 0 },
            size?: IVector2
        ) {    
        const drawWidth = size ? size.x : sprite.width;
        const drawHeight = size ? size.y : sprite.height;
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.translate(position.x, position.y);
        this._context.rotate(rotation);
        this._context.drawImage(sprite, 0, 0, sprite.width, sprite.height, -origin.x, -origin.y, drawWidth, drawHeight);
        this._context.restore();
    }


    public drawText(text: string, font:string, color: string, position: IVector2, textAlign: string = 'left', textBaseline: string = 'alphabetic'): void {
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.fillStyle = color;
        this._context.font = font;
        this._context.textAlign = textAlign as CanvasTextAlign;
        this._context.textBaseline = textBaseline as CanvasTextBaseline;
        this._context.fillText(text, position.x, position.y);
        this._context.restore();
    }

    public drawLine(start: IVector2, end: IVector2, color: string, width: number = 1): void {
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.strokeStyle = color;
        this._context.lineWidth = width;
        this._context.moveTo(start.x, start.y);
        this._context.lineTo(end.x, end.y);
        this._context.stroke();
        this._context.restore();
    }

    public drawCircle(position: IVector2, radius: number, color: string, filled: boolean = false, width: number = 1): void {
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.beginPath();
        this._context.arc(position.x, position.y, radius, 0, Math.PI * 2);
        if (filled) {
            this._context.fillStyle = color;
            this._context.fill();
        } else {
            this._context.strokeStyle = color;
            this._context.lineWidth = width;
        }
        this._context.restore();
    }

    public drawRect(position: IVector2, size: IVector2, color: string, filled: boolean = true, width: number = 1): void {
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        if (filled) {
            this._context.fillStyle = color;
            this._context.fillRect(position.x, position.y, size.x, size.y);
        } else {
            this._context.strokeStyle = color;
            this._context.lineWidth = width;
            this._context.strokeRect(position.x, position.y, size.x, size.y);
        }
        this._context.restore();
    }

    public drawTexturedSphere(
        texture: HTMLImageElement,
        position: IVector2,
        radius: number,
        roll: number,
        textureOffset: IVector2,
        shadow?: HTMLImageElement,
        highlight?: HTMLImageElement
    ): void {
        // Only draw if the image is loaded
        if (!texture.complete || texture.naturalWidth === 0) {
            // Optionally, draw a placeholder or skip drawing
            // For debugging:
            console.warn('Ball texture not loaded yet:', texture.src);
            return;
        }
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.translate(position.x, position.y);

        this._context.beginPath();
        this._context.arc(0, 0, radius, 0, Math.PI * 2);
        this._context.clip();

        this._context.save();
        this._context.rotate(roll);

        const diameter = radius * 2;
        const textureAspect = texture.naturalHeight > 0 ? texture.naturalWidth / texture.naturalHeight : 1;

        // Preserve source aspect ratio so circular decals on rectangular textures stay circular.
        const tileHeight = diameter;
        const tileWidth = diameter * textureAspect;

        const wrappedX = ((textureOffset.x % tileWidth) + tileWidth) % tileWidth;
        const wrappedY = ((textureOffset.y % tileHeight) + tileHeight) % tileHeight;
        const startX = Math.round(-tileWidth / 2 - wrappedX);
        const startY = Math.round(-tileHeight / 2 - wrappedY);
        const seamBleed = 1;

        for (let ix = 0; ix < 4; ix++) {
            for (let iy = 0; iy < 4; iy++) {
                this._context.drawImage(
                    texture,
                    startX + ix * tileWidth,
                    startY + iy * tileHeight,
                    tileWidth + seamBleed,
                    tileHeight + seamBleed,
                );
            }
        }
        this._context.restore();

        if (shadow && shadow.complete && shadow.naturalWidth > 0) {
            this._context.globalCompositeOperation = 'multiply';
            this._context.globalAlpha = 0.38;
            this._context.drawImage(shadow, -radius, -radius, radius * 2, radius * 2);
            this._context.globalAlpha = 1;
        }

        if (highlight && highlight.complete && highlight.naturalWidth > 0) {
            this._context.globalCompositeOperation = 'overlay';
            this._context.globalAlpha = 0.22;
            this._context.drawImage(highlight, -radius, -radius, radius * 2, radius * 2);
            this._context.globalAlpha = 1;
        }

        this._context.globalCompositeOperation = 'source-over';

        this._context.restore();
    }

    public changeCursor(cursor: string): void {
        this._canvas.style.cursor = cursor;
    }
}

const canvas : HTMLCanvasElement = document.getElementById('screen') as HTMLCanvasElement;
const container : HTMLElement = document.getElementById('gameArea') as HTMLElement;
export const Canvas2D = new Canvas2D_Singleton(canvas, container);

window.addEventListener('resize', Canvas2D.resizeCanvas.bind(Canvas2D));
