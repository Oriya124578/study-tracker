// ─────────────────────────────────────────────────────────────────────────────
// Local notifications (Phase 5a).
//
// Thin wrapper over the Web Notifications API + a lightweight service worker.
// The SW is what actually paints the notification (so it can appear when the
// tab is backgrounded and supports notificationclick → focus app).
//
// Phase 5b (FCM push) will reuse the same SW registration + permission flow,
// just adding getToken()/onMessage on top — so this surface stays stable.
// ─────────────────────────────────────────────────────────────────────────────

const SW_URL = '/notification-sw.js';

export const isNotificationSupported = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator;

/** 'granted' | 'denied' | 'default' | 'unsupported' */
export const getNotificationPermission = () =>
  isNotificationSupported() ? Notification.permission : 'unsupported';

let swRegistrationPromise = null;

/** Register (once) the notification service worker. Returns the registration or null. */
export const registerNotificationSW = () => {
  if (!isNotificationSupported()) return Promise.resolve(null);
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register(SW_URL)
      .catch((err) => {
        console.warn('[notifications] SW registration failed:', err);
        swRegistrationPromise = null;
        return null;
      });
  }
  return swRegistrationPromise;
};

/**
 * Ask the user for notification permission. If already decided, returns the
 * existing state. On 'granted' it also makes sure the SW is registered.
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  let perm = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); }
    catch { perm = Notification.permission; }
  }
  if (perm === 'granted') await registerNotificationSW();
  return perm;
};

/**
 * Show a notification now. Prefers the SW registration (works backgrounded);
 * falls back to a page-level Notification. Returns true if shown.
 */
export const showLocalNotification = async (title, options = {}) => {
  if (getNotificationPermission() !== 'granted') return false;
  const opts = {
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    dir: 'auto',
    ...options,
  };
  try {
    await registerNotificationSW();
    // The first registration may still be installing — wait for an ACTIVE
    // worker before calling showNotification (otherwise it silently no-ops).
    // Race against a timeout so we never hang if activation stalls.
    let reg = null;
    if ('serviceWorker' in navigator) {
      reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    }
    if (reg && reg.showNotification) {
      await reg.showNotification(title, opts);
      return true;
    }
    // Fallback: page-level notification (only works while a tab is focused).
    const n = new Notification(title, opts);
    void n;
    return true;
  } catch (err) {
    console.warn('[notifications] show failed:', err);
    // Last-ditch fallback to a page-level notification.
    try { const n = new Notification(title, opts); void n; return true; }
    catch { return false; }
  }
};
