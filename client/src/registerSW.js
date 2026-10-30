// Nirerehistro ang service worker (PWA) — parehong gawain ng dating register-sw.js
export default function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker Registered!', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker Registration Failed!', error);
        });
    });
  }
}
