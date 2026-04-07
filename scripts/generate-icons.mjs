/**
 * Generates PWA icons as solid-color PNGs using only Node.js built-ins.
 * Color: teal #0d9488 = rgb(13, 148, 136)
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

const R = 13, G = 148, B = 136 // #0d9488

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crcVal = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcVal])
}

function createSolidPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB color type

  // One row: filter byte (0) + RGB pixels
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = R
    row[1 + x * 3 + 1] = G
    row[1 + x * 3 + 2] = B
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row))
  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192x192.png', createSolidPNG(192))
writeFileSync('public/icons/icon-512x512.png', createSolidPNG(512))
console.log('✔ Icons generated: public/icons/icon-192x192.png, icon-512x512.png')
