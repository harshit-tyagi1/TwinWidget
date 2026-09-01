import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Paintbrush,
  Sparkles,
  Highlighter,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Palette,
} from 'lucide-react';
import ColorPickerModal from './ColorPickerModal';

const BACKGROUNDS = [
  { id: 'black', label: 'Velvet Obsidian', value: '#010101' },
  { id: 'grid', label: 'Editorial Grid', value: 'grid' },
  { id: 'dots', label: 'Fine Dots', value: 'dots' },
];

export default function DrawingCanvas({ onReady, canvasRef }) {
  const localRef = useRef(null);
  const activeCanvas = canvasRef || localRef;

  const [tool, setTool] = useState('neon'); // 'pen', 'brush', 'neon', 'highlighter', 'eraser'
  const [color, setColor] = useState('#EDE8E4');
  const [opacity, setOpacity] = useState(1);
  const [lineWidth, setLineWidth] = useState(6);
  const [bgStyle, setBgStyle] = useState('black');
  
  const [showColorModal, setShowColorModal] = useState(false);

  const [history, setHistory] = useState([]);
  const [redoList, setRedoList] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Initialize Canvas
  useEffect(() => {
    const canvas = activeCanvas.current;
    if (!canvas) return;

    // High DPI / Retina support
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    
    redrawBackground(canvas, bgStyle);
    saveState();
  }, []);

  const redrawBackground = (canvas, bg) => {
    const ctx = canvas.getContext('2d');
    ctx.save();
    
    if (bg === 'black') {
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bg === 'grid') {
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(237,232,228,0.08)';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (bg === 'dots') {
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(237,232,228,0.2)';
      const step = 25;
      for (let x = 12; x < canvas.width; x += step) {
        for (let y = 12; y < canvas.height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  const saveState = () => {
    const canvas = activeCanvas.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-20), dataUrl]);
    setRedoList([]);
  };

  const handleBgChange = (newBg) => {
    setBgStyle(newBg);
    const canvas = activeCanvas.current;
    if (!canvas) return;
    redrawBackground(canvas, newBg);
    saveState();
  };

  // Get coordinates relative to canvas
  const getCoordinates = (e) => {
    const canvas = activeCanvas.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    lastPoint.current = coords;
    setIsDrawing(true);

    const canvas = activeCanvas.current;
    const ctx = canvas.getContext('2d');
    setupContext(ctx);

    // Draw single dot on tap
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = activeCanvas.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    setupContext(ctx);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPoint.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const setupContext = (ctx) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#010101';
      ctx.fillStyle = '#010101';
      ctx.lineWidth = lineWidth * 2.5;
      ctx.shadowBlur = 0;
    } else if (tool === 'neon') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = lineWidth * 2.8;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity * 0.35;
      ctx.lineWidth = lineWidth * 2.2;
      ctx.shadowBlur = 0;
    } else if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth * 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
    } else {
      // Pen
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 0;
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = activeCanvas.current;
    const ctx = canvas.getContext('2d');
    const newHistory = [...history];
    const popped = newHistory.pop();
    setRedoList((prev) => [...prev, popped]);
    setHistory(newHistory);

    const prevImg = new Image();
    prevImg.src = newHistory[newHistory.length - 1];
    prevImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(prevImg, 0, 0);
    };
  };

  const redo = () => {
    if (redoList.length === 0) return;
    const canvas = activeCanvas.current;
    const ctx = canvas.getContext('2d');
    const newRedo = [...redoList];
    const restored = newRedo.pop();
    setRedoList(newRedo);
    setHistory((prev) => [...prev, restored]);

    const img = new Image();
    img.src = restored;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = activeCanvas.current;
    if (!canvas) return;
    redrawBackground(canvas, bgStyle);
    saveState();
  };

  return (
    <div className="drawing-studio">
      <div className="canvas-wrapper">
        <canvas
          ref={activeCanvas}
          className="main-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="drawing-toolbar" style={{ marginTop: '10px' }}>
        {/* Tool Row + Rainbow Color Picker Trigger Button */}
        <div className="tool-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={`tool-chip ${tool === 'neon' ? 'active' : ''}`}
            onClick={() => setTool('neon')}
          >
            <Sparkles size={13} /> <span>Neon Glow</span>
          </button>
          <button
            className={`tool-chip ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
          >
            <PenTool size={13} /> <span>Pen</span>
          </button>
          <button
            className={`tool-chip ${tool === 'highlighter' ? 'active' : ''}`}
            onClick={() => setTool('highlighter')}
          >
            <Highlighter size={13} /> <span>Marker</span>
          </button>
          <button
            className={`tool-chip ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
          >
            <Eraser size={13} /> <span>Eraser</span>
          </button>

          {/* Rainbow Color Picker Button (As shown in reference image) */}
          <button
            onClick={() => setShowColorModal(true)}
            className="rainbow-color-btn"
            title="Open Color Palette"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              padding: '3px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1.5px solid #000000',
                  boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
                }}
              />
            </div>
          </button>
        </div>

        {/* Brush Size & History Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
          <div className="size-slider-row" style={{ flex: 1 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Size</span>
            <input
              type="range"
              min="2"
              max="30"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="size-slider"
            />
            <div
              className="size-preview-dot"
              style={{
                width: `${Math.min(20, lineWidth)}px`,
                height: `${Math.min(20, lineWidth)}px`,
                backgroundColor: color,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="icon-btn" onClick={undo} disabled={history.length <= 1} title="Undo">
              <RotateCcw size={13} />
            </button>
            <button className="icon-btn" onClick={redo} disabled={redoList.length === 0} title="Redo">
              <RotateCw size={13} />
            </button>
            <button className="icon-btn" onClick={clearCanvas} title="Clear Canvas">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Canvas Background Presets - ONLY 3 Options in 1 line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '2px', whiteSpace: 'nowrap' }}>Paper:</span>
          <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBgChange(b.id)}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  border: bgStyle === b.id ? '1px solid var(--accent-bone)' : '1px solid var(--bg-glass-border)',
                  background: bgStyle === b.id ? 'var(--accent-bone)' : 'var(--bg-secondary)',
                  color: bgStyle === b.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* iOS-Style Full Color Picker Modal */}
      <ColorPickerModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        currentColor={color}
        onColorChange={(newCol) => setColor(newCol)}
        opacity={opacity}
        onOpacityChange={(newOp) => setOpacity(newOp)}
      />
    </div>
  );
}
