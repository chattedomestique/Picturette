import './ImageControls.css'

const DEFAULT = { scale: 1, x: 0, y: 0 }

export default function ImageControls({ transform, onChange, onClose, slot }) {
  const { scale, x, y } = transform
  const set = (key, val) => onChange({ ...transform, [key]: val })
  const accent = slot === 1 ? 'controls--left' : 'controls--right'

  return (
    <div className={`controls clay ${accent}`}>
      <div className="controls__header">
        <span className="controls__title">Editing photo {slot}</span>
        <div className="controls__actions">
          <button className="controls__reset" onClick={() => onChange(DEFAULT)}>
            Reset
          </button>
          <button className="controls__close" onClick={onClose} aria-label="Close editor">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="controls__rows">
        {/* Zoom */}
        <div className="controls__row">
          <span className="controls__icon" title="Zoom">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8.5 6v5M6 8.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="range" min="0.5" max="3" step="0.01"
            value={scale}
            onChange={e => set('scale', +e.target.value)}
            className={`controls__range ${accent}`}
            aria-label="Zoom"
          />
          <span className="controls__value">{scale.toFixed(1)}×</span>
        </div>

        {/* Horizontal pan */}
        <div className="controls__row">
          <span className="controls__icon" title="Move left / right">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 10h14M3 10l3-3M3 10l3 3M17 10l-3-3M17 10l-3 3"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            type="range" min="-0.5" max="0.5" step="0.005"
            value={x}
            onChange={e => set('x', +e.target.value)}
            className={`controls__range ${accent}`}
            aria-label="Horizontal position"
          />
        </div>

        {/* Vertical pan */}
        <div className="controls__row">
          <span className="controls__icon" title="Move up / down">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 3v14M10 3L7 6M10 3l3 3M10 17l-3-3M10 17l3-3"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            type="range" min="-0.5" max="0.5" step="0.005"
            value={y}
            onChange={e => set('y', +e.target.value)}
            className={`controls__range ${accent}`}
            aria-label="Vertical position"
          />
        </div>
      </div>
    </div>
  )
}
