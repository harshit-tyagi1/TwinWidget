import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Camera,
  Image as ImageIcon,
  FileText,
  Send,
  Smartphone,
  BookMarked,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
} from 'lucide-react';

import Header from './components/Header';
import PairingModal from './components/PairingModal';
import DrawingCanvas from './components/Studio/DrawingCanvas';
import CameraStudio from './components/Studio/CameraStudio';
import GalleryPicker from './components/Studio/GalleryPicker';
import NoteStudio from './components/Studio/NoteStudio';
import HomeScreenWidget from './components/Widget/HomeScreenWidget';
import Scrapbook from './components/Vault/Scrapbook';
import BiometricLock from './components/Security/BiometricLock';
import SettingsModal from './components/Settings/SettingsModal';

import { StorageService } from './services/storage';
import { syncRelay } from './services/syncRelay';
import {
  generatePairingSecret,
  importSecretKey,
  encryptPayload,
  decryptPayload,
  computeSafetyFingerprint,
} from './crypto/e2ee';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'widget', 'vault'
  const [studioMode, setStudioMode] = useState('draw'); // 'draw', 'camera', 'gallery', 'note'
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState(false);

  // Security & Crypto States
  const [pairingKey, setPairingKey] = useState(null);
  const [cryptoKeyObj, setCryptoKeyObj] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [safetyFingerprint, setSafetyFingerprint] = useState('');
  const [settings, setSettings] = useState(StorageService.getSettings());
  const [isLocked, setIsLocked] = useState(false);

  // Modals
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Studio Content References
  const canvasRef = useRef(null);
  const noteRef = useRef(null);
  const [cameraImage, setCameraImage] = useState(null);
  const [galleryImage, setGalleryImage] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  // Widget & Vault States
  const [widgetData, setWidgetData] = useState(StorageService.getWidgetCache());
  const [memories, setMemories] = useState(StorageService.getMemories());

  // Initialize App & Crypto Key on load
  useEffect(() => {
    const savedKey = StorageService.getPairingKey();
    const savedPartner = StorageService.getPartnerInfo();
    const savedSettings = StorageService.getSettings();

    setSettings(savedSettings);
    if (savedSettings.biometricLock) {
      setIsLocked(true);
    }

    if (savedPartner) {
      setPartnerInfo(savedPartner);
    }

    if (savedKey) {
      setPairingKey(savedKey);
      importSecretKey(savedKey)
        .then((kObj) => {
          setCryptoKeyObj(kObj);
          return computeSafetyFingerprint(savedKey);
        })
        .then(setSafetyFingerprint)
        .catch((err) => console.error('Key load error:', err));
    }
  }, []);

  // Configure Firebase Cloud Relay whenever settings or pairing key changes
  useEffect(() => {
    if (pairingKey && settings) {
      syncRelay.configureCloud(settings, pairingKey);
    }
  }, [pairingKey, settings]);

  // Subscribe to incoming encrypted sync payloads
  useEffect(() => {
    const unsubscribe = syncRelay.subscribe(async (encryptedBlob) => {
      if (!cryptoKeyObj) return;

      try {
        const decrypted = await decryptPayload(encryptedBlob, cryptoKeyObj);
        if (decrypted && decrypted.image) {
          const newWidget = {
            image: decrypted.image,
            sender: partnerInfo?.name || 'Partner',
            timestamp: decrypted.timestamp || Date.now(),
            type: decrypted.type || 'photo',
          };

          setWidgetData(newWidget);
          StorageService.setWidgetCache(newWidget);

          // Add to memory scrapbook
          const newMemory = {
            id: 'mem_' + Date.now(),
            image: decrypted.image,
            sender: partnerInfo?.name || 'Partner',
            timestamp: decrypted.timestamp || Date.now(),
            type: decrypted.type || 'photo',
          };
          const updated = StorageService.addMemory(newMemory);
          setMemories(updated);

          // Trigger subtle incoming notification
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
      } catch (err) {
        console.warn('Could not decrypt payload (mismatched key or corrupted):', err);
      }
    });

    return () => unsubscribe();
  }, [cryptoKeyObj, partnerInfo]);

  // Handle Saving New Pairing
  const handleSavePairing = async (rawKeyBase64, partner) => {
    setPairingKey(rawKeyBase64);
    setPartnerInfo(partner);
    StorageService.setPairingKey(rawKeyBase64);
    StorageService.setPartnerInfo(partner);

    const kObj = await importSecretKey(rawKeyBase64);
    setCryptoKeyObj(kObj);

    const fp = await computeSafetyFingerprint(rawKeyBase64);
    setSafetyFingerprint(fp);
  };

  // Handle Emergency Wipe
  const handleWipeData = () => {
    StorageService.wipeAllData();
    setPairingKey(null);
    setCryptoKeyObj(null);
    setPartnerInfo(null);
    setSafetyFingerprint('');
    setWidgetData(null);
    setMemories([]);
    setSettings(StorageService.getSettings());
  };

  // Convert current studio content to an image DataURL
  const getRenderedImageDataUrl = async () => {
    if (studioMode === 'draw') {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL('image/png') : null;
    } else if (studioMode === 'camera') {
      return cameraImage;
    } else if (studioMode === 'gallery') {
      return galleryImage;
    } else if (studioMode === 'note') {
      // Render sticky note to canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw decorative header
      ctx.fillStyle = '#fff';
      ctx.font = '24px Plus Jakarta Sans, sans-serif';
      ctx.fillText(selectedMood?.icon ? `${selectedMood.icon} ${selectedMood.label}` : '❤️ Thinking of you', 40, 60);

      // Draw text
      ctx.fillStyle = '#f8fafc';
      ctx.font = '36px Caveat, cursive, sans-serif';
      
      const words = (noteText || 'Sending love directly to your home screen!').split(' ');
      let line = '';
      let y = 140;
      const maxWidth = 520;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, 40, y);
          line = words[n] + ' ';
          y += 50;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 40, y);

      return canvas.toDataURL('image/png');
    }
    return null;
  };

  // SEND & ENCRYPT ACTION
  const handleSendToPartner = async () => {
    if (!cryptoKeyObj) {
      setShowPairingModal(true);
      return;
    }

    setIsSending(true);

    try {
      const imageDataUrl = await getRenderedImageDataUrl();
      if (!imageDataUrl) {
        alert('Please draw, take a photo, or write something first!');
        setIsSending(false);
        return;
      }

      // 1. Prepare Plaintext Payload
      const plainPayload = {
        image: imageDataUrl,
        sender: 'You',
        type: studioMode,
        timestamp: Date.now(),
      };

      // 2. Encrypt with AES-256-GCM locally
      const encryptedBlob = await encryptPayload(plainPayload, cryptoKeyObj);

      // 3. Broadcast to partner relay (local + Firebase cross-city)
      await syncRelay.broadcastEncrypted(encryptedBlob, settings, pairingKey);

      // 4. Update my own widget preview & local vault
      const newMemory = {
        id: 'mem_' + Date.now(),
        image: imageDataUrl,
        sender: 'You',
        timestamp: Date.now(),
        type: studioMode,
      };

      const updated = StorageService.addMemory(newMemory);
      setMemories(updated);
      setWidgetData({
        image: imageDataUrl,
        sender: 'You (Sent)',
        timestamp: Date.now(),
        type: studioMode,
      });
      StorageService.setWidgetCache({
        image: imageDataUrl,
        sender: 'You (Sent)',
        timestamp: Date.now(),
        type: studioMode,
      });

      // 5. Fire celebratory Confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981'],
      });

      // Show toast
      setSendSuccessToast(true);
      setTimeout(() => setSendSuccessToast(false), 2500);

      // Clean up inputs if camera/gallery
      if (studioMode === 'camera') setCameraImage(null);
      if (studioMode === 'gallery') setGalleryImage(null);
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send encrypted note: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Simulate receiving a demo partner message
  const handleSimulatePartnerMessage = async () => {
    if (!cryptoKeyObj) {
      setShowPairingModal(true);
      return;
    }

    // Generate a creative doodle
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#090A0F';
    ctx.fillRect(0, 0, 600, 600);

    // Draw glowing heart & text
    ctx.shadowColor = '#EC4899';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#EC4899';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Heart path
    ctx.beginPath();
    ctx.moveTo(300, 240);
    ctx.bezierCurveTo(300, 180, 220, 150, 180, 200);
    ctx.bezierCurveTo(120, 270, 220, 370, 300, 440);
    ctx.bezierCurveTo(380, 370, 480, 270, 420, 200);
    ctx.bezierCurveTo(380, 150, 300, 180, 300, 240);
    ctx.stroke();

    ctx.shadowColor = '#06B6D4';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '40px Caveat, cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Thinking of you! ✨', 300, 510);

    const demoDataUrl = canvas.toDataURL();
    const demoPayload = {
      image: demoDataUrl,
      sender: partnerInfo?.name || 'Partner',
      type: 'draw',
      timestamp: Date.now(),
    };

    const encrypted = await encryptPayload(demoPayload, cryptoKeyObj);
    await syncRelay.broadcastEncrypted(encrypted, settings, pairingKey);
  };

  if (isLocked) {
    return (
      <BiometricLock
        pinCode={settings.pinCode || '1234'}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className={`app-container ${settings.antiScreenshot ? 'anti-screenshot' : ''}`}>
      <div className="app-glow" />

      {/* Header */}
      <Header
        isPaired={!!pairingKey}
        partnerName={partnerInfo?.name}
        safetyNumber={safetyFingerprint}
        onOpenPairing={() => setShowPairingModal(true)}
        onOpenVault={() => setActiveTab('vault')}
        onOpenSettings={() => setShowSettingsModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Security Ribbon */}
      <div className={`security-ribbon ${!pairingKey ? 'unpaired' : ''}`}>
        {pairingKey ? (
          <>
            <ShieldCheck size={14} />
            <span>End-to-End Encrypted (AES-256-GCM) • Private Channel Active</span>
          </>
        ) : (
          <>
            <ShieldAlert size={14} />
            <span onClick={() => setShowPairingModal(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Pair your friend’s device to enable zero-knowledge encryption
            </span>
          </>
        )}
      </div>

      {/* Main Tab Navigation - Single Line */}
      <div className="nav-tab-bar">
        <button
          className={`nav-tab ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <PenTool size={15} />
          <span>Studio</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'widget' ? 'active' : ''}`}
          onClick={() => setActiveTab('widget')}
        >
          <Smartphone size={15} />
          <span>Widget</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <BookMarked size={15} />
          <span>Scrapbook ({memories.length})</span>
        </button>
      </div>

      {/* Toast Notification */}
      {sendSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--grad-primary)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-glow)',
            zIndex: 100,
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s',
          }}
        >
          <Sparkles size={16} />
          <span>Sent to {partnerInfo?.name || "friend"}'s home screen widget!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-content">
        {activeTab === 'studio' && (
          <div className="studio-container">
            {/* Mode Selector */}
            <div className="mode-selector">
              <button
                className={`mode-btn ${studioMode === 'draw' ? 'active' : ''}`}
                onClick={() => setStudioMode('draw')}
              >
                <div className="mode-icon-wrapper">
                  <PenTool size={16} />
                </div>
                <span>Draw</span>
              </button>

              <button
                className={`mode-btn ${studioMode === 'camera' ? 'active' : ''}`}
                onClick={() => setStudioMode('camera')}
              >
                <div className="mode-icon-wrapper">
                  <Camera size={16} />
                </div>
                <span>Camera</span>
              </button>

              <button
                className={`mode-btn ${studioMode === 'gallery' ? 'active' : ''}`}
                onClick={() => setStudioMode('gallery')}
              >
                <div className="mode-icon-wrapper">
                  <ImageIcon size={16} />
                </div>
                <span>Gallery</span>
              </button>

              <button
                className={`mode-btn ${studioMode === 'note' ? 'active' : ''}`}
                onClick={() => setStudioMode('note')}
              >
                <div className="mode-icon-wrapper">
                  <FileText size={16} />
                </div>
                <span>Note</span>
              </button>
            </div>

            {/* Studio Workspace */}
            <div className="studio-workspace">
              {studioMode === 'draw' && <DrawingCanvas canvasRef={canvasRef} />}

              {studioMode === 'camera' && (
                <CameraStudio
                  onPhotoCaptured={(img) => setCameraImage(img)}
                  capturedImage={cameraImage}
                  onRetake={() => setCameraImage(null)}
                />
              )}

              {studioMode === 'gallery' && (
                <GalleryPicker
                  selectedImage={galleryImage}
                  onImageSelected={(img) => setGalleryImage(img)}
                  onClear={() => setGalleryImage(null)}
                />
              )}

              {studioMode === 'note' && (
                <NoteStudio
                  noteRef={noteRef}
                  noteText={noteText}
                  setNoteText={setNoteText}
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  selectedMood={selectedMood}
                  setSelectedMood={setSelectedMood}
                />
              )}

              {/* Send Button */}
              <div className="studio-actions">
                <button
                  className="btn-primary"
                  onClick={handleSendToPartner}
                  disabled={isSending}
                >
                  <Send size={18} />
                  <span>
                    {isSending
                      ? 'Encrypting & Sending...'
                      : `Send to ${partnerInfo?.name ? partnerInfo.name + "'s" : 'Partner'} Widget`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'widget' && (
          <HomeScreenWidget
            widgetData={widgetData}
            partnerName={partnerInfo?.name}
            onTapToReply={() => setActiveTab('studio')}
            onSimulatePartnerMessage={handleSimulatePartnerMessage}
          />
        )}

        {activeTab === 'vault' && (
          <Scrapbook
            memories={memories}
            onDeleteMemory={(id) => {
              const updated = StorageService.deleteMemory(id);
              setMemories(updated);
            }}
            onSelectForReply={() => setActiveTab('studio')}
          />
        )}
      </main>

      {/* Modals */}
      <PairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        currentKey={pairingKey}
        partnerInfo={partnerInfo}
        onSavePairing={handleSavePairing}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          const updated = StorageService.updateSettings(newSettings);
          setSettings(updated);
        }}
        onWipeData={handleWipeData}
        currentKey={pairingKey}
        safetyFingerprint={safetyFingerprint}
      />
    </div>
  );
}
