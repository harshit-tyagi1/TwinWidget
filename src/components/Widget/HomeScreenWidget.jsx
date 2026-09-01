import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Send,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  Clock,
  Heart,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

export default function HomeScreenWidget({
  widgetData,
  partnerName,
  onTapToReply,
  onSimulatePartnerMessage,
}) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [widgetSize, setWidgetSize] = useState('square'); // 'square' or 'wide'

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="widget-preview-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="#8B5CF6" />
          <span>Home Screen Widget Live Preview</span>
        </h3>
        <button
          className="tool-chip"
          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
          onClick={onSimulatePartnerMessage}
        >
          <Sparkles size={13} color="#EC4899" />
          <span>Simulate Partner Post</span>
        </button>
      </div>

      {/* Phone Simulator Frame */}
      <div className="phone-simulator">
        <div className="phone-notch" />

        {/* Phone Clock Header */}
        <div className="phone-time-widget">
          <div className="phone-clock">{currentTime}</div>
          <div className="phone-date">{currentDate}</div>
        </div>

        {/* The Live Partner Widget Card */}
        <div
          className="widget-card"
          onClick={onTapToReply}
          title="Tap widget to launch TwinWidget Studio"
        >
          <div className="widget-header-badge">
            <div className="widget-sender-tag">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <span>{widgetData?.sender || partnerName || 'Twin Friend'}</span>
            </div>

            <div className="widget-e2ee-tag" title="End-to-End Encrypted">
              <ShieldCheck size={11} style={{ display: 'inline', marginRight: '3px' }} />
              <span>E2EE</span>
            </div>
          </div>

          <div className="widget-image-frame">
            {widgetData?.image ? (
              <img
                src={widgetData.image}
                alt="Partner Widget"
                className="widget-content-img"
              />
            ) : (
              <div className="widget-empty-state">
                <Heart size={36} color="#8B5CF6" style={{ opacity: 0.6 }} />
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  No updates yet from <strong>{partnerName || 'your friend'}</strong>.
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)' }}>
                  Tap to send the first note!
                </span>
              </div>
            )}
          </div>

          <div className="widget-time-tag">
            <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
            <span>{formatTimeAgo(widgetData?.timestamp)}</span>
          </div>
        </div>

        {/* Mock App Icons */}
        <div className="phone-mock-apps">
          <div className="mock-app-icon">
            <div className="mock-icon-square" style={{ background: '#2563eb' }}>
              <MessageCircle size={24} />
            </div>
            <span className="mock-app-label">Messages</span>
          </div>

          <div className="mock-app-icon">
            <div className="mock-icon-square" style={{ background: '#dc2626' }}>
              <Camera size={24} />
            </div>
            <span className="mock-app-label">Camera</span>
          </div>

          <div className="mock-app-icon">
            <div className="mock-icon-square" style={{ background: '#7c3aed' }}>
              <ImageIcon size={24} />
            </div>
            <span className="mock-app-label">Photos</span>
          </div>

          <div className="mock-app-icon" onClick={onTapToReply} style={{ cursor: 'pointer' }}>
            <div className="mock-icon-square" style={{ background: 'var(--grad-primary)' }}>
              <Sparkles size={24} />
            </div>
            <span className="mock-app-label" style={{ color: '#c4b5fd', fontWeight: 700 }}>TwinWidget</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          💡 When you tap <strong>Send</strong> in TwinWidget, this widget updates in real-time on your friend's phone screen!
        </p>
      </div>
    </div>
  );
}
