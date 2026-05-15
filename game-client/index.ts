import { ACOSClient } from "@acosgames/framework";
import gameSettings from "../game-settings.json";
import './index.css';
// Build the DOM structure canvas.ts expects, inside the framework-provided #root.
// Must happen BEFORE pool/game is imported because canvas.ts reads #screen and
// #gameArea synchronously at module evaluation time.
const root = document.getElementById("root")!;
const gameArea = document.createElement("div");
gameArea.id = "gameArea";
gameArea.style.cssText = "position:relative;overflow:hidden;flex-shrink:0;";
const screen = document.createElement("canvas");
screen.id = "screen";
gameArea.appendChild(screen);
root.appendChild(gameArea);

// Register game settings with the ACOS simulator before the game boots
ACOSClient.send("gamesettings", gameSettings);

// Listen for game state updates from the ACOS server
ACOSClient.listen((message) => {
    if (message) {
        window.dispatchEvent(new CustomEvent("acos-message", { detail: message }));
    }
});

ACOSClient.timerLoop((elapsed) => {
    window.dispatchEvent(new CustomEvent("acos-timer", { detail: elapsed }));
});

// Dynamic import so the DOM setup above runs first (static imports are hoisted)
await import("./pool/game");

ACOSClient.ready();
