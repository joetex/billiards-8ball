import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "game-server/index.ts",
    output: {
        format: "cjs",
        sourcemap: true,
        file: "builds/server.bundle.js"
        // preserveModules: true,
    },
    plugins: [
        nodeResolve(),
        json(),
        typescript({ tsconfig: "./tsconfig.server.json" }),
        process.env.NODE_ENV == "production" ? terser() : null,
        // terser()
    ],
    watch: {
        include: ["./game-server/**/*", "./shared/**/*"],
        exclude: ["./game-client/*", "./builds"],
        clearScreen: false,
    },
};
