/* Sooqna push worker — handles browser/mobile notifications only (no page cache). */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "سوقنا",
    body: "لديك تنبيه جديد",
    href: "/profile#notifications",
    id: "sooqna-notification",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    /* keep defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      badge: "/brand/app-icon.svg",
      data: { href: payload.href || "/profile#notifications" },
      dir: "rtl",
      icon: "/brand/app-icon.svg",
      lang: "ar",
      tag: payload.id || "sooqna-notification",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.href || "/profile#notifications";
  const url = new URL(target, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) =>
          client.url.startsWith(self.location.origin),
        );
        if (existing) {
          existing.postMessage({ href: target, type: "sooqna-notification-open" });
          return existing.focus();
        }
        return self.clients.openWindow(url);
      }),
  );
});
