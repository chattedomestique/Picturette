import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import './CollageCanvas.css'

// Canvas resolution — high enough for a quality download
const CANVAS_SIZE = 1200

/**
 * Draw an image "cover" style into a rectangular region.
 * The image fills the region completely while maintaining its aspect ratio;
 * any overflow is hidden by the caller's clip rect.
 */
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const areaRatio = w / h

  let drawW, drawH, drawX, drawY

  if (imgRatio > areaRatio) {
    // Image is wider → fit by height, crop sides
    drawH = h
    drawW = h * imgRatio
    drawX = x + (w - drawW) / 2
    drawY = y
  } else {
    // Image is taller → fit by width, crop top/bottom
    drawW = w
    drawH = w / imgRatio
    drawX = x
    drawY = y + (h - drawH) / 2
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH)
}

function renderCollage(canvas, img1, img2, layout) {
  const ctx = canvas.getContext('2d')
  const CW = canvas.width
  const CH = canvas.height

  ctx.clearRect(0, 0, CW, CH)

  if (layout === 'side-by-side') {
    // Left half → image 1
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CW / 2, CH)
    ctx.clip()
    drawImageCover(ctx, img1, 0, 0, CW / 2, CH)
    ctx.restore()

    // Right half → image 2
    ctx.save()
    ctx.beginPath()
    ctx.rect(CW / 2, 0, CW / 2, CH)
    ctx.clip()
    drawImageCover(ctx, img2, CW / 2, 0, CW / 2, CH)
    ctx.restore()
  } else {
    // Top half → image 1
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CW, CH / 2)
    ctx.clip()
    drawImageCover(ctx, img1, 0, 0, CW, CH / 2)
    ctx.restore()

    // Bottom half → image 2
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, CH / 2, CW, CH / 2)
    ctx.clip()
    drawImageCover(ctx, img2, 0, CH / 2, CW, CH / 2)
    ctx.restore()
  }
}

const CollageCanvas = forwardRef(function CollageCanvas({ image1, image2, layout }, ref) {
  const canvasRef = useRef(null)
  const img1Ref = useRef(null)
  const img2Ref = useRef(null)

  const redraw = useCallback(() => {
    if (!canvasRef.current || !img1Ref.current || !img2Ref.current) return
    renderCollage(canvasRef.current, img1Ref.current, img2Ref.current, layout)
  }, [layout])

  // Load image 1
  useEffect(() => {
    if (!image1) { img1Ref.current = null; return }
    const img = new Image()
    img.onload = () => { img1Ref.current = img; redraw() }
    img.src = image1
  }, [image1, redraw])

  // Load image 2
  useEffect(() => {
    if (!image2) { img2Ref.current = null; return }
    const img = new Image()
    img.onload = () => { img2Ref.current = img; redraw() }
    img.src = image2
  }, [image2, redraw])

  // Re-render whenever layout changes
  useEffect(() => { redraw() }, [redraw])

  // Expose download method to parent
  useImperativeHandle(ref, () => ({
    download() {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'picturette-collage.png'
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
  }))

  const isReady = image1 && image2

  return (
    <div className={`collage-wrap ${isReady ? 'collage-wrap--ready' : ''}`}>
      {!isReady && (
        <div className="collage-placeholder">
          <div className="collage-placeholder__halves">
            <div className="collage-placeholder__half collage-placeholder__half--left">
              <span>1</span>
            </div>
            <div className="collage-placeholder__half collage-placeholder__half--right">
              <span>2</span>
            </div>
          </div>
          <p className="collage-placeholder__text">
            {!image1 && !image2
              ? 'Upload both photos to preview your collage'
              : !image1
              ? 'Waiting for photo 1…'
              : 'Waiting for photo 2…'}
          </p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={`collage-canvas ${isReady ? '' : 'collage-canvas--hidden'}`}
        aria-label="Collage preview"
      />
    </div>
  )
})

export default CollageCanvas
