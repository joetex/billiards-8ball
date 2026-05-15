import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

export default {
    input: "game-server/index.js",
    output: {
        format: "cjs",
        sourcemap: true,
        file: "builds/server.bundle.js"
        // preserveModules: true,
    },
    plugins: [
        nodeResolve(),
        process.env.NODE_ENV == "production" ? terser() : null,
        json(),
        // terser()
    ],
    watch: {
        include: ["./game-server/*"],
        exclude: ["./game-client/*", "./builds"],
        clearScreen: false,
    },
};
