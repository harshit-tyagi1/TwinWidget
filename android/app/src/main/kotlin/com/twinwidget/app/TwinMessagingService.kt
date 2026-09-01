package com.twinwidget.app

import android.content.Context
import android.util.Base64
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.io.File
import java.io.FileOutputStream
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Background Push Notification Service
 * Wakes up device upon new post, decrypts the media payload using AES-GCM,
 * stores it in private sandbox, and updates Home Screen Widgets instantly.
 */
class TwinMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val ciphertextBase64 = remoteMessage.data["ciphertext"] ?: return
        val ivBase64 = remoteMessage.data["iv"] ?: return

        try {
            // 1. Retrieve stored pairing key from hardware Keystore / EncryptedSharedPreferences
            val prefs = getSharedPreferences("twinwidget_secure_store", Context.MODE_PRIVATE)
            val keyBase64 = prefs.getString("pairing_key", null) ?: return

            val keyBytes = Base64.decode(keyBase64, Base64.DEFAULT)
            val ivBytes = Base64.decode(ivBase64, Base64.DEFAULT)
            val cipherBytes = Base64.decode(ciphertextBase64, Base64.DEFAULT)

            val secretKey = SecretKeySpec(keyBytes, "AES")
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val spec = GCMParameterSpec(128, ivBytes)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)

            val decryptedBytes = cipher.doFinal(cipherBytes)

            // 2. Save to app-private cache
            val file = File(filesDir, "latest_decrypted_widget.png")
            FileOutputStream(file).use { it.write(decryptedBytes) }

            // 3. Immediately trigger Home Screen Widget reload
            TwinWidgetProvider.refreshAllWidgets(applicationContext)

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
