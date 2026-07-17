import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
  </defs>

  <!-- Background rounded square -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Circle ring -->
  <circle cx="256" cy="256" r="148" fill="none" stroke="white" stroke-width="20" opacity="0.25"/>

  <!-- Checkmark -->
  <polyline
    points="168,256 228,316 344,196"
    fill="none"
    stroke="white"
    stroke-width="40"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`

function renderPng(size) {
  const resvg = new Resvg(svgIcon, { fitTo: { mode: 'width', value: size } })
  return resvg.render().asPng()
}

function pngToIco(pngBuffer) {
  const count = 1
  const headerSize = 6
  const entrySize = 16
  const dataOffset = headerSize + entrySize * count

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)  // reserved
  header.writeUInt16LE(1, 2)  // type: ICO
  header.writeUInt16LE(count, 4)

  const entry = Buffer.alloc(entrySize)
  entry.writeUInt8(32, 0)    // width (0 = 256)
  entry.writeUInt8(32, 1)    // height
  entry.writeUInt8(0, 2)     // color count
  entry.writeUInt8(0, 3)     // reserved
  entry.writeUInt16LE(1, 4)  // planes
  entry.writeUInt16LE(32, 6) // bit count
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(dataOffset, 12)

  return Buffer.concat([header, entry, pngBuffer])
}

function generate(size, outputPath) {
  const png = renderPng(size)
  writeFileSync(outputPath, png)
  console.log(`Generated ${outputPath} (${size}x${size})`)
}

generate(192, 'public/icons/icon-192x192.png')
generate(512, 'public/icons/icon-512x512.png')

const favicon32 = renderPng(32)
writeFileSync('public/favicon.ico', pngToIco(favicon32))
console.log('Generated public/favicon.ico (32x32)')
