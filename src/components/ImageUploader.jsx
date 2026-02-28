import { useRef, useState, useCallback } from 'react'
import './ImageUploader.css'

export default function ImageUploader({ label, image, onImage, slot }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImage(e.target.result)
    reader.readAsDataURL(file)
  }, [onImage])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }, [loadFile])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleClick = () => inputRef.current?.click()
  const handleChange = (e) => loadFile(e.target.files[0])

  const accentClass = slot === 1 ? 'uploader--left' : 'uploader--right'

  return (
    <div
      className={`uploader clay ${accentClass} ${dragging ? 'uploader--dragging' : ''}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="uploader__input"
        onChange={handleChange}
      />

      {image ? (
        <div className="uploader__preview">
          <img src={image} alt={label} className="uploader__img" />
          <div className="uploader__overlay">
            <span className="uploader__replace-icon">↺</span>
            <span className="uploader__replace-text">Replace</span>
          </div>
        </div>
      ) : (
        <div className="uploader__empty">
          <div className="uploader__icon-wrap">
            <svg className="uploader__icon" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="8" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="17" cy="20" r="4" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 16v8M28 20h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="uploader__label">{label}</p>
          <p className="uploader__hint">click or drag &amp; drop</p>
        </div>
      )}
    </div>
  )
}
