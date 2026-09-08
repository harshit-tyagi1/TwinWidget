/**
 * Local Vault Storage Service for TwinWidget
 * Manages device keys, paired partner data, widget cache, and memory scrapbook.
 */

const STORAGE_KEYS = {
  PAIRING_KEY: 'twinwidget_pairing_key',
  PARTNER_INFO: 'twinwidget_partner_info',
  WIDGET_CACHE: 'twinwidget_widget_cache',
  MEMORIES: 'twinwidget_memories_vault',
  SETTINGS: 'twinwidget_security_settings',
};

const DEFAULT_SETTINGS = {
  antiScreenshot: false,
  biometricLock: false,
  pinCode: '',
  cloudProvider: 'firebase',
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMp1SpE8Ut00jELGXSrCtvNFFRLj7ao-o",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "twinwidget-app.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://twinwidget-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "twinwidget-app",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "twinwidget-app.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "29364680080",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:29364680080:web:fff3e20bfc84c39967af15"
  },
};

export const StorageService = {
  // Key Management
  getPairingKey() {
    return localStorage.getItem(STORAGE_KEYS.PAIRING_KEY) || null;
  },

  setPairingKey(rawBase64Key) {
    if (!rawBase64Key) {
      localStorage.removeItem(STORAGE_KEYS.PAIRING_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAIRING_KEY, rawBase64Key);
    }
  },

  // Partner Info
  getPartnerInfo() {
    const data = localStorage.getItem(STORAGE_KEYS.PARTNER_INFO);
    return data ? JSON.parse(data) : null;
  },

  setPartnerInfo(info) {
    if (!info) {
      localStorage.removeItem(STORAGE_KEYS.PARTNER_INFO);
    } else {
      localStorage.setItem(STORAGE_KEYS.PARTNER_INFO, JSON.stringify(info));
    }
  },

  // Home Screen Widget Cache
  getWidgetCache() {
    const data = localStorage.getItem(STORAGE_KEYS.WIDGET_CACHE);
    return data ? JSON.parse(data) : null;
  },

  setWidgetCache(widgetData) {
    localStorage.setItem(STORAGE_KEYS.WIDGET_CACHE, JSON.stringify(widgetData));
  },

  // Memory Vault (Encrypted History)
  getMemories() {
    const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return data ? JSON.parse(data) : [];
  },

  addMemory(memoryItem) {
    const memories = this.getMemories();
    const updated = [memoryItem, ...memories].slice(0, 50); // Keep latest 50
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(updated));
    return updated;
  },

  deleteMemory(id) {
    const memories = this.getMemories();
    const updated = memories.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(updated));
    return updated;
  },

  // Security Settings
  getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Nuclear Emergency Wipe
  wipeAllData() {
    localStorage.removeItem(STORAGE_KEYS.PAIRING_KEY);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_INFO);
    localStorage.removeItem(STORAGE_KEYS.WIDGET_CACHE);
    localStorage.removeItem(STORAGE_KEYS.MEMORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
