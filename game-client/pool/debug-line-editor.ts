/**
 * Debug Line/Pocket Editor
 * ========================
 * Lets you visually draw line segments (for cushion walls) and circle markers
 * (for pockets) over the game canvas, then prints them as JSON + createLine()
 * calls to the console for copy-pasting into pool-physics.ts.
 *
 * Controls
 * --------
 *  `  (backtick) or F2   – toggle editor on/off
 *  Tab                   – switch mode: LINE ↔ POCKET
 *  Left-click (line)     – first click = start point, second click = end point
 *  Left-click (pocket)   – place a pocket circle at TABLE.pocketRadius
 *  Right-click           – delete nearest line or pocket under cursor
 *  Escape                – cancel in-progress line
 *  S                     – toggle snap-to-grid (default: 1 unit)
 *  +/-                   – increase / decrease snap grid size
 *  P                     – print JSON + createLine() calls to console and copy to clipboard
 *  Z  (Ctrl+Z)           – undo last placed shape
 *
 * Coordinate space
 * ----------------
 *  Output coordinates are in pool-physics TABLE space:
 *    x: 0 – 1500 (TABLE.width)
 *    y: 0 – 750  (TABLE.height)
 *  The HUD bar above the table is 56 px in game-space, accounted for automatically.
 */

// Physics/game constants (keep in sync with pool-physics.ts and game.config.ts)
const GAME_W = 1500;
const GAME_H = 806;
const PHYSICS_Y_OFFSET = 56;  // HUD bar – table starts here in game coords
const DEFAULT_POCKET_R = 48;  // TABLE.pocketRadius
const MIN_POCKET_R = 8;
const MAX_POCKET_R = 160;
const DELETE_THRESHOLD = 30;  // physics units within which right-click deletes

type Vec2 = { x: number; y: number };
type DebugLine = { start: Vec2; end: Vec2 };
type DebugCircle = { x: number; y: number; r: number };
type Mode = "line" | "pocket";

/**
 * Mount the debug editor.
 * Call once from index.ts (or conditionally in dev builds).
 * Returns a teardown function.
 */
