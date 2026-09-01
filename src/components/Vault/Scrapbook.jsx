import React, { useState } from 'react';
import {
  BookMarked,
  Trash2,
  Download,
  Share2,
  Clock,
  Heart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Scrapbook({ memories, onDeleteMemory, onSelectForReply }) {
  const [likedIds, setLikedIds] = useState(new Set());

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = (imgUrl, id) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `twinwidget-memory-${id}.png`;
    a.click();
  };

  return (
    <div className="vault-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookMarked size={20} color="#8B5CF6" />
            <span>Encrypted Memory Scrapbook</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            All moments are kept inside your phone's isolated private vault.
          </p>
        </div>
        <span
          style={{
            padding: '4px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            color: 'var(--accent-purple)',
            fontWeight: 700,
            border: '1px solid var(--bg-glass-border)',
          }}
        >
          {memories.length} Memories
        </span>
      </div>

      {memories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={48} color="#8B5CF6" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h4 style={{ color: 'white', marginBottom: '6px' }}>Your Vault is Empty</h4>
          <p style={{ fontSize: '0.82rem' }}>
            Draw a sketch, snap a photo, or write a note to create your first encrypted memory together!
          </p>
        </div>
      ) : (
        <div className="scrapbook-grid">
          {memories.map((m) => (
            <div key={m.id} className="memory-card">
              <div className="memory-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: m.sender === 'You' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
                    }}
                  />
                  <strong style={{ color: 'white' }}>{m.sender}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    • {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} color="#10B981" />
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    AES-256
                  </span>
                </div>
              </div>

              <img src={m.image} alt="Memory" className="memory-image" />

              <div className="memory-footer">
                <button
                  className="icon-btn"
                  style={{
                    color: likedIds.has(m.id) ? 'var(--accent-rose)' : 'var(--text-secondary)',
                    borderColor: likedIds.has(m.id) ? 'var(--accent-rose)' : 'var(--bg-glass-border)',
                  }}
                  onClick={() => toggleLike(m.id)}
                >
                  <Heart size={16} fill={likedIds.has(m.id) ? 'currentColor' : 'none'} />
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="icon-btn"
                    title="Save to device"
                    onClick={() => handleDownload(m.image, m.id)}
                  >
                    <Download size={14} />
                  </button>

                  <button
                    className="icon-btn"
                    title="Delete memory"
                    onClick={() => onDeleteMemory(m.id)}
                  >
                    <Trash2 size={14} color="#f43f5e" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
