/**
 *   Registers the Service Worker
 */
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('ServiceWorker.js')
    .then(registration => {
        console.log(`Registration successful, scope is ${registration.scope}`);
    }).catch(error => {
        console.log(`Service worker registration failed, error: ${error}`);
    });
}