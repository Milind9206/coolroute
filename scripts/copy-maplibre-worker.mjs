import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(projectRoot, "node_modules/maplibre-gl/dist");
const targetDir = resolve(projectRoot, "public/maplibre");

mkdirSync(targetDir, { recursive: true });
copyFileSync(resolve(sourceDir, "maplibre-gl-worker.mjs"), resolve(targetDir, "maplibre-gl-worker.mjs"));