export function initDebugLineEditor(): () => void {
    let active = false;
    let mode: Mode = "line";
    let pocketRadius = DEFAULT_POCKET_R;
    let pendingStart: Vec2 | null = null;

    const lines: DebugLine[] = [];
    const circles: DebugCircle[] = [];

    // ── Overlay canvas (full-viewport, on top of everything) ──────────────────
    const overlay = document.createElement("canvas");
    Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "9999",
        display: "none",
        cursor: "crosshair",
    });
    document.body.appendChild(overlay);
    const ctx = overlay.getContext("2d")!;

    // ── Coordinate helpers ────────────────────────────────────────────────────

    function getCanvasRect(): DOMRect {
        const el = document.getElementById("screen");
        return el ? el.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    }

    /** Client (screen) px → physics table coords */
    function toPhysics(clientX: number, clientY: number): Vec2 {
        const rect = getCanvasRect();
        return {
            x: Math.round(((clientX - rect.left) / rect.width) * GAME_W),
            y: Math.round(((clientY - rect.top) / rect.height) * GAME_H - PHYSICS_Y_OFFSET),
        };
    }

    /** Physics table coords → client (screen) px */
    function toScreen(px: number, py: number): Vec2 {
        const rect = getCanvasRect();
        return {
            x: rect.left + (px / GAME_W) * rect.width,
            y: rect.top + ((py + PHYSICS_Y_OFFSET) / GAME_H) * rect.height,
        };
    }

    // ── Geometry helpers ──────────────────────────────────────────────────────

    function distPtToSeg(pt: Vec2, a: Vec2, b: Vec2): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(pt.x - a.x, pt.y - a.y);
        const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq));
        return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy));
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    let lastMouse: Vec2 | null = null;

    function render(): void {
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        if (!active) return;

        const rect = getCanvasRect();
        const scaleX = rect.width / GAME_W;
        const scaleY = rect.height / GAME_H;
        const tableTop = rect.top + PHYSICS_Y_OFFSET * scaleY;
        const tableH = rect.height - PHYSICS_Y_OFFSET * scaleY;

        // Subtle darkening mask over the table area so shapes pop
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(rect.left, tableTop, rect.width, tableH);

        // ── Existing lines ──
        for (const line of lines) {
            const s = toScreen(line.start.x, line.start.y);
            const e = toScreen(line.end.x, line.end.y);
            ctx.strokeStyle = "rgba(0,255,128,0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(e.x, e.y);
            ctx.stroke();
            ctx.fillStyle = "#00ff80";
            ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, Math.PI * 2); ctx.fill();
            // Midpoint label
            const mx = (s.x + e.x) / 2;
            const my = (s.y + e.y) / 2;
            ctx.font = "11px monospace";
            ctx.fillStyle = "rgba(0,255,128,0.8)";
            const len = Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y).toFixed(0);
            ctx.fillText(`${len}u`, mx + 4, my - 4);
        }

        // ── Existing circles ──
        for (const circle of circles) {
            const c = toScreen(circle.x, circle.y);
            const r = circle.r * scaleX;
            ctx.strokeStyle = "rgba(255,200,0)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = "rgba(255,200,0)";
            ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffc800";
            ctx.font = "11px monospace";
            ctx.fillText(`r:${circle.r}`, c.x + r + 3, c.y + 4);
        }

        // ── In-progress line preview ──
        if (mode === "line" && pendingStart) {
            const s = toScreen(pendingStart.x, pendingStart.y);
            ctx.fillStyle = "#ff8800";
            ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2); ctx.fill();

            if (lastMouse) {
                const ep = toScreen(lastMouse.x, lastMouse.y);
                ctx.strokeStyle = "rgba(255,136,0)";
                ctx.lineWidth = 2;
                ctx.setLineDash([7, 4]);
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ep.x, ep.y); ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // ── Cursor cross + coords ──
        if (lastMouse) {
            const mp = toPhysics(lastMouse.x, lastMouse.y);
            const ms = toScreen(mp.x, mp.y);

            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ms.x - 12, ms.y); ctx.lineTo(ms.x + 12, ms.y);
            ctx.moveTo(ms.x, ms.y - 12); ctx.lineTo(ms.x, ms.y + 12);
            ctx.stroke();

            const label = `x:${mp.x}  y:${mp.y}`;
            ctx.font = "12px monospace";
            const lw = ctx.measureText(label).width;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(ms.x + 14, ms.y - 17, lw + 8, 20);
            ctx.fillStyle = "#fff";
            ctx.fillText(label, ms.x + 18, ms.y - 3);

            // Pocket preview
            if (mode === "pocket") {
                const r = pocketRadius * scaleX;
                ctx.strokeStyle = "rgba(255,200,0)";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(ms.x, ms.y, r, 0, Math.PI * 2); ctx.stroke();
            }
        }

        // ── HUD ──
        const hx = rect.left + 300;
        const hy = rect.top + 300;
        const hudW = 500;
        const hudH = 120;
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.fillRect(hx, hy, hudW, hudH);
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.lineWidth = 1;
        ctx.strokeRect(hx, hy, hudW, hudH);

        const tx = hx + 12;
        let ty = hy + 20;
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = "#fff";
        ctx.fillText("DEBUG EDITOR  (` or F2 to close)", tx, ty);

        ty += 18;
        ctx.font = "13px monospace";
        ctx.fillStyle = mode === "line" ? "#00ff80" : "#ffc800";
        ctx.fillText(`[TAB] Mode: ${mode.toUpperCase()}`, tx, ty);

        ty += 16;
        ctx.fillStyle = "#ccc";
        ctx.fillText(`[+/-] Pocket radius: ${pocketRadius}`, tx, ty);

        ty += 16;
        ctx.fillStyle = "#ccc";
        ctx.fillText(`[P] Print JSON to console   [Z] Undo last shape`, tx, ty);

        ty += 16;
        ctx.fillStyle = "#ccc";
        ctx.fillText(`[Right-click] Delete nearest   [Esc] Cancel line`, tx, ty);

        ty += 16;
        ctx.fillStyle = "#aaa";
        ctx.fillText(`Shapes: ${lines.length} line(s), ${circles.length} pocket(s)`, tx, ty);
    }

    // ── Event handlers ────────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent): void {
        lastMouse = { x: e.clientX, y: e.clientY };
        if (active) render();
    }

    function onClick(e: MouseEvent): void {
        if (!active) return;
        e.stopPropagation();
        e.preventDefault();

        const pt = toPhysics(e.clientX, e.clientY);

        if (mode === "line") {
            if (!pendingStart) {
                pendingStart = { ...pt };
            } else {
                lines.push({ start: { ...pendingStart }, end: { ...pt } });
                pendingStart = null;
            }
        } else {
            circles.push({ x: pt.x, y: pt.y, r: pocketRadius });
        }

        render();
    }

    function onContextMenu(e: MouseEvent): void {
        if (!active) return;
        e.stopPropagation();
        e.preventDefault();

        const pt = toPhysics(e.clientX, e.clientY);

        // Find nearest line
        let bestLineDist = DELETE_THRESHOLD;
        let bestLineIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            const d = distPtToSeg(pt, lines[i].start, lines[i].end);
            if (d < bestLineDist) { bestLineDist = d; bestLineIdx = i; }
        }

        // Find nearest circle
        let bestCircleDist = DELETE_THRESHOLD;
        let bestCircleIdx = -1;
        for (let i = 0; i < circles.length; i++) {
            const d = Math.hypot(pt.x - circles[i].x, pt.y - circles[i].y);
            if (d < bestCircleDist) { bestCircleDist = d; bestCircleIdx = i; }
        }

        if (bestLineIdx >= 0 && bestLineDist <= bestCircleDist) {
            lines.splice(bestLineIdx, 1);
            pendingStart = null;
        } else if (bestCircleIdx >= 0) {
            circles.splice(bestCircleIdx, 1);
        }

        render();
    }

    function onKeyDown(e: KeyboardEvent): void {
        const key = e.key;

        // Toggle
        if (key === "`" || key === "F2") {
            active = !active;
            overlay.style.display = active ? "block" : "none";
            if (!active) pendingStart = null;
            render();
            return;
        }

        if (!active) return;

        if (key === "Tab") {
            e.preventDefault();
            mode = mode === "line" ? "pocket" : "line";
            pendingStart = null;
            render();
        } else if (key === "+") {
            pocketRadius = Math.min(pocketRadius + 1, MAX_POCKET_R);
            render();
        } else if (key === "-") {
            pocketRadius = Math.max(pocketRadius - 1, MIN_POCKET_R);
            render();
        } else if (key === "p" || key === "P") {
            printJSON();
        } else if ((key === "z" || key === "Z") && !e.shiftKey) {
            // Undo last placed shape
            if (pendingStart) {
                pendingStart = null;
            } else if (lines.length > 0 && (circles.length === 0 || mode === "line")) {
                lines.pop();
            } else if (circles.length > 0) {
                circles.pop();
            } else if (lines.length > 0) {
                lines.pop();
            }
            render();
        } else if (key === "Escape") {
            pendingStart = null;
            render();
        }
    }

    function onResize(): void {
        if (active) render();
    }

    // ── JSON output ───────────────────────────────────────────────────────────

    function printJSON(): void {
        const output = {
            lines: lines.map((l) => ({ start: l.start, end: l.end })),
            pockets: circles.map((c) => ({ x: c.x, y: c.y, r: c.r })),
        };

        console.group("=== DEBUG EDITOR OUTPUT ===");
        console.log(JSON.stringify(output, null, 2));
        console.groupEnd();

        console.group("=== createLine() calls (copy into addCushionBodies) ===");
        for (const l of lines) {
            console.log(
                `physics.createLine(world, ` +
                `{x:${l.start.x}, y:${l.start.y}}, ` +
                `{x:${l.end.x}, y:${l.end.y}}, ` +
                `0, friction, restitution);`
            );
        }
        console.groupEnd();

        if (circles.length) {
            console.group("=== pocket positions ===");
            console.log(circles.map((c) => `{ x: ${c.x}, y: ${c.y} }`).join(",\n"));
            console.groupEnd();
        }

        // Copy raw JSON to clipboard (silently ignore if unavailable)
        navigator.clipboard?.writeText(JSON.stringify(output, null, 2)).catch(() => {});
    }

    // ── Mount ─────────────────────────────────────────────────────────────────

    // Use capture phase so we beat the game's document-level listeners
    window.addEventListener("click", onClick, true);
    window.addEventListener("mousedown", onClick, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    // When active the overlay must receive pointer events so it intercepts clicks
    // When inactive it is hidden + pointer-events:none so the game is unaffected
    const origPointerEvents = overlay.style.pointerEvents;
    function setActive(v: boolean): void {
        active = v;
        overlay.style.display = v ? "block" : "none";
        overlay.style.pointerEvents = v ? "auto" : "none";
    }
    setActive(false);

    console.info("[DebugLineEditor] Ready. Press ` (backtick) or F2 to toggle.");

    // ── Teardown ──────────────────────────────────────────────────────────────
    return () => {
        overlay.removeEventListener("click", onClick, true);
        overlay.removeEventListener("contextmenu", onContextMenu, true);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        overlay.remove();
    };
}
