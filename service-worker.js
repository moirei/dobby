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
    "revision": "9b08660e9fd93e042ed6a79d2e36ddda"
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
    "url": "assets/js/10.110cbe4a.js",
    "revision": "863a7fa08c94a9bd7b2e9ecd0c999498"
  },
  {
    "url": "assets/js/11.ed2982a7.js",
    "revision": "b5834c5c7e34c41d0f281aaa1843533d"
  },
  {
    "url": "assets/js/12.c2da6a46.js",
    "revision": "b16d8215aa4f3ac066b397502382f201"
  },
  {
    "url": "assets/js/13.fa7906b3.js",
    "revision": "671dd979ed18915d59597f2cc900921f"
  },
  {
    "url": "assets/js/14.3149a51e.js",
    "revision": "8f296bfbf4f9bc7f014de4100978cb8a"
  },
  {
    "url": "assets/js/15.384be865.js",
    "revision": "e6bece0de9d2dd4bff498fefc50a17ae"
  },
  {
    "url": "assets/js/16.748cb3cf.js",
    "revision": "1cd637fcf351031bf442794740f8f2df"
  },
  {
    "url": "assets/js/17.3c2c022a.js",
    "revision": "53ff25479f23b6cdeb4e355d0d8f414b"
  },
  {
    "url": "assets/js/18.ea50cc88.js",
    "revision": "01e5d4f36fbdbaa58d7bcbec5d02dd46"
  },
  {
    "url": "assets/js/19.9a06fffd.js",
    "revision": "b90c6a39ce9feb1b455aa0e3dca1e539"
  },
  {
    "url": "assets/js/2.0c3bff11.js",
    "revision": "36bac5b702f87853fbfdc06628368ba9"
  },
  {
    "url": "assets/js/20.15226279.js",
    "revision": "cf3b491aa7e162b8a374250b4dae78d8"
  },
  {
    "url": "assets/js/21.0319f7e9.js",
    "revision": "5f3a414bf4ccd29809ddd4309217790a"
  },
  {
    "url": "assets/js/22.8d0744f7.js",
    "revision": "2b09ccde1d6d0dd09bfec1fa8a4a5bc4"
  },
  {
    "url": "assets/js/23.dd555d3f.js",
    "revision": "05c0951f02126000f12cf69d4ebb58c5"
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
    "url": "assets/js/9.6247261a.js",
    "revision": "7c7585d03d616fa40580c14101670382"
  },
  {
    "url": "assets/js/app.d8957b58.js",
    "revision": "f9cce24d7071f106c13885b3d509e3b7"
  },
  {
    "url": "configuration.html",
    "revision": "ce46423ab61d79ad67f2833a6ac2704f"
  },
  {
    "url": "guide/advanced/adapters.html",
    "revision": "c60638c058844a270d07fa268e71d730"
  },
  {
    "url": "guide/advanced/field-builders.html",
    "revision": "6ce50c375cce456e8e394f662ddfd287"
  },
  {
    "url": "guide/models/conventions.html",
    "revision": "ebdc8524db8c5ef67e7495bc1ca451e2"
  },
  {
    "url": "guide/models/crud.html",
    "revision": "fddc781d53cb531f34d741785734b307"
  },
  {
    "url": "guide/models/customising-models.html",
    "revision": "46145c719405dc6018dc1f2ef965df1c"
  },
  {
    "url": "guide/models/decorators.html",
    "revision": "33033c8403ed54752de56a4f3ee145b1"
  },
  {
    "url": "guide/models/define-models.html",
    "revision": "634354f2b95d099219ff1af0e4d255ad"
  },
  {
    "url": "guide/models/fields.html",
    "revision": "12998b5f474c164aa8cd8fd19e3259e7"
  },
  {
    "url": "guide/models/hooks.html",
    "revision": "2c67ecaea4c460e6cb8bb22994d74043"
  },
  {
    "url": "guide/query-builder/dynamic-query-operations.html",
    "revision": "de855927150cf1310e7c0b95e1068323"
  },
  {
    "url": "guide/query-builder/filters.html",
    "revision": "afeb9bbfb7e0887632ea58cfa6479318"
  },
  {
    "url": "guide/query-builder/index.html",
    "revision": "eec48c18f44b24ee4e63c9971ba1da6b"
  },
  {
    "url": "guide/query-builder/query-arguments.html",
    "revision": "5db6b0ee2c5f85ad63ebf00984387601"
  },
  {
    "url": "guide/query-builder/relationships.html",
    "revision": "7d192f6ef39e1ed151bccb40cf050156"
  },
  {
    "url": "guide/query-builder/select-fields.html",
    "revision": "0077b1fe3cdd2fe4ffa35c6af8c7205a"
  },
  {
    "url": "index.html",
    "revision": "fd947f933aef277ea1aaef90255885bd"
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
