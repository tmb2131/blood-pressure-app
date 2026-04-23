// Generates solid-color PNG icons from RGB values using only Node built-ins.
// Not a real rasterizer — produces flat navy squares. iOS masks them for the home screen.
// If you want prettier icons later, rasterize public/icon.svg to PNG yourself.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";

function crc32(buf) {
  let c,
    table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function solidPng(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const rows = [];
  const rowBytes = Buffer.alloc(1 + size * 3);
  rowBytes[0] = 0; // filter: none
  for (let x = 0; x < size; x++) {
    rowBytes[1 + x * 3] = r;
    rowBytes[2 + x * 3] = g;
    rowBytes[3 + x * 3] = b;
  }
  for (let y = 0; y < size; y++) rows.push(rowBytes);
  const raw = Buffer.concat(rows);
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const NAVY = [15, 23, 42]; // #0f172a
const out = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/icon-maskable.png", 512],
  ["public/apple-touch-icon.png", 180],
];
for (const [path, size] of out) {
  writeFileSync(path, solidPng(size, NAVY[0], NAVY[1], NAVY[2]));
  console.log("wrote", path, size);
}
