import { ACOSServer } from "@acosgames/framework";

import { onJoin, onLeave, onGameStart as onGameStart, onPick, onSkip, onNewGame, onAim, onShoot } from "./game";

//prepare gameState for mutation
ACOSServer.init();

//ACOS Actions
ACOSServer.on("newgame", onNewGame);
ACOSServer.on("gamestart", onGameStart);
ACOSServer.on("join", onJoin);
ACOSServer.on("leave", onLeave);
ACOSServer.on("skip", onSkip);

//Game Actions
ACOSServer.on("pick", onPick);
ACOSServer.on("aim", onAim);
ACOSServer.on("shoot", onShoot);

//Save changes
ACOSServer.commit();
