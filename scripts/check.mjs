import { readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const css = await readFile("styles.css", "utf8");
const js = await readFile("app.js", "utf8");
const required = ["<main>", "id=\"cardapio\"", "aria-live=\"polite\"", "prefers-reduced-motion", "focus-visible"];

for (const marker of required) {
  if (!`${html}\n${css}`.includes(marker)) throw new Error(`Marcador obrigatorio ausente: ${marker}`);
}

if ((html.match(/id="[^"]+"/g) || []).length !== new Set((html.match(/id="[^"]+"/g) || []).map((id) => id.slice(4, -1))).size) {
  throw new Error("IDs duplicados no HTML");
}

if (!js.includes("localStorage") || !js.includes("Intl.NumberFormat")) {
  throw new Error("Comportamento de carrinho incompleto");
}

console.log("Estrutura, acessibilidade basica e scripts verificados.");
