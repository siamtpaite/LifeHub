/**
 * fcmSender.js
 * Sends FCM push notifications via Firebase Admin SDK.
 */

const admin = require("firebase-admin");

function getAdmin() {
  if (admin.apps.length > 0) return admin.app();
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

/**
 * Send a push notification to all FCM tokens of a user.
 * @param {string[]} tokens - FCM tokens from users/{uid}.fcmTokens
 * @param {object} notification - { title, body }
 * @param {object} data - optional key-value payload
 */
async function sendPushToTokens(tokens, notification, data = {}) {
  if (!tokens || tokens.length === 0) return;
  getAdmin();

  const messages = tokens.map((token) => ({
    token,
    notification: {
      title: notification.title,
      body: notification.body
    },
    webpush: {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: "/logo192.png",
        badge: "/logo192.png"
      },
      fcmOptions: {
        link: data.url || "https://www.lifehub.fit"
      }
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    )
  }));

  const results = await Promise.allSettled(
    messages.map((msg) => admin.messaging().send(msg))
  );

  // Log failed tokens for cleanup
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.warn(`[FCM] Failed to send to token ${tokens[i].slice(0, 20)}...:`, result.reason?.message);
    }
  });

  const sent = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[FCM] Sent ${sent}/${tokens.length} notifications`);
  return sent;
}

module.exports = { sendPushToTokens };
