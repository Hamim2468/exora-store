# EXORA V5 — Full Store Build

Built from the latest uploaded EXORA V4 source.

Included pages:
- index.html
- shop.html
- product.html
- cart.html
- checkout.html
- orders.html
- order-detail.html
- wishlist.html
- about.html

Shared modules:
- css/core.css
- css/cinematic.css
- css/responsive.css
- js/products.js
- js/motion.js
- js/store.js

V5 changes:
- Removes the duplicated V4 animation/quick-view/cursor systems.
- Uses one Motion engine.
- Desktop gets pointer-driven cinematic depth and 3D card/gallery interaction.
- Mobile gets scroll/touch-safe motion rather than continuous mouse tracking.
- Uses lazy/deferred image loading and shared code.
- Keeps localStorage cart, wishlist and local order cache.
- Keeps the existing Google Apps Script endpoint and no-login phone-based order tracking flow from V4.
- Keeps Dhaka delivery at ৳100, bKash number 01312353430 and a 3-hour cancellation window, matching the latest source.

Important:
The product image filenames are kept exactly as referenced by the latest V4 source. Copy the same product image files into the repository root (or update the paths) before publishing.
The Google Apps Script backend is external; the frontend cannot independently verify a no-cors POST response.
Test checkout/order tracking on the real GitHub Pages domain before going live.
