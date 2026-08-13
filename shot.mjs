import fs from "node:fs";

const [, , src, out] = process.argv;
const json = JSON.parse(fs.readFileSync(src, "utf8"));
const findData = (node) => {
  if (!node || typeof node !== "object") return null;
  if (typeof node.data === "string") return node.data;
  for (const value of Object.values(node)) {
    const hit = findData(value);
    if (hit) return hit;
  }
  return null;
};
fs.writeFileSync(out, Buffer.from(findData(json), "base64"));
console.log("wrote", out);
