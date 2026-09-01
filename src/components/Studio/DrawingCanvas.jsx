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
  Layers,
} from 'lucide-react';

const COLORS = [
  '#FFFFFF', // Pure White
  '#EDE8E4', // Champagne Bone
  '#D4CECA', // Warm Linen
  '#9E9893', // Taupe Gray
  '#676767', // Charcoal Slate
  '#3A3A3A', // Graphite
  '#C28E95', // Vintage Rose
  '#9EBAA8', // Dusty Sage
  '#C9A87C', // Warm Amber Ochre
  '#7A4B56', // Fine-Art Wine
];

const BACKGROUNDS = [
  { id: 'black', label: 'Velvet Obsidian', value: '#010101' },
  { id: 'indigo', label: 'Studio Noir', value: '#141414' },
  { id: 'linen', label: 'Warm Silk', value: 'linen' },
  { id: 'grid', label: 'Editorial Grid', value: 'grid' },
  { id: 'dots', label: 'Fine Dots', value: 'dots' },
];

export default function DrawingCanvas({ onReady, canvasRef }) {
  const localRef = useRef(null);
  const activeCanvas = canvasRef || localRef;

  const [tool, setTool] = useState('neon'); // 'pen', 'brush', 'neon', 'highlighter', 'eraser'
  const [color, setColor] = useState('#EDE8E4');
  const [lineWidth, setLineWidth] = useState(6);
  const [bgStyle, setBgStyle] = useState('black');
  
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
    } else if (bg === 'indigo') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bg === 'linen') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#242220');
      grad.addColorStop(0.5, '#191817');
      grad.addColorStop(1, '#0e0e0d');
      ctx.fillStyle = grad;
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

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = bgStyle === 'black' ? '#000000' : '#0d1117';
      ctx.fillStyle = bgStyle === 'black' ? '#000000' : '#0d1117';
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
      ctx.globalAlpha = 0.35;
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

      <div className="drawing-toolbar" style={{ marginTop: '12px' }}>
        {/* Tool Selector */}
        <div className="tool-row">
          <button
            className={`tool-chip ${tool === 'neon' ? 'active' : ''}`}
            onClick={() => setTool('neon')}
          >
            <Sparkles size={14} /> Neon Glow
          </button>
          <button
            className={`tool-chip ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
          >
            <PenTool size={14} /> Pen
          </button>
          <button
            className={`tool-chip ${tool === 'highlighter' ? 'active' : ''}`}
            onClick={() => setTool('highlighter')}
          >
            <Highlighter size={14} /> Marker
          </button>
          <button
            className={`tool-chip ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
          >
            <Eraser size={14} /> Eraser
          </button>
        </div>

        {/* Color Palette */}
        {tool !== 'eraser' && (
          <div className="color-palette">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-dot ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        )}

        {/* Brush Size & History Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="size-slider-row" style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size</span>
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
                width: `${Math.min(22, lineWidth)}px`,
                height: `${Math.min(22, lineWidth)}px`,
                backgroundColor: color,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="icon-btn" onClick={undo} disabled={history.length <= 1} title="Undo">
              <RotateCcw size={14} />
            </button>
            <button className="icon-btn" onClick={redo} disabled={redoList.length === 0} title="Redo">
              <RotateCw size={14} />
            </button>
            <button className="icon-btn" onClick={clearCanvas} title="Clear Canvas">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Canvas Background Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '4px' }}>Paper:</span>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBgChange(b.id)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                border: bgStyle === b.id ? '1px solid var(--accent-purple)' : '1px solid var(--bg-glass-border)',
                background: bgStyle === b.id ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-secondary)',
                color: bgStyle === b.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
