import { precacheAndRoute } from 'workbox-precaching';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { warmStrategyCache } from 'workbox-recipes';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache and route all assets specified in the __WB_MANIFEST variable
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategy for pages
const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    }),
  ],
});

// Figuring out appropriate version's syntax
// Warm the cache for specific URLs
// pageCache.addAll(['./index.html']);
warmStrategyCache({
  urls: ['./index.html', '/'],
  strategy: pageCache,
});

// Route for navigation requests (e.g., HTML pages)
registerRoute(({ request }) => request.mode === 'navigate', args => {
  return pageCache.handle(args);
});

// Route for caching assets (e.g., CSS, JS, images)
registerRoute(({ request }) => {
  const requestDestination = request.destination;
  return requestDestination === 'style' || requestDestination === 'script' || requestDestination === 'image';
}, args => {
  return new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }).handle(args);
});
