// SVG string → PNG Blob, via an offscreen <canvas>.
//
// Browser-only (Image, canvas, blob URLs) — not exercised in jsdom; verified by
// the live eyeball check. Used by the "Copy PNG" control. Renders at 2x for a
// crisp raster and fills a white background so the PNG pastes cleanly onto any
// surface. (Dark-mode contrast on a white background is a known rough edge tied
// to the deferred theming work — see docs/ui-design.md.)

const SCALE = 2
const BACKGROUND = '#ffffff'

export async function svgToPngBlob(svg: string): Promise<Blob> {
  const {width, height} = svgDimensions(svg)
  const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml;charset=utf-8'}))
  try {
    const image = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * SCALE))
    canvas.height = Math.max(1, Math.round(height * SCALE))

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get a 2D canvas context')
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await canvasToBlob(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Diagram dimensions from the SVG's viewBox, with a fallback. */
function svgDimensions(svg: string): {width: number; height: number} {
  const match = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/)
  if (match) return {width: parseFloat(match[1]!), height: parseFloat(match[2]!)}
  return {width: 800, height: 600}
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load the diagram SVG as an image'))
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas produced no PNG blob'))),
      'image/png',
    )
  })
}
