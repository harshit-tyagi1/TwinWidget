/**
 * Military-Grade End-to-End Encryption (E2EE) Module for TwinWidget
 * Uses WebCrypto standard AES-256-GCM authenticated encryption.
 * Zero plaintext leaves the device.
 */

// Helper: Convert ArrayBuffer to Base64
export function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 to Uint8Array
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a fresh 256-bit AES-GCM secret pairing key.
 * @returns {Promise<{ key: CryptoKey, rawBase64: string }>}
 */
export async function generatePairingSecret() {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await window.crypto.subtle.exportKey('raw', key);
  const rawBase64 = bufferToBase64(exported);

  return { key, rawBase64 };
}

/**
 * Imports an AES-256-GCM key from raw Base64.
 * @param {string} rawBase64 
 * @returns {Promise<CryptoKey>}
 */
export async function importSecretKey(rawBase64) {
  const rawBuffer = base64ToBuffer(rawBase64);
  return await window.crypto.subtle.importKey(
    'raw',
    rawBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Computes a human-readable 12-digit Safety Number / Key Fingerprint (like Signal)
 * Used to verify the channel identity between the two paired phones.
 * @param {string} rawBase64 
 * @returns {Promise<string>}
 */
export async function computeSafetyFingerprint(rawBase64) {
  const rawBuffer = base64ToBuffer(rawBase64);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', rawBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Format into 4 groups of 4 digits
  let digits = '';
  for (let i = 0; i < 8; i++) {
    digits += (hashArray[i] % 100).toString().padStart(2, '0');
  }
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
}

/**
 * Encrypts an arbitrary JSON/Text payload with AES-256-GCM.
 * Generates a cryptographically random 96-bit initialization vector (IV) per message.
 * @param {object|string} payload 
 * @param {CryptoKey} cryptoKey 
 * @returns {Promise<{ iv: string, ciphertext: string, timestamp: number }>}
 */
export async function encryptPayload(payload, cryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const plainText = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const encoded = encoder.encode(plainText);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    encoded
  );

  return {
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertextBuffer),
    timestamp: Date.now(),
    version: '1.0-e2ee',
  };
}

/**
 * Decrypts an encrypted payload using the shared secret key.
 * Throws an error if the payload was altered or tampered with in transit.
 * @param {{ iv: string, ciphertext: string }} encryptedData 
 * @param {CryptoKey} cryptoKey 
 * @returns {Promise<any>}
 */
export async function decryptPayload(encryptedData, cryptoKey) {
  const ivBuffer = base64ToBuffer(encryptedData.iv);
  const ciphertextBuffer = base64ToBuffer(encryptedData.ciphertext);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
    },
    cryptoKey,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  const decodedText = decoder.decode(decryptedBuffer);

  try {
    return JSON.parse(decodedText);
  } catch {
    return decodedText;
  }
}

/**
 * Encrypts an image/media DataURL or Base64 string.
 * @param {string} mediaDataUrl 
 * @param {CryptoKey} cryptoKey 
 * @returns {Promise<{ iv: string, ciphertext: string }>}
 */
export async function encryptMediaBlob(mediaDataUrl, cryptoKey) {
  return await encryptPayload({ dataUrl: mediaDataUrl, mediaType: 'image/png' }, cryptoKey);
}

/**
 * Decrypts an encrypted media blob into a usable DataURL.
 * @param {object} encryptedBlob 
 * @param {CryptoKey} cryptoKey 
 * @returns {Promise<string>}
 */
export async function decryptMediaBlob(encryptedBlob, cryptoKey) {
  const result = await decryptPayload(encryptedBlob, cryptoKey);
  return result.dataUrl || result;
}
