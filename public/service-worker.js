const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/styles.css',
	'/manifest.webmanifest',
	'/index.js',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

var idbRequest = indexedDB.open('budgetdatabase', 1);
var idbDatabase;

idbRequest.onerror = function (error) {
	console.error('Error:', error);
};

idbRequest.onsuccess = function () {
	idbDatabase = this.result;
};

idbRequest.onupgradeneeded = function ({ target }) {
	console.log('objectstore');
	const db = target.result;
	const objectStore = db.createObjectStore('transactions');

	objectStore.createIndex('transactions', 'transaction');
};

self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(DATA_CACHE_NAME).then((cache) => cache.add('/api/transaction'))
	);
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Your files were pre-cached successfully!');
			return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
});

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log('Removing old data', key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

self.addEventListener('fetch', function (e) {
	if (e.request.url.includes('/api/')) {
		e.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(e.request)
						.then((response) => {
							if (response.status === 200) {
								cache.put(e.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							return cache.match(e.request);
						});
				})
				.catch((err) => console.log(err))
		);
		return;
	}
	e.respondWith(
		caches.match(e.request).then(function (response) {
			return response || fetch(e.request);
		})
	);
});