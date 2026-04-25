import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgPath = path.join(__dirname, "../public/favicon.svg");
const iconsDir = path.join(__dirname, "../public/icons");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const svgBuf = fs.readFileSync(svgPath);

function buildIco(images) {
  const n = images.length;
  const headerSize = 6;
  const dirSize = 16 * n;
  let offset = headerSize + dirSize;
  const dirs = [];
  for (const { w, h, buf } of images) {
    dirs.push({ w, h, buf, offset });
    offset += buf.length;
  }
  const total = offset;
  const out = Buffer.alloc(total);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(n, 4);
  let pos = 6;
  for (const { w, h, buf, offset } of dirs) {
    out.writeUInt8(w >= 256 ? 0 : w, pos);
    out.writeUInt8(h >= 256 ? 0 : h, pos + 1);
    out.writeUInt8(0, pos + 2);
    out.writeUInt8(0, pos + 3);
    out.writeUInt16LE(1, pos + 4);
    out.writeUInt16LE(32, pos + 6);
    out.writeUInt32LE(buf.length, pos + 8);
    out.writeUInt32LE(offset, pos + 12);
    pos += 16;
  }
  for (const { buf, offset } of dirs) {
    buf.copy(out, offset);
  }
  return out;
}

const p16  = await sharp(svgBuf).resize(16, 16).png().toBuffer();
const p32  = await sharp(svgBuf).resize(32, 32).png().toBuffer();

await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, "icon-192x192.png"));
console.log("icon-192x192.png done");

await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, "icon-512x512.png"));
console.log("icon-512x512.png done");

fs.writeFileSync(path.join(publicDir, "favicon.ico"), buildIco([
  { w: 16, h: 16, buf: p16 },
  { w: 32, h: 32, buf: p32 },
]));
console.log("favicon.ico done");