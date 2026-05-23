importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase config hardcoded — env vars are not available in service workers
// These values are safe to expose (already in your public JS bundle)
firebase.initializeApp({
  apiKey: "AIzaSyDIAubZv255nZJ87PKg3TFyrjbEwqtBr6o",
  authDomain: "www.lifehub.fit",
  projectId: "lifehub-db6bb",
  storageBucket: "lifehub-db6bb.appspot.com",
  messagingSenderId: "457163791884",
  appId: "1:457163791884:web:45289ee3fa46f61a1b9829"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "LifeHub", {
    body: body || "",
    icon: icon || "/logo192.png",
    badge: "/logo192.png",
    data: payload.data || {}
  });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
