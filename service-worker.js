/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "2e5539a692917edd0d695ffeea980c7d"
  },
  {
    "url": "assets/css/0.styles.dfa1a5cf.css",
    "revision": "57ba7a8f49541ec5c25265f8fe3da2ae"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.c8a66029.js",
    "revision": "f73e9865836aa1dcc15d785fad470ec0"
  },
  {
    "url": "assets/js/11.ba11236c.js",
    "revision": "4e121463ecfc61d17b026e89153a69e0"
  },
  {
    "url": "assets/js/12.ff9a7298.js",
    "revision": "47a53bda71aec48cacf43000ac7e0397"
  },
  {
    "url": "assets/js/13.c7120bd2.js",
    "revision": "59c486b2bdd8005b5db68b520931d201"
  },
  {
    "url": "assets/js/14.22eb13c3.js",
    "revision": "06b86cec4542bce21f5759a0d7ac14b7"
  },
  {
    "url": "assets/js/15.715851fc.js",
    "revision": "93f6676aadfd5aefe6bbf562a1b31d54"
  },
  {
    "url": "assets/js/16.8fbed22f.js",
    "revision": "83774e292eb405e82a8d7f03c104bea7"
  },
  {
    "url": "assets/js/17.78ff0958.js",
    "revision": "7dc419dbc8708836943a3a0d6ef98806"
  },
  {
    "url": "assets/js/18.9ff9f214.js",
    "revision": "3e943b7474b684f57d7171f51e195302"
  },
  {
    "url": "assets/js/19.164b8e25.js",
    "revision": "d51d788fcff6e1e048491a7511ba2ed7"
  },
  {
    "url": "assets/js/2.0c3bff11.js",
    "revision": "36bac5b702f87853fbfdc06628368ba9"
  },
  {
    "url": "assets/js/20.3f73a18f.js",
    "revision": "09c9a546ed833e554437e5e98d8a491f"
  },
  {
    "url": "assets/js/21.5e75273a.js",
    "revision": "e4098696da13e6c7bb0cf26124bf17a0"
  },
  {
    "url": "assets/js/22.4ba21d7e.js",
    "revision": "0b38d051dc24cc0b81386fae9f08ac2b"
  },
  {
    "url": "assets/js/23.5cc52852.js",
    "revision": "ddd154b09cdf926f16745016b47b3d83"
  },
  {
    "url": "assets/js/24.5a7ec6d9.js",
    "revision": "9aa65d40f3a4fd131d0687c6781f9f61"
  },
  {
    "url": "assets/js/3.396b1a95.js",
    "revision": "e0f20b7a5816dbc4947e5b72e22674b7"
  },
  {
    "url": "assets/js/4.6cf1e0cf.js",
    "revision": "bd15a06cd19285fd4ac659408a3e2fa5"
  },
  {
    "url": "assets/js/5.1214c687.js",
    "revision": "284f650bae8ed62b386aa870fefea05c"
  },
  {
    "url": "assets/js/6.16373f7f.js",
    "revision": "6f97811b2d52a11eabbef2933519608b"
  },
  {
    "url": "assets/js/7.5f58fcfe.js",
    "revision": "fbf2d5f566a4207ec9fe40cc30c0474d"
  },
  {
    "url": "assets/js/8.7044b974.js",
    "revision": "01a14a7995fd1eb008fee7cdf024bcb1"
  },
  {
    "url": "assets/js/9.d306db64.js",
    "revision": "9f6a6883baca27965f32c7ea8e3fe044"
  },
  {
    "url": "assets/js/app.d1fa0665.js",
    "revision": "6346bb2a734e19f9a49a43377baaa544"
  },
  {
    "url": "configuration.html",
    "revision": "1795f90bed546f353cf7c78978aee7e6"
  },
  {
    "url": "guide/advanced/adapters.html",
    "revision": "a3c3b1c70e29997110ab66e0bab6940f"
  },
  {
    "url": "guide/advanced/field-builders.html",
    "revision": "b0b6afc0da653ef0d235ec6375d21dca"
  },
  {
    "url": "guide/models/conventions.html",
    "revision": "bc7731501eb2b3fbd31c1058a9ea00b8"
  },
  {
    "url": "guide/models/crud.html",
    "revision": "ea8754ef01ebfa114921c22be5f27eb9"
  },
  {
    "url": "guide/models/customising-models.html",
    "revision": "079f7905aaed63ccd944dbb9777cffed"
  },
  {
    "url": "guide/models/decorators.html",
    "revision": "a6149b468f0d85ba038fd04b5f10fe77"
  },
  {
    "url": "guide/models/define-models.html",
    "revision": "70fa6ef1faf6502ce10665c7ee4749e6"
  },
  {
    "url": "guide/models/fields.html",
    "revision": "786dcfb6934baf50ffdf9b57d7103d4c"
  },
  {
    "url": "guide/models/hooks.html",
    "revision": "d1f72b049ea5f0eb4748d86d8650412e"
  },
  {
    "url": "guide/query-builder/dynamic-query-operations.html",
    "revision": "431fd005cace391d086270fe1cc7e392"
  },
  {
    "url": "guide/query-builder/filters.html",
    "revision": "6b879b4dbf2be2070825cf07e935893e"
  },
  {
    "url": "guide/query-builder/index.html",
    "revision": "703211140bf14465ceccd9daeba10009"
  },
  {
    "url": "guide/query-builder/query-arguments.html",
    "revision": "34f350aa5fbb082f23d27be0f5f858d4"
  },
  {
    "url": "guide/query-builder/relationships.html",
    "revision": "5baed29af3c1b52d04023e85d74de9e6"
  },
  {
    "url": "guide/query-builder/select-fields.html",
    "revision": "caeac1f76c5d3b2b33ef2fccb9b68bfc"
  },
  {
    "url": "index.html",
    "revision": "95347b66ae859cfbe15be4e8986af92f"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
