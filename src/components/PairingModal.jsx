import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Key, Copy, Check, ShieldCheck, RefreshCw, Smartphone, UserCheck, AlertTriangle } from 'lucide-react';
import { generatePairingSecret, computeSafetyFingerprint, importSecretKey } from '../crypto/e2ee';

export default function PairingModal({
  isOpen,
  onClose,
  currentKey,
  partnerInfo,
  onSavePairing,
}) {
  const [activeSubTab, setActiveSubTab] = useState('qr'); // 'qr' or 'join'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [partnerName, setPartnerName] = useState(partnerInfo?.name || '');
  const [safetyFingerprint, setSafetyFingerprint] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generate QR code when currentKey changes
  useEffect(() => {
    if (currentKey) {
      const payload = JSON.stringify({
        app: 'twinwidget-e2ee',
        key: currentKey,
        created: Date.now(),
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#090A0F',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error', err));

      computeSafetyFingerprint(currentKey).then(setSafetyFingerprint);
    }
  }, [currentKey]);

  if (!isOpen) return null;

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const { rawBase64 } = await generatePairingSecret();
      const fp = await computeSafetyFingerprint(rawBase64);
      setSafetyFingerprint(fp);
      onSavePairing(rawBase64, { name: partnerName || 'Bestie' });
    } catch (err) {
      setErrorMsg('Failed to generate secure cryptographic key: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImportKey = async () => {
    setErrorMsg('');
    if (!inputKey.trim()) {
      setErrorMsg('Please paste your friend’s cryptographic key or QR payload');
      return;
    }

    try {
      let keyToImport = inputKey.trim();

      // Check if it's JSON from a scanned QR
      if (keyToImport.startsWith('{') && keyToImport.endsWith('}')) {
        const parsed = JSON.parse(keyToImport);
        if (parsed.key) keyToImport = parsed.key;
      }

      // Verify that this key imports correctly into WebCrypto
      await importSecretKey(keyToImport);

      onSavePairing(keyToImport, { name: partnerName.trim() || 'My Friend' });
      onClose();
    } catch (err) {
      setErrorMsg('Invalid encryption key. Please ensure you copied the complete code.');
    }
  };

  const handleQuickDemoPairing = async () => {
    // Generate a universal demo key for instant multi-tab testing
    const demoKey = '4Wk8bZfQJ7G1eT2mN9pX5sV3yR0uA6dC8hL1jK4vB7g=';
    onSavePairing(demoKey, { name: partnerName || 'Alex' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <ShieldCheck className="text-emerald-400" size={24} color="#10B981" />
            <span>Device Pairing Ceremony</span>
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Pair your phone with your friend’s phone to establish a private <strong>AES-256-GCM End-to-End Encrypted</strong> channel.
        </p>

        {/* Sub Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`tool-chip ${activeSubTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('qr')}
          >
            <QrCode size={15} /> Show My QR
          </button>
          <button
            className={`tool-chip ${activeSubTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('join')}
          >
            <Key size={15} /> Enter Friend's Key
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--accent-rose)',
              color: '#fda4af',
              fontSize: '0.8rem',
              marginBottom: '14px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeSubTab === 'qr' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Friend’s Name / Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Maya or Alex"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {currentKey && qrDataUrl ? (
              <div style={{ textAlign: 'center' }}>
                <div className="qr-box">
                  <img src={qrDataUrl} alt="Pairing QR Code" style={{ width: '210px', height: '210px', display: 'block' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Have your friend scan this QR or copy the private key below:
                </p>

                <div className="key-phrase-box" style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.72rem' }}>{currentKey}</span>
                  <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={handleCopyKey}>
                    {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>

                {safetyFingerprint && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Cryptographic Safety Fingerprint
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {safetyFingerprint}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button className="btn-primary" onClick={handleGenerateNew} disabled={isGenerating}>
                  <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                  <span>Generate New Pairing Certificate</span>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleGenerateNew}>
                <RefreshCw size={14} /> New Key
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                onClick={handleQuickDemoPairing}
              >
                <UserCheck size={14} /> Quick Demo Pair
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'join' && (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Friend's Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jordan"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Paste Friend's Key / Scanned QR Payload
              </label>
              <textarea
                rows={3}
                placeholder="Paste key here..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  resize: 'none',
                }}
              />
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={handleImportKey}>
              <Key size={16} />
              <span>Link Encrypted Channel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
