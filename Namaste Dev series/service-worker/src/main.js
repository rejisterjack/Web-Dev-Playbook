if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(() => {
      console.log('service worker registered successfully')
    })
    .catch((e) => {
      console.log('service worker failed: ', e)
    })
}
