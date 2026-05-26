import { GameConfig } from './game.config';
import { IAssetsConfig } from './game.config.type';
import { audioManager } from './audio-manager';

//------Configurations------//

const sprites: IAssetsConfig = GameConfig.sprites;
const sounds: IAssetsConfig = GameConfig.sounds;

class Assets_Singleton {

    //------Members------//

    _sprites: Map<string, HTMLImageElement>;

    //------Constructor------//

    constructor() {
        this._sprites = new Map<string, HTMLImageElement>();
        // Initialize audio context on first user interaction
        this.setupAudioContextInitialization();
    }

    private setupAudioContextInitialization(): void {
        // Initialize audio context on first user interaction (required by browsers)
        const initAudio = () => {
            if (!audioManager.isInitialized()) {
                audioManager.initContext();
            }
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };

        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    //------Private Methods------//

    private loadSprite(path: string): Promise<void> {
        const img = new Image();
        this._sprites.set(path, img);

        return new Promise(resolve => {
            img.onload = () => resolve();
            img.src = sprites.basePath + path;
        });
    }
    
    private async loadGameSprites(): Promise<void> {
        const loadPromises = Object.values(sprites.paths).map(this.loadSprite.bind(this));

        await Promise.all(loadPromises);
    }

    private loadSound(path: string): Promise<void> {
        return audioManager.loadSound(path, sounds.basePath);
    }

    private async loadGameSounds(): Promise<void> {
        const loadPromises = Object.values(sounds.paths).map(this.loadSound.bind(this));
        
        await Promise.all(loadPromises);
        
        // Try to initialize audio context after loading sounds
        // If no user interaction yet, sounds will remain in pendingSounds queue
        if (!audioManager.isInitialized()) {
            audioManager.initContext();
        }
    }

    //------Public Methods------//

    public async loadGameAssets(): Promise<void> {
        await this.loadGameSounds();
        await this.loadGameSprites();
    }

    public getSprite(key: string): HTMLImageElement {
        const sprite = this._sprites.get(key);
        if (!sprite) {
            throw new Error(`[Assets] Sprite not found: ${key}`);
        }
        return sprite;
    }

    public playSound(key: string, volume: number): void {
        if(GameConfig.soundOn) {
            audioManager.playSound(key, volume);
        }
    }

    private loadTexture(path: string): Promise<void> {
        const img = new Image();
        this._sprites.set(path, img);
        return new Promise(resolve => {
            img.onload = () => resolve();
            img.onerror = () => { console.error('[Assets] Failed to load texture:', path); resolve(); };
            img.src = path;
        });
    }

    public async preloadTextures(paths: string[]): Promise<void> {
        await Promise.all(paths.map(p => this.loadTexture(p)));
    }

    public setMasterVolume(volume: number): void {
        audioManager.setMasterVolume(volume);
    }

    public getMasterVolume(): number {
        return audioManager.getMasterVolume();
    }

    public getLoadedSoundCount(): number {
        return audioManager.getLoadedSoundCount();
    }
}

export const Assets = new Assets_Singleton();