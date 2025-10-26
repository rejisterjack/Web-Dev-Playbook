if ('serviceWorker' in navigator) {
  console.log('Service worker is present')

  navigator.serviceWorker
    .register('/src/sw.js')
    .then(() => console.log('Service worker initialized'))
    .catch((e) => console.error('Service worker error', e))
}
