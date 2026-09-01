import React, { useState, useRef, useEffect } from 'react';
import { Pipette, X, Plus, Check } from 'lucide-react';

// iOS-style standard 120-color grid
const COLOR_GRID = [
  // Row 1: Grayscale
  ['#FFFFFF', '#EBEBEB', '#D6D6D6', '#C2C2C2', '#ADADAD', '#999999', '#858585', '#707070', '#5C5C5C', '#474747', '#333333', '#000000'],
  // Row 2: Deep Dark Shades
  ['#001F3F', '#003366', '#1B1F38', '#2D132C', '#3A0D0D', '#4A1C00', '#4A3B00', '#3E4200', '#203B0C', '#0E3B20', '#0D3834', '#0C2C3E'],
  // Row 3: Rich Primary/Secondary Shades
  ['#004080', '#0059B3', '#3F2B96', '#66105A', '#801111', '#993D00', '#997A00', '#7E8500', '#427A18', '#1D7A42', '#1B736B', '#195B80'],
  // Row 4: Deep Jewel Tones
  ['#0055A5', '#0073E6', '#593BBF', '#8C1B7D', '#B31B1B', '#CC5200', '#CCA300', '#A8B300', '#59A321', '#28A359', '#24998E', '#217AAC'],
  // Row 5: Vibrant Spectrum
  ['#0074D9', '#1B88F5', '#7852FF', '#B829A4', '#E62424', '#FF6600', '#FFCC00', '#D4E600', '#70CC29', '#33CC70', '#2EC4B6', '#2A9BD9'],
  // Row 6: Bright Vivid
  ['#1E90FF', '#4DA3FF', '#9975FF', '#D941C4', '#FF4D4D', '#FF8533', '#FFD633', '#E0F033', '#8AE048', '#4DE088', '#45D6C8', '#47B5FF'],
  // Row 7: Medium Pastels
  ['#66B2FF', '#80BFFF', '#B299FF', '#E673D6', '#FF8080', '#FFA366', '#FFE066', '#EBFA66', '#A6EB6E', '#70EB9F', '#6EE0D5', '#73CAFF'],
  // Row 8: Soft Pastels
  ['#99CCFF', '#B3D9FF', '#CCBFFF', '#F0A6E4', '#FFA6A6', '#FFBF99', '#FFEB99', '#F2FC99', '#C2F294', '#99F2BC', '#99EBE3', '#99DAFF'],
  // Row 9: Light Pastels
  ['#CCE5FF', '#D9ECFF', '#E5DFFF', '#F7CCF0', '#FFCCCC', '#FFD9CC', '#FFF5CC', '#F9FFCC', '#DDFAB9', '#C2F7D6', '#C2F5EF', '#CCEFFF'],
  // Row 10: Ultra Light Tint
  ['#EBF5FF', '#F2F8FF', '#F5F2FF', '#FBEDF8', '#FFEBEB', '#FFF0EB', '#FFFAEB', '#FDFFEB', '#F0FDE0', '#E5FCED', '#E5FAF8', '#EBF7FF']
];

