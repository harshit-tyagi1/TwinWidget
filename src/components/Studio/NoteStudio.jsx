import React, { useState, useRef } from 'react';
import { Heart, Sparkles, Coffee, Moon, Flame, Zap, Smile } from 'lucide-react';

const THEMES = [
  { id: 'cyber', label: 'Cyber', bg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', text: '#f5f3ff' },
  { id: 'sunset', label: 'Sunset', bg: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #f59e0b 100%)', text: '#fff' },
  { id: 'emerald', label: 'Emerald', bg: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #06b6d4 100%)', text: '#ecfdf5' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', text: '#e2e8f0' },
  { id: 'amber', label: 'Warm Honey', bg: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', text: '#fffbeb' },
  { id: 'rose', label: 'Velvet Rose', bg: 'linear-gradient(135deg, #4c0519 0%, #9f1239 100%)', text: '#ffe4e6' },
];

const MOODS = [
  { id: 'love', icon: '❤️', label: 'Thinking of you' },
  { id: 'vibe', icon: '✨', label: 'Good vibes' },
  { id: 'coffee', icon: '☕', label: 'Coffee break' },
  { id: 'night', icon: '🌙', label: 'Good night' },
  { id: 'energy', icon: '⚡', label: 'Energy burst' },
  { id: 'fire', icon: '🔥', label: 'Miss you!' },
];

export default function NoteStudio({ noteText, setNoteText, selectedTheme, setSelectedTheme, selectedMood, setSelectedMood, noteRef }) {
  const [activeMood, setActiveMood] = useState(selectedMood || MOODS[0]);
  const [activeTheme, setActiveTheme] = useState(selectedTheme || THEMES[0]);

  const handleMoodSelect = (m) => {
    setActiveMood(m);
    if (setSelectedMood) setSelectedMood(m);
  };

  const handleThemeSelect = (t) => {
    setActiveTheme(t);
    if (setSelectedTheme) setSelectedTheme(t);
  };

  return (
    <div className="note-studio">
      <div
        ref={noteRef}
        className="sticky-note-editor"
        style={{
          background: activeTheme.bg,
          color: activeTheme.text,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <textarea
          className="sticky-textarea"
          placeholder="Write something sweet, secret, or funny..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          maxLength={180}
        />

        <div className="sticky-footer">
          <div className="mood-badge">
            <span>{activeMood.icon}</span>
            <span>{activeMood.label}</span>
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            {noteText.length}/180
          </span>
        </div>
      </div>

      {/* Mood Picker */}
      <div style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Choose Mood Badge
        </span>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodSelect(m)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                border: activeMood.id === m.id ? '1px solid var(--accent-purple)' : '1px solid var(--bg-glass-border)',
                background: activeMood.id === m.id ? 'rgba(139, 92, 246, 0.25)' : 'var(--bg-secondary)',
                color: activeMood.id === m.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Picker */}
      <div style={{ marginTop: '10px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Card Gradient Background
        </span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeSelect(t)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: t.bg,
                border: activeTheme.id === t.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: activeTheme.id === t.id ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={t.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
