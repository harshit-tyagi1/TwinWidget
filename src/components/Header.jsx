import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Smartphone, BookMarked, Settings, QrCode } from 'lucide-react';

export default function Header({
  isPaired,
  partnerName,
  safetyNumber,
  onOpenPairing,
  onOpenVault,
  onOpenSettings,
  activeTab,
  setActiveTab,
}) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="logo-badge">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="brand-title">TwinWidget</h1>
          <button className="partner-status-pill" onClick={onOpenPairing}>
            <span className={`status-dot ${isPaired ? 'active' : ''}`} />
            <span>{isPaired ? partnerName || 'Paired Friend' : 'Tap to Pair'}</span>
            <QrCode size={13} style={{ opacity: 0.7 }} />
          </button>
        </div>
      </div>

      <div className="header-actions">
        <button
          className={`icon-btn ${activeTab === 'widget' ? 'active' : ''}`}
          title="Home Screen Widget View"
          onClick={() => setActiveTab(activeTab === 'widget' ? 'studio' : 'widget')}
        >
          <Smartphone size={18} />
        </button>

        <button
          className={`icon-btn ${activeTab === 'vault' ? 'active' : ''}`}
          title="Encrypted Memory Scrapbook"
          onClick={() => setActiveTab(activeTab === 'vault' ? 'studio' : 'vault')}
        >
          <BookMarked size={18} />
        </button>

        <button
          className="icon-btn"
          title="Security & Cloud Settings"
          onClick={onOpenSettings}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
