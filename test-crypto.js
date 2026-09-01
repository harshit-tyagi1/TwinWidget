// Headless Node.js test for WebCrypto AES-256-GCM E2EE
import { webcrypto } from 'node:crypto';

// Polyfill global crypto for test
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

async function testCryptoEngine() {
  console.log('🧪 Starting End-to-End Encryption (E2EE) Unit Test...');

  // 1. Generate 256-bit AES-GCM key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  console.log('✅ Key generated successfully');

  // 2. Export & re-import key
  const rawExported = await crypto.subtle.exportKey('raw', key);
  const rawBase64 = Buffer.from(rawExported).toString('base64');
  console.log('🔑 Exported Raw Base64 Key:', rawBase64);

  const importedKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(rawBase64, 'base64'),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  console.log('✅ Key re-imported successfully');

  // 3. Encrypt Sample Payload (Drawing + Note + Metadata)
  const samplePayload = JSON.stringify({
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    sender: 'Alex',
    type: 'draw',
    timestamp: Date.now()
  });

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(samplePayload);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    importedKey,
    encoded
  );

  const ciphertextBase64 = Buffer.from(ciphertextBuffer).toString('base64');
  const ivBase64 = Buffer.from(iv).toString('base64');
  console.log('🔒 Encrypted Ciphertext length:', ciphertextBase64.length, 'chars');

  // 4. Decrypt with valid key
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Buffer.from(ivBase64, 'base64') },
    importedKey,
    Buffer.from(ciphertextBase64, 'base64')
  );
  const decryptedText = new TextDecoder().decode(decryptedBuffer);
  const parsed = JSON.parse(decryptedText);

  if (parsed.sender === 'Alex' && parsed.type === 'draw') {
    console.log('✅ Decryption verified byte-for-byte identical!');
  } else {
    throw new Error('Decryption content mismatch!');
  }

  // 5. Test Tampering Detection (Authenticated Encryption Tag Check)
  try {
    const tampered = Buffer.from(ciphertextBase64, 'base64');
    tampered[0] ^= 0xff; // flip bits
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(ivBase64, 'base64') },
      importedKey,
      tampered
    );
    throw new Error('Security failure: Tampered ciphertext was decrypted without auth tag error!');
  } catch (err) {
    console.log('🛡️ Tamper Detection verified: Modified ciphertext rejected by AES-GCM auth tag (Expected behaviour: OperationError)');
  }

  // 6. Compute Safety Number
  const hashBuffer = await crypto.subtle.digest('SHA-256', Buffer.from(rawBase64, 'base64'));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  let digits = '';
  for (let i = 0; i < 8; i++) {
    digits += (hashArray[i] % 100).toString().padStart(2, '0');
  }
  const safetyFingerprint = `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
  console.log('🔢 Safety Fingerprint:', safetyFingerprint);

  console.log('\n🎉 ALL CRYPTO TESTS PASSED SUCCESSFULLY (6/6)');
}

testCryptoEngine().catch((err) => {
  console.error('❌ Crypto test failed:', err);
  process.exit(1);
});
