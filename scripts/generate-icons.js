const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "../public/favicon.svg");
const iconsDir = path.join(__dirname, "../public/icons");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const svgBuf = fs.readFileSync(svgPath);

async function main() {
  // 192x192 PNG for PWA
  await sharp(svgBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));
  console.log("icon-192x192.png done");

  // 512x512 PNG for PWA
  await sharp(svgBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));
  console.log("icon-512x512.png done");

  // 32x32 PNG as ICO source
  const png32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();

  // Build minimal ICO (2 images: 16x16 + 32x32)
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
    // ICONDIR
    out.writeUInt16LE(0, 0);   // reserved
    out.writeUInt16LE(1, 2);   // type = ICO
    out.writeUInt16LE(n, 4);   // count
    // ICONDIRENTRY
    let pos = 6;
    for (const { w, h, buf, offset } of dirs) {
      out.writeUInt8(w === 256 ? 0 : w, pos);        // width
      out.writeUInt8(h === 256 ? 0 : h, pos + 1);    // height
      out.writeUInt8(0, pos + 2);    // color count
      out.writeUInt8(0, pos + 3);    // reserved
      out.writeUInt16LE(1, pos + 4); // planes
      out.writeUInt16LE(32, pos + 6);// bit count
      out.writeUInt32LE(buf.length, pos + 8);  // size
      out.writeUInt32LE(offset, pos + 12);     // offset
      pos += 16;
    }
    // Image data
    for (const { buf, offset } of dirs) {
      buf.copy(out, offset);
    }
    return out;
  }

  const icoBuf = buildIco([
    { w: 16, h: 16, buf: png16 },
    { w: 32, h: 32, buf: png32 },
  ]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuf);
  console.log("favicon.ico done");

  // Also save favicon-32.png for use in HTML
  await sharp(svgBuf)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon-32.png"));
  console.log("favicon-32.png done");
}

main().catch(e => { console.error(e); process.exit(1); });