/**
 * Multi-Mode Zero-Knowledge Sync Relay Service for TwinWidget
 * Coordinates:
 * 1. Firebase Cloud Relay (live over-the-air internet sync across cities / different Wi-Fi)
 * 2. BroadcastChannel / LocalStorage Bridge (instant local testing / same browser)
 */

import { firebaseRelay } from './firebaseRelay';

class SyncRelayService {
  constructor() {
    this.listeners = new Set();
    this.channelName = 'twinwidget_encrypted_stream';
    this.channel = null;
    this.firebaseUnsubscribe = null;
    this.initBroadcastChannel();
  }

  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'TWIN_ENCRYPTED_PAYLOAD') {
          this.notifyListeners(event.data.payload);
        }
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'twinwidget_relay_bridge' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data.payload);
          } catch (err) {
            console.error('Relay bridge error', err);
          }
        }
      });
    }
  }

  /**
   * Initializes Firebase listener if credentials are provided.
   * @param {object} settings 
   * @param {string} rawKeyBase64 
   */
  async configureCloud(settings, rawKeyBase64) {
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
      this.firebaseUnsubscribe = null;
    }

    if (settings.firebaseConfig && settings.firebaseConfig.projectId && settings.firebaseConfig.apiKey) {
      const initialized = firebaseRelay.init(settings.firebaseConfig);
      if (initialized && rawKeyBase64) {
        this.firebaseUnsubscribe = await firebaseRelay.listenToChannel(rawKeyBase64, (payload) => {
          this.notifyListeners(payload);
        });
      }
    }
  }

  /**
   * Transmits an encrypted ciphertext payload to the paired partner.
   * @param {object} encryptedBlob 
   * @param {object} settings 
   * @param {string} rawKeyBase64 
   */
  async broadcastEncrypted(encryptedBlob, settings = {}, rawKeyBase64 = null) {
    // 1. Send via local BroadcastChannel & Storage Bridge
    if (this.channel) {
      this.channel.postMessage({
        type: 'TWIN_ENCRYPTED_PAYLOAD',
        payload: encryptedBlob,
      });
    }

    localStorage.setItem(
      'twinwidget_relay_bridge',
      JSON.stringify({
        payload: encryptedBlob,
        timestamp: Date.now(),
      })
    );

    // 2. If Firebase is configured, transmit to Firebase Realtime Cloud Relay
    if (
      settings.firebaseConfig &&
      settings.firebaseConfig.projectId &&
      rawKeyBase64
    ) {
      try {
        if (!firebaseRelay.isInitialized) {
          firebaseRelay.init(settings.firebaseConfig);
        }
        await firebaseRelay.sendEncryptedPayload(encryptedBlob, rawKeyBase64);
      } catch (err) {
        console.warn('Firebase broadcast warning:', err);
      }
    }

    return true;
  }

  /**
   * Registers a callback for newly arrived encrypted payloads.
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(payload) {
    this.listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }
}

export const syncRelay = new SyncRelayService();
