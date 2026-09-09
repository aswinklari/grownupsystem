/* ==========================================================================
   GROWN UP SYSTEMS — image-fallback.js
   Catches any <img> that fails to load anywhere on the site and replaces
   it with a clean inline SVG placeholder (no external file needed).
   Uses event delegation with capture, so it works even for images
   injected dynamically by main.js / products.js / product.js AFTER
   this script runs, with zero changes to any existing render function.
   ========================================================================== */

(function () {
  const PLACEHOLDER_SVG =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#F7F9FC"/>
        <rect x="1" y="1" width="398" height="398" fill="none" stroke="#E2E8F0" stroke-width="2"/>
        <g fill="#5B6777">
          <circle cx="200" cy="160" r="36" fill="none" stroke="#5B6777" stroke-width="6"/>
          <path d="M140 260 L180 210 L220 240 L260 190 L300 260 Z" fill="#E2E8F0"/>
        </g>
        <text x="200" y="310" font-family="Arial, sans-serif" font-size="16" fill="#5B6777" text-anchor="middle">
          Image coming soon
        </text>
      </svg>
    `);

  document.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (!target || target.tagName !== 'IMG') return;
      if (target.dataset.fallbackApplied === 'true') return; // avoid loops

      target.dataset.fallbackApplied = 'true';
      target.src = PLACEHOLDER_SVG;
      target.alt = target.alt || 'Image coming soon';
      target.classList.add('img-fallback');
    },
    true // capture phase: catches the error event on <img>, which doesn't bubble
  );
})();
