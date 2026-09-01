/**
 * Firebase Realtime Cloud Relay for TwinWidget
 * Enables instant worldwide real-time syncing between two phones in different cities.
 * 100% End-to-End Encrypted: Firebase only receives scrambled AES-256-GCM ciphertext.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAMp1SpE8Ut00jELGXSrCtvNFFRLj7ao-o",
  authDomain: "twinwidget-app.firebaseapp.com",
  databaseURL: "https://twinwidget-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "twinwidget-app",
  storageBucket: "twinwidget-app.firebasestorage.app",
  messagingSenderId: "29364680080",
  appId: "1:29364680080:web:469fc48d658c755167af15"
};

class FirebaseRelayService {
  constructor() {
    this.app = null;
    this.db = null;
    this.currentChannelRef = null;
    this.isInitialized = false;
    this.init(DEFAULT_FIREBASE_CONFIG);
  }

  /**
   * Initializes Firebase using the provided configuration.
   * @param {object} config 
   */
  init(config = DEFAULT_FIREBASE_CONFIG) {
    if (!config || !config.apiKey || !config.projectId) {
      this.isInitialized = false;
      return false;
    }

    try {
      if (getApps().length > 0) {
        this.app = getApp();
      } else {
        this.app = initializeApp(config);
      }

      const dbUrl = config.databaseURL || `https://${config.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
      this.db = getDatabase(this.app, dbUrl);
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Firebase init error:', err);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Derives a unique, private channel room ID from the shared pairing key fingerprint.
   * @param {string} rawKeyBase64 
   */
  async getChannelIdFromKey(rawKeyBase64) {
    if (!rawKeyBase64) return 'default_room';
    const encoder = new TextEncoder();
    const data = encoder.encode(rawKeyBase64);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `channel_${hex.slice(0, 20)}`;
  }

  /**
   * Sends an encrypted ciphertext payload to Firebase.
   * @param {object} encryptedBlob 
   * @param {string} rawKeyBase64 
   */
  async sendEncryptedPayload(encryptedBlob, rawKeyBase64) {
    if (!this.isInitialized || !this.db) {
      this.init(DEFAULT_FIREBASE_CONFIG);
    }

    const channelId = await this.getChannelIdFromKey(rawKeyBase64);
    const channelRef = ref(this.db, `twin_channels/${channelId}/latest`);

    await set(channelRef, {
      payload: encryptedBlob,
      updatedAt: Date.now(),
    });

    return true;
  }

  /**
   * Subscribes to live real-time updates from Firebase across cities.
   * @param {string} rawKeyBase64 
   * @param {Function} onNewPayloadCallback 
   */
  async listenToChannel(rawKeyBase64, onNewPayloadCallback) {
    if (!this.isInitialized || !this.db) {
      this.init(DEFAULT_FIREBASE_CONFIG);
    }
    if (!rawKeyBase64) return () => {};

    const channelId = await this.getChannelIdFromKey(rawKeyBase64);
    const channelRef = ref(this.db, `twin_channels/${channelId}/latest`);
    this.currentChannelRef = channelRef;

    const unsubscribe = onValue(channelRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.payload) {
        onNewPayloadCallback(data.payload);
      }
    });

    return () => {
      if (this.currentChannelRef) {
        off(this.currentChannelRef);
      }
    };
  }
}

export const firebaseRelay = new FirebaseRelayService();
