import { defineConfig } from "vite";

export default defineConfig({
    clearScreen: false,
    build: {
        manifest: true,
        sourcemap: true,
        rollupOptions: {
            input: "./game-client/index.ts",
            output: {
                assetFileNames: (chunkInfo) => {
                    if (chunkInfo.names.find((name) => name.endsWith(".css"))) {
                        return `assets/client.bundle.css`;
                    }
                    return `assets/[name][hash][extname]`;
                },
                entryFileNames: `client.bundle.js`,
            },
        },
        outDir: "./builds",
    },
});
