import { useState, useRef } from 'react'
import ImageUploader from './components/ImageUploader.jsx'
import ImageControls from './components/ImageControls.jsx'
import CollageCanvas from './components/CollageCanvas.jsx'
import './App.css'

const DEFAULT_TRANSFORM = { scale: 1, x: 0, y: 0 }

export default function App() {
  const [image1, setImage1] = useState(null)
  const [image2, setImage2] = useState(null)
  const [layout, setLayout] = useState('side-by-side')
  const [transform1, setTransform1] = useState(DEFAULT_TRANSFORM)
  const [transform2, setTransform2] = useState(DEFAULT_TRANSFORM)
  const [activeSlot, setActiveSlot] = useState(null)
  const canvasRef = useRef(null)

  const isReady = image1 && image2

  const handleImage1 = (url) => { setImage1(url); setTransform1(DEFAULT_TRANSFORM) }
  const handleImage2 = (url) => { setImage2(url); setTransform2(DEFAULT_TRANSFORM) }

  const handleSlotClick = (slot) => {
    // Tapping the already-active slot keeps it open; tapping the other switches
    setActiveSlot(slot)
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header__logo">
          <svg viewBox="0 0 36 36" fill="none" className="header__logo-svg">
            <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
            <rect x="4" y="4" width="12" height="28" rx="5" fill="white" opacity="0.9"/>
            <rect x="20" y="4" width="12" height="28" rx="5" fill="white" opacity="0.6"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#c084fc"/>
                <stop offset="100%" stopColor="#818cf8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="header__title-wrap">
          <h1 className="header__title">Picturette</h1>
          <p className="header__subtitle">two photos, one collage</p>
        </div>
      </header>

      <main className="main">
        {/* ── Upload ── */}
        <section className="section" aria-label="Upload photos">
          <h2 className="section__label">Upload your photos</h2>
          <div className="uploaders">
            <ImageUploader label="Photo 1" image={image1} onImage={handleImage1} slot={1} />
            <div className="uploaders__divider" aria-hidden="true"><span>+</span></div>
            <ImageUploader label="Photo 2" image={image2} onImage={handleImage2} slot={2} />
          </div>
        </section>

        {/* ── Layout toggle ── */}
        <section className="section" aria-label="Choose layout">
          <h2 className="section__label">Layout</h2>
          <div className="layout-toggle clay" role="radiogroup" aria-label="Collage layout">
            <button
              className={`layout-btn ${layout === 'side-by-side' ? 'layout-btn--active' : ''}`}
              onClick={() => setLayout('side-by-side')}
              role="radio" aria-checked={layout === 'side-by-side'}
            >
              <svg viewBox="0 0 40 28" fill="none" className="layout-btn__icon">
                <rect x="1" y="1" width="17" height="26" rx="4" stroke="currentColor" strokeWidth="2"/>
                <rect x="22" y="1" width="17" height="26" rx="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Side by side
            </button>
            <button
              className={`layout-btn ${layout === 'stacked' ? 'layout-btn--active' : ''}`}
              onClick={() => setLayout('stacked')}
              role="radio" aria-checked={layout === 'stacked'}
            >
              <svg viewBox="0 0 28 40" fill="none" className="layout-btn__icon layout-btn__icon--tall">
                <rect x="1" y="1" width="26" height="17" rx="4" stroke="currentColor" strokeWidth="2"/>
                <rect x="1" y="22" width="26" height="17" rx="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Stacked
            </button>
          </div>
        </section>

        {/* ── Preview + edit panel ── */}
        <section className="section" aria-label="Collage preview">
          <h2 className="section__label">
            {isReady && !activeSlot ? 'Preview — tap a photo to adjust' : 'Preview'}
          </h2>

          <div className="clay preview-card">
            <CollageCanvas
              ref={canvasRef}
              image1={image1}
              image2={image2}
              layout={layout}
              transform1={transform1}
              transform2={transform2}
              activeSlot={activeSlot}
              onSlotClick={isReady ? handleSlotClick : undefined}
            />
          </div>

          {/* Sliding edit panel — always mounted so the transition animates */}
          <div className={`edit-panel ${activeSlot ? 'edit-panel--open' : ''}`}>
            <div className="edit-panel__inner">
              {activeSlot && (
                <ImageControls
                  slot={activeSlot}
                  transform={activeSlot === 1 ? transform1 : transform2}
                  onChange={activeSlot === 1 ? setTransform1 : setTransform2}
                  onClose={() => setActiveSlot(null)}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── Download ── */}
        <button
          className={`download-btn clay ${isReady ? 'download-btn--ready' : 'download-btn--disabled'}`}
          onClick={() => isReady && canvasRef.current?.download()}
          disabled={!isReady}
          aria-disabled={!isReady}
        >
          <svg viewBox="0 0 24 24" fill="none" className="download-btn__icon">
            <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          {isReady ? 'Download collage' : 'Upload both photos to download'}
        </button>
      </main>

      <footer className="footer">
        made with ♥ · picturette
      </footer>
    </div>
  )
}
