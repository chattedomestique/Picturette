import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import './CollageCanvas.css'

const CANVAS_SIZE = 1200

/**
 * Draw an image "cover" style into a rectangular region, applying
 * the user's scale and pan offsets.
 *
 * x, y, w, h  — the clipping region on the canvas
 * transform   — { scale, x, y } where x/y are fractions of the region size
 */
function drawImageCover(ctx, img, x, y, w, h, transform) {
  const { scale = 1, x: ox = 0, y: oy = 0 } = transform || {}
  const imgRatio = img.naturalWidth / img.naturalHeight
  const areaRatio = w / h

  let baseW, baseH
  if (imgRatio > areaRatio) {
    baseH = h
    baseW = h * imgRatio
  } else {
    baseW = w
    baseH = w / imgRatio
  }

  const drawW = baseW * scale
  const drawH = baseH * scale
  // Center within region, then apply user offset (as fraction of region)
  const drawX = x + (w - drawW) / 2 + ox * w
  const drawY = y + (h - drawH) / 2 + oy * h

  ctx.drawImage(img, drawX, drawY, drawW, drawH)
}

function renderCollage(canvas, img1, img2, layout, t1, t2) {
  const ctx = canvas.getContext('2d')
  const CW = canvas.width
  const CH = canvas.height

  ctx.clearRect(0, 0, CW, CH)

  if (layout === 'side-by-side') {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CW / 2, CH)
    ctx.clip()
    drawImageCover(ctx, img1, 0, 0, CW / 2, CH, t1)
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.rect(CW / 2, 0, CW / 2, CH)
    ctx.clip()
    drawImageCover(ctx, img2, CW / 2, 0, CW / 2, CH, t2)
    ctx.restore()
  } else {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CW, CH / 2)
    ctx.clip()
    drawImageCover(ctx, img1, 0, 0, CW, CH / 2, t1)
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, CH / 2, CW, CH / 2)
    ctx.clip()
    drawImageCover(ctx, img2, 0, CH / 2, CW, CH / 2, t2)
    ctx.restore()
  }
}

const CollageCanvas = forwardRef(function CollageCanvas(
  { image1, image2, layout, transform1, transform2 },
  ref
) {
  const canvasRef = useRef(null)
  const img1Ref = useRef(null)
  const img2Ref = useRef(null)

  // Stable ref always holds latest values — safe to read inside image-load callbacks
  const stateRef = useRef({ layout, transform1, transform2 })
  stateRef.current = { layout, transform1, transform2 }

  // Stable redraw function — never recreated, reads current state via stateRef
  const doRedraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !img1Ref.current || !img2Ref.current) return
    const { layout, transform1, transform2 } = stateRef.current
    renderCollage(canvas, img1Ref.current, img2Ref.current, layout, transform1, transform2)
  }, [])

  // Load image 1 only when the URL changes
  useEffect(() => {
    if (!image1) { img1Ref.current = null; return }
    const img = new Image()
    img.onload = () => { img1Ref.current = img; doRedraw() }
    img.src = image1
  }, [image1, doRedraw])

  // Load image 2 only when the URL changes
  useEffect(() => {
    if (!image2) { img2Ref.current = null; return }
    const img = new Image()
    img.onload = () => { img2Ref.current = img; doRedraw() }
    img.src = image2
  }, [image2, doRedraw])

  // Redraw whenever layout or transforms change (sliders, toggle)
  useEffect(() => { doRedraw() }, [layout, transform1, transform2, doRedraw])

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