export default function ColorPickerModal({
  isOpen,
  onClose,
  currentColor,
  onColorChange,
  opacity = 1,
  onOpacityChange
}) {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'spectrum', 'slide'
  const [savedPalette, setSavedPalette] = useState(() => {
    try {
      const saved = localStorage.getItem('twinwidget_custom_palette');
      return saved ? JSON.parse(saved) : ['#EDE8E4', '#010101', '#1E90FF', '#00CC66', '#FFD700', '#FF3B30'];
    } catch {
      return ['#EDE8E4', '#010101', '#1E90FF', '#00CC66', '#FFD700', '#FF3B30'];
    }
  });

  const spectrumCanvasRef = useRef(null);
  const [isDraggingSpectrum, setIsDraggingSpectrum] = useState(false);

  // RGB / Hex State for Sliders Tab
  const [rgb, setRgb] = useState({ r: 237, g: 232, b: 228 });
  const [hexInput, setHexInput] = useState(currentColor);

  // Sync internal RGB whenever currentColor changes
  useEffect(() => {
    const parsed = hexToRgb(currentColor);
    if (parsed) {
      setRgb(parsed);
      setHexInput(currentColor.toUpperCase());
    }
  }, [currentColor]);

  // Save Palette to LocalStorage
  const saveColorToPalette = () => {
    if (!savedPalette.includes(currentColor)) {
      const updated = [currentColor, ...savedPalette.slice(0, 11)];
      setSavedPalette(updated);
      localStorage.setItem('twinwidget_custom_palette', JSON.stringify(updated));
    }
  };

  // Eyedropper Tool
  const handleEyeDropper = async () => {
    if (window.EyeDropper) {
      try {
        const dropper = new window.EyeDropper();
        const result = await dropper.open();
        if (result?.sRGBHex) {
          onColorChange(result.sRGBHex);
        }
      } catch (err) {
        console.log('EyeDropper cancelled');
      }
    } else {
      alert('EyeDropper is supported on Chrome/Edge and Android mobile browsers.');
    }
  };

  // Draw 2D Spectrum
  useEffect(() => {
    if (!isOpen || activeTab !== 'spectrum') return;
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Horizontal Hue Gradient
    const hueGrad = ctx.createLinearGradient(0, 0, width, 0);
    hueGrad.addColorStop(0, '#FF0000');
    hueGrad.addColorStop(0.17, '#FFFF00');
    hueGrad.addColorStop(0.33, '#00FF00');
    hueGrad.addColorStop(0.5, '#00FFFF');
    hueGrad.addColorStop(0.67, '#0000FF');
    hueGrad.addColorStop(0.83, '#FF00FF');
    hueGrad.addColorStop(1, '#FF0000');
    ctx.fillStyle = hueGrad;
    ctx.fillRect(0, 0, width, height);

    // Vertical Saturation/Brightness (White to Transparent to Black)
    const whiteGrad = ctx.createLinearGradient(0, 0, 0, height / 2);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height / 2);

    const blackGrad = ctx.createLinearGradient(0, height / 2, 0, height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, height / 2, width, height / 2);
  }, [isOpen, activeTab]);

  const handleSpectrumClick = (e) => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, (e.clientX || (e.touches && e.touches[0].clientX) - rect.left) * (canvas.width / rect.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, (e.clientY || (e.touches && e.touches[0].clientY) - rect.top) * (canvas.height / rect.height)));

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    onColorChange(hex);
  };

  const handleRgbSlider = (channel, val) => {
    const updated = { ...rgb, [channel]: Number(val) };
    setRgb(updated);
    const hex = rgbToHex(updated.r, updated.g, updated.b);
    setHexInput(hex);
    onColorChange(hex);
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onColorChange(val);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card ios-color-picker-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '380px', padding: '16px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button
            onClick={handleEyeDropper}
            className="icon-btn"
            style={{ width: '32px', height: '32px' }}
            title="Pick color from screen"
          >
            <Pipette size={16} />
          </button>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'lowercase', letterSpacing: '0.04em', margin: 0 }}>
            Colors
          </h3>

          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher: Grid | Spectrum | Slide */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--bg-glass-border)',
            marginBottom: '14px',
          }}
        >
          {['grid', 'spectrum', 'slide'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '7px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'lowercase',
                background: activeTab === tab ? 'var(--accent-bone)' : 'transparent',
                color: activeTab === tab ? '#010101' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Grid Mode */}
        {activeTab === 'grid' && (
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${COLOR_GRID.length}, 1fr)`,
              gap: '2px',
              background: '#1a1a1a',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid var(--bg-glass-border)',
              marginBottom: '14px',
            }}
          >
            {COLOR_GRID.map((row, rIdx) => (
              <div
                key={rIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${row.length}, 1fr)`,
                  gap: '2px',
                }}
              >
                {row.map((c, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => onColorChange(c)}
                    style={{
                      aspectRatio: '1/1',
                      backgroundColor: c,
                      border: currentColor.toLowerCase() === c.toLowerCase() ? '2px solid #FFFFFF' : 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      boxShadow: currentColor.toLowerCase() === c.toLowerCase() ? '0 0 6px rgba(255,255,255,0.8)' : 'none',
                      transform: currentColor.toLowerCase() === c.toLowerCase() ? 'scale(1.15)' : 'none',
                      zIndex: currentColor.toLowerCase() === c.toLowerCase() ? 2 : 1,
                      transition: 'transform 0.1s ease',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Spectrum Mode */}
        {activeTab === 'spectrum' && (
          <div style={{ marginBottom: '14px' }}>
            <canvas
              ref={spectrumCanvasRef}
              width={320}
              height={200}
              onClick={handleSpectrumClick}
              onTouchStart={() => setIsDraggingSpectrum(true)}
              onTouchMove={(e) => isDraggingSpectrum && handleSpectrumClick(e)}
              onTouchEnd={() => setIsDraggingSpectrum(false)}
              onMouseDown={() => setIsDraggingSpectrum(true)}
              onMouseMove={(e) => isDraggingSpectrum && handleSpectrumClick(e)}
              onMouseUp={() => setIsDraggingSpectrum(false)}
              style={{
                width: '100%',
                height: '180px',
                borderRadius: '12px',
                border: '1px solid var(--bg-glass-border)',
                cursor: 'crosshair',
                touchAction: 'none',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Tab 3: Sliders Mode */}
        {activeTab === 'slide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {/* Red */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '40px', fontSize: '0.75rem', fontWeight: 700, color: '#FF4D4D' }}>R</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbSlider('r', e.target.value)}
                style={{ flex: 1, accentColor: '#FF4D4D' }}
              />
              <span style={{ width: '35px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rgb.r}</span>
            </div>

            {/* Green */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '40px', fontSize: '0.75rem', fontWeight: 700, color: '#33CC70' }}>G</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbSlider('g', e.target.value)}
                style={{ flex: 1, accentColor: '#33CC70' }}
              />
              <span style={{ width: '35px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rgb.g}</span>
            </div>

            {/* Blue */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '40px', fontSize: '0.75rem', fontWeight: 700, color: '#1E90FF' }}>B</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbSlider('b', e.target.value)}
                style={{ flex: 1, accentColor: '#1E90FF' }}
              />
              <span style={{ width: '35px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rgb.b}</span>
            </div>

            {/* HEX Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HEX:</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                style={{
                  flex: 1,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                }}
              />
            </div>
          </div>
        )}

        {/* Opacity Slider */}
        <div style={{ marginTop: '6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Opacity
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {Math.round((opacity || 1) * 100)}%
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              height: '18px',
              borderRadius: '9px',
              background: `
                linear-gradient(to right, transparent, ${currentColor}),
                repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px
              `,
              border: '1px solid var(--bg-glass-border)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 2px',
            }}
          >
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={opacity || 1}
              onChange={(e) => onOpacityChange && onOpacityChange(Number(e.target.value))}
              style={{
                width: '100%',
                opacity: 0,
                cursor: 'pointer',
                position: 'absolute',
                zIndex: 5,
              }}
            />
            {/* Visual Thumb Indicator */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${((opacity || 1) - 0.1) / 0.9 * 94}% )`,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: currentColor,
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--bg-glass-border)', margin: '10px 0' }} />

        {/* Bottom Swatches & Favorites Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Current Big Color Preview */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: currentColor,
              border: '2px solid var(--bg-glass-border)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}
          />

          {/* Palette Favorites Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1, padding: '4px 0' }}>
            {savedPalette.map((col, idx) => (
              <button
                key={idx}
                onClick={() => onColorChange(col)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: col,
                  border: currentColor.toLowerCase() === col.toLowerCase() ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transform: currentColor.toLowerCase() === col.toLowerCase() ? 'scale(1.15)' : 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              />
            ))}

            {/* Add to palette button */}
            <button
              onClick={saveColorToPalette}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--bg-glass-border)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Save current color to favorites"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}
