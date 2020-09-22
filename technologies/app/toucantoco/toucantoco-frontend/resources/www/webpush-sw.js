importScripts("precache-manifest.7bae804461956aad0dff4cf0267c7b93-v1.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

importScripts('scripts/firebase-app.js');
importScripts('scripts/firebase-messaging.js');

var messaging, senderId;

const cacheName = 'tucana-v57.1.4';

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('message', function(event) {
  senderId = event.data;

  try {
    firebase.initializeApp({
      messagingSenderId: senderId,
    });
    messaging = firebase.messaging();
  } catch (error) {
    console.error('Error during firebase initialization', error);
  }
});

self.addEventListener('fetch', function(event) {
  // when the client does a request it goes emits a 'fetch' event handled here by the SW
  // We check if the resource requested has been cached
  // If it has been cached we serve it from the cache, otherwise we fetch it from the server
  // https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
  // Avoid to catch request DELETE, PATCH, POST, PUT
  if (event.request.type === 'GET') {
    event.respondWith(
      caches
        .open(cacheName)
        .then((cache) => cache.match(event.request))
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        }),
    );
  }
});

