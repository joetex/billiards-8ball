import { AI } from './ai/ai-trainer';
import { GoToPreviousMenuCommand } from './menu/commands/go-to-previous-menu-command';
import { GoToSubMenuCommand } from './menu/commands/go-to-sub-menu-command';
import { ToggleSoundCommand } from './menu/commands/toggle-sound-command';
import { PVCCommand } from './menu/commands/pvc-command';
import { PVPCommand } from './menu/commands/pvp-command';
import { IMenuCommand } from './menu/commands/menu-command';
import { GameConfig } from './game.config';
import { MenuActionType } from './menu/menu-action-type';
import { Menu } from './menu/menu';
import { Assets } from './assets';
import { GameWorld, BALL_TEXTURE_PATHS } from './game-objects/game-world';
import { Keyboard } from './input/keyboard';
import { Canvas2D } from './canvas';
import { Mouse } from './input/mouse';
import { IAssetsConfig, IInputConfig } from './game.config.type';

//------Configurations------//

const sprites: IAssetsConfig = GameConfig.sprites;
const inputConfig: IInputConfig = GameConfig.input;

export class Game {

    //------Members------//

    private _menuActionsMap!: Map<MenuActionType, IMenuCommand>;
    private _previousMenus: Menu[] = [];
    private _menu: Menu = new Menu();
    private _poolGame!: GameWorld;
    private _isLoading: boolean = false;
    private _inGame: boolean = false;
    private _lastFrameTimeMs: number = 0;
    private _accumulatorMs: number = 0;

    private static readonly _fixedStepMs: number = 1000 / 120;
    private static readonly _maxFrameDeltaMs: number = 100;
    private static readonly _maxSimulationStepsPerFrame: number = 6;

    //------Private Methods------//

    private initMenuActions(): void {
        this._menuActionsMap = new Map<MenuActionType, IMenuCommand>();
        this._menuActionsMap.set(MenuActionType.PVP, new PVPCommand(this));
        this._menuActionsMap.set(MenuActionType.PVC, new PVCCommand(this));
        this._menuActionsMap.set(MenuActionType.ToggleSound, new ToggleSoundCommand());
        this._menuActionsMap.set(MenuActionType.GoToSubMenu, new GoToSubMenuCommand(this));
        this._menuActionsMap.set(MenuActionType.GoToPreviousMenu, new GoToPreviousMenuCommand(this));
    }

    private initMainMenu(): void {
        this._menu.init(this._menuActionsMap, GameConfig.mainMenu);
    }

    private displayLoadingScreen(): Promise<void> {
        return new Promise((resolve) => {
            this._isLoading = true;
            Canvas2D.clear();
            Canvas2D.drawImage(
                Assets.getSprite(sprites.paths.controls),
                GameConfig.loadingScreenImagePosition
                );
            setTimeout(() => {
                this._isLoading = false;
                resolve();
            }, GameConfig.loadingScreenTimeout);
        });
    }

    private handleInput(): void {
        if(this._inGame && Keyboard.isPressed(inputConfig.toggleMenuKey)) {
            if(this._menu.active) {
                this._menu.active = false;
            }
            else {
                this.initMainMenu();
                this._menu.active = true;
            }
        }
    }

    private fixedUpdate(): void {
        if (this._isLoading) return;
        this.handleInput();
        this._menu.active ? this._menu.update() : this._poolGame.update();
    }

    private draw(): void {
        if (this._isLoading) return;
        if(AI.finishedSession){
            Canvas2D.clear();
            this._menu.active ? this._menu.draw() : this._poolGame.draw();
        }
    }

    private gameLoop(timestampMs: number = performance.now()): void {
        if (this._lastFrameTimeMs === 0) {
            this._lastFrameTimeMs = timestampMs;
        }

        const deltaMs = Math.min(Game._maxFrameDeltaMs, timestampMs - this._lastFrameTimeMs);
        this._lastFrameTimeMs = timestampMs;
        this._accumulatorMs += deltaMs;

        let steps = 0;
        while (this._accumulatorMs >= Game._fixedStepMs && steps < Game._maxSimulationStepsPerFrame) {
            this.fixedUpdate();
            this._accumulatorMs -= Game._fixedStepMs;
            steps++;
        }

        Keyboard.reset();
        Mouse.reset();

        this.draw();
        window.requestAnimationFrame((nextTs: number) => {
            this.gameLoop(nextTs);
        });
    }

    //------Public Methods------//

    public async init(): Promise<void> {
        await Assets.loadGameAssets();
        await Assets.preloadTextures(BALL_TEXTURE_PATHS);

        this.initMenuActions();
        this.initMainMenu();
        GameConfig.ai.on = false;
        this._menu.active = false;
        this._inGame = true;
        this._poolGame = new GameWorld();
        this._poolGame.initMatch();
        this._lastFrameTimeMs = 0;
        this._accumulatorMs = 0;
        this.gameLoop();
    }

    public goToSubMenu(index: number): void {
        setTimeout(() => {
            if(this._menu){
                this._menu.active = false;
                this._previousMenus.push(this._menu);
            }
            this._menu = this._menu.getSubMenu(index);
            this._menu.active = true;   
        }, GameConfig.timeoutToLoadSubMenu);
    }
    
    public goToPreviousMenu(): void {
        if(this._previousMenus.length > 0) {
            setTimeout(() => {
                this._menu.active = false;
                const previousMenu = this._previousMenus.pop();
                if(!previousMenu) {
                    return;
                }
                this._menu = previousMenu;
                this._menu.active = true; 
            }, GameConfig.timeoutToLoadSubMenu);
        }
    }

    public start(): void {
        this.displayLoadingScreen().then(() => {
            this._menu.active = false;
            this._inGame = true;
            this._poolGame = new GameWorld();
            this._poolGame.initMatch();
        });
    }
}

const game = new Game();
game.init();