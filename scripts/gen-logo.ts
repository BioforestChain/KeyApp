import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const SIZES = [64, 256]
const INPUT = 'logo.png'
const OUTPUT_DIRS = ['public/logos', 'docs/public/logos']

async function main() {
  for (const dir of OUTPUT_DIRS) {
    await fs.mkdir(dir, { recursive: true })
  }

  // 先 trim 一次，获取裁切后的 buffer
  const trimmed = await sharp(INPUT).trim().toBuffer()

  for (const size of SIZES) {
    const buffer = await sharp(trimmed)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 100, lossless: true })
      .toBuffer()

    for (const dir of OUTPUT_DIRS) {
      const outPath = path.join(dir, `logo-${size}.webp`)
      await fs.writeFile(outPath, buffer)
      console.log(`✓ ${outPath}`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
