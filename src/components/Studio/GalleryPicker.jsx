import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, RotateCw, ZoomIn, Sparkles, Check } from 'lucide-react';

export default function GalleryPicker({ onImageSelected, selectedImage, onClear }) {
  const fileInputRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelected(event.target.result);
      setRotation(0);
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = () => {
    setScale((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  return (
    <div className="gallery-picker-studio">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div
        className="canvas-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090a0f',
          cursor: selectedImage ? 'default' : 'pointer',
        }}
        onClick={() => !selectedImage && fileInputRef.current?.click()}
      >
        {selectedImage ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={selectedImage}
              alt="Selected"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `rotate(${rotation}deg) scale(${scale})`,
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                color: 'var(--accent-purple)',
              }}
            >
              <Upload size={28} />
            </div>
            <h4 style={{ color: 'white', marginBottom: '4px', fontSize: '0.95rem' }}>Select From Gallery</h4>
            <p style={{ fontSize: '0.78rem' }}>Tap here to pick any photo or memory from your device</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={handleRotate}>
            <RotateCw size={14} /> Rotate
          </button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={handleZoom}>
            <ZoomIn size={14} /> Zoom ({scale}x)
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon size={14} /> Change
          </button>
        </div>
      )}
    </div>
  );
}
