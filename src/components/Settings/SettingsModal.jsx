import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Lock,
  EyeOff,
  Cloud,
  Trash2,
  Check,
  AlertTriangle,
  Key,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onWipeData,
  currentKey,
  safetyFingerprint,
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('privacy'); // 'privacy', 'cloud', 'security'
  const [pinInput, setPinInput] = useState(settings?.pinCode || '');
  const [firebaseProject, setFirebaseProject] = useState(settings?.firebaseConfig?.projectId || '');
  const [firebaseApiKey, setFirebaseApiKey] = useState(settings?.firebaseConfig?.apiKey || '');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSavePrivacy = () => {
    onUpdateSettings({
      ...settings,
      pinCode: pinInput,
    });
    showSaveToast();
  };

  const handleToggleAntiScreenshot = () => {
    onUpdateSettings({
      ...settings,
      antiScreenshot: !settings.antiScreenshot,
    });
    showSaveToast();
  };

  const handleToggleBiometric = () => {
    onUpdateSettings({
      ...settings,
      biometricLock: !settings.biometricLock,
    });
    showSaveToast();
  };

  const handleSaveCloud = () => {
    onUpdateSettings({
      ...settings,
      cloudProvider: firebaseProject ? 'firebase' : 'broadcast',
      firebaseConfig: {
        ...settings.firebaseConfig,
        projectId: firebaseProject.trim(),
        apiKey: firebaseApiKey.trim(),
      },
    });
    showSaveToast();
  };

  const showSaveToast = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Settings size={22} color="#8B5CF6" />
            <span>Settings & Security</span>
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {savedSuccess && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#6ee7b7',
              fontSize: '0.8rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={14} />
            <span>Settings updated successfully!</span>
          </div>
        )}

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          <button
            className={`tool-chip ${activeSettingsTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('privacy')}
          >
            <Lock size={14} /> Privacy & Locks
          </button>
          <button
            className={`tool-chip ${activeSettingsTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('cloud')}
          >
            <Cloud size={14} /> Cloud Relay
          </button>
          <button
            className={`tool-chip ${activeSettingsTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('security')}
          >
            <ShieldCheck size={14} /> E2EE Specs
          </button>
        </div>

        {/* Privacy Tab */}
        {activeSettingsTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Anti-Screenshot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bg-glass-border)',
              }}
            >
              <div>
                <strong style={{ color: 'white', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <EyeOff size={16} color="#EC4899" /> Anti-Screenshot Protection
                </strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Enables <code>FLAG_SECURE</code> to block screenshots & screen recordings
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.antiScreenshot}
                onChange={handleToggleAntiScreenshot}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
            </div>

            {/* Biometric Lock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bg-glass-border)',
              }}
            >
              <div>
                <strong style={{ color: 'white', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={16} color="#8B5CF6" /> App Biometric & PIN Lock
                </strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Require fingerprint or 4-digit PIN every time the app opens
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.biometricLock}
                onChange={handleToggleBiometric}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
            </div>

            {settings.biometricLock && (
              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Set 4-Digit Security PIN (Default: 1234)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--bg-glass-border)',
                      borderRadius: '8px',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <button className="btn-secondary" onClick={handleSavePrivacy}>
                    Save PIN
                  </button>
                </div>
              </div>
            )}

            {/* Gallery Anti-Leak Sandbox info */}
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
                <ShieldCheck size={16} />
                <span>Zero-Leak Sandbox Guarantee</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Photos received from your friend are stored strictly in the app's encrypted private cache and are never saved to the device's public photo gallery.
              </p>
            </div>
          </div>
        )}

        {/* Cloud Relay Tab */}
        {activeSettingsTab === 'cloud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Connect your <strong>free Google Firebase</strong> project so you and your friend can sync widgets instantly from <strong>any city / cellular data</strong> with zero hosting.
            </p>

            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Firebase Project ID (Free Tier)
              </label>
              <input
                type="text"
                placeholder="e.g. twinwidget-12345"
                value={firebaseProject}
                onChange={(e) => setFirebaseProject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginBottom: '10px',
                }}
              />

              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Firebase Web API Key
              </label>
              <input
                type="text"
                placeholder="e.g. AIzaSy..."
                value={firebaseApiKey}
                onChange={(e) => setFirebaseApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginBottom: '12px',
                }}
              />

              <button className="btn-primary" style={{ width: '100%', padding: '10px' }} onClick={handleSaveCloud}>
                Save & Connect Firebase
              </button>
            </div>

            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '6px' }}>
                ⚡ Quick 2-Minute Free Firebase Setup:
              </div>
              <ol style={{ paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '0.73rem', lineHeight: 1.6 }}>
                <li>Go to <strong style={{ color: '#fff' }}>console.firebase.google.com</strong> and click <em>Create a project</em>.</li>
                <li>In your project, click <em>Build &gt; Realtime Database</em> &gt; <em>Create Database</em> (Start in <strong>Test mode</strong>).</li>
                <li>Click the ⚙️ <em>Project Settings</em> icon &gt; under <em>Your apps</em> click the Web icon (<code>&lt;/&gt;</code>) to copy your <code>projectId</code> and <code>apiKey</code>.</li>
              </ol>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="#06B6D4" />
                <span>Default: Instant Local/Multi-tab Relay Active</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Without Firebase, TwinWidget uses real-time local storage & broadcast relays, allowing instant two-phone/two-tab sync.
              </p>
            </div>
          </div>
        )}

        {/* Security / Cryptography Tab */}
        {activeSettingsTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Encryption Key</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '4px' }}>
                {currentKey || 'No pairing key active'}
              </div>
            </div>

            {safetyFingerprint && (
              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Safety Verification Fingerprint</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '4px' }}>
                  {safetyFingerprint}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Compare these numbers with your friend to verify 100% authenticity against eavesdropping.
                </p>
              </div>
            )}

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>Security Specifications</div>
              <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Cipher: AES-GCM 256-bit Authenticated Encryption</li>
                <li>IV: Unique 96-bit cryptographically random nonce per payload</li>
                <li>Integrity: 128-bit authentication tag verification</li>
                <li>Zero-Knowledge: Cloud relay receives only scrambled binary blobs</li>
              </ul>
            </div>
          </div>
        )}

        {/* Nuclear Option: Unpair & Wipe Data */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--bg-glass-border)' }}>
          {showWipeConfirm ? (
            <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '8px', border: '1px solid var(--accent-rose)' }}>
              <p style={{ fontSize: '0.8rem', color: '#fda4af', marginBottom: '10px' }}>
                Are you sure? This will delete the pairing key, cached widget media, and all memories.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, background: 'var(--accent-rose)', color: 'white' }}
                  onClick={() => {
                    onWipeData();
                    onClose();
                  }}
                >
                  Yes, Wipe Everything
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowWipeConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-secondary"
              style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}
              onClick={() => setShowWipeConfirm(true)}
            >
              <Trash2 size={15} />
              <span>Unpair Device & Emergency Wipe Vault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
