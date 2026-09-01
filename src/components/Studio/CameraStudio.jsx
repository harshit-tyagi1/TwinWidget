import React, { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera, RefreshCw, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function CameraStudio({ onPhotoCaptured, capturedImage, onRetake }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [facingMode, capturedImage]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 },
          aspectRatio: 1,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Flash animation
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Square crop from video center
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    // Flip if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onPhotoCaptured(dataUrl);
  };

  const handleFileUploadFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onPhotoCaptured(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-studio">
      <div className="camera-container" style={{ position: 'relative' }}>
        {isFlashActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              zIndex: 30,
              opacity: 0.9,
              transition: 'opacity 0.2s',
            }}
          />
        )}

        {capturedImage ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {caption && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  padding: '8px 14px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {caption}
              </div>
            )}
          </div>
        ) : hasPermission === false ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertCircle size={40} color="#F59E0B" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: 'white', marginBottom: '6px' }}>Camera Permission Needed</h4>
            <p style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
              Allow camera permissions in browser or select a photo directly from your device:
            </p>
            <label className="btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <Camera size={16} />
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUploadFallback}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            <div className="camera-controls-overlay">
              <button className="icon-btn" onClick={toggleFacingMode} title="Flip Camera">
                <SwitchCamera size={20} />
              </button>

              <button className="shutter-btn" onClick={capturePhoto} title="Take Photo" />

              <label className="icon-btn" style={{ cursor: 'pointer' }} title="Upload Image">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFallback}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </>
        )}
      </div>

      {capturedImage && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            placeholder="Add a sweet caption (optional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              fontSize: '0.88rem',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onRetake}>
              <RefreshCw size={14} /> Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
