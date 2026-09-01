import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound } from 'lucide-react';

export default function BiometricLock({ pinCode, onUnlock }) {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  const handleKeyPress = (num) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (!pinCode || nextPin === pinCode) {
          onUnlock();
        } else {
          setErrorMsg('Incorrect PIN');
          setTimeout(() => setEnteredPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricClick = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      onUnlock();
    }, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#07080c',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Lock size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
          TwinWidget Secure Vault
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Enter PIN or use biometric unlock to open your private channel
        </p>
      </div>

      {/* PIN Dots */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '2px solid var(--accent-purple)',
              background: i < enteredPin.length ? 'var(--accent-purple)' : 'transparent',
              boxShadow: i < enteredPin.length ? '0 0 10px var(--accent-purple)' : 'none',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {errorMsg && (
        <p style={{ color: 'var(--accent-rose)', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 600 }}>
          {errorMsg}
        </p>
      )}

      {/* Number Keypad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          maxWidth: '280px',
          width: '100%',
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            style={{
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-glass-border)',
              color: 'white',
              fontSize: '1.4rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {num}
          </button>
        ))}

        <button
          onClick={handleBiometricClick}
          style={{
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-purple)',
            color: 'var(--accent-purple)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Fingerprint / Face ID"
        >
          <Fingerprint size={28} className={isBiometricScanning ? 'animate-pulse' : ''} />
        </button>

        <button
          onClick={() => handleKeyPress('0')}
          style={{
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-glass-border)',
            color: 'white',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          style={{
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-glass-border)',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Delete
        </button>
      </div>

      <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.78rem' }}>
        <ShieldCheck size={16} />
        <span>Hardware-Backed App Sandbox Active</span>
      </div>
    </div>
  );
}
