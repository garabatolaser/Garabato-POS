import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('image');
      if (file instanceof File) {
        const cache = await caches.open('garabato-share-v1');
        await cache.put('shared-image', new Response(file, {
          headers: { 'Content-Type': file.type }
        }));
      }
      return Response.redirect('/?share=1', 303);
    })());
  }
});
