import { ACOSServer } from "@acosgames/framework";
import { onJoin, onLeave, onGameStart, onPick, onSkip, onNewGame, onAim, onShoot, onCueMove, onCuePlace, onShotResult } from "./game";

function bootstrap(): void {
    ACOSServer.init();

    ACOSServer.on("newgame", (action) => {
        onNewGame(action);
        return true;
    });
    ACOSServer.on("gamestart", (action) => {
        onGameStart(action);
        return true;
    });
    ACOSServer.on("join", (action) => {
        onJoin(action);
        return true;
    });
    ACOSServer.on("leave", (action) => {
        onLeave(action);
        return true;
    });
    ACOSServer.on("skip", (action) => {
        onSkip(action);
        return true;
    });

    ACOSServer.on("pick", (action) => {
        onPick(action);
        return true;
    });
    ACOSServer.on("aim", (action) => {
        onAim(action);
        return true;
    });
    ACOSServer.on("shoot", (action) => {
        onShoot(action);
        return true;
    });
    ACOSServer.on("shoot-result", (action) => {
        onShotResult(action);
        return true;
    });
    ACOSServer.on("cue-move", (action) => {
        onCueMove(action);
        return true;
    });
    ACOSServer.on("cue-place", (action) => {
        onCuePlace(action);
        return true;
    });
    ACOSServer.on("shot-result", (action) => {
        onShotResult(action);
        return true;
    });

    ACOSServer.commit();
}

bootstrap();
