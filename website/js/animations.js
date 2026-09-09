/* ==========================================================================
   GROWN UP SYSTEMS — animations.js
   Triggers CSS animation classes defined in animations.css.
   Uses event delegation so it works with buttons rendered dynamically by
   main.js / products.js / cart.js, without modifying those files.
   ========================================================================== */

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('.product-card__add');
  if (!addButton) return;

  // Button success flash
  addButton.classList.remove('is-added'); // reset if clicked rapidly
  // Force reflow so the animation can restart if triggered again quickly
  void addButton.offsetWidth;
  addButton.classList.add('is-added');
  addButton.addEventListener(
    'animationend',
    () => addButton.classList.remove('is-added'),
    { once: true }
  );

  // Cart badge pulse
  const badge = document.getElementById('cartCount');
  if (badge) {
    // Wait one tick so main.js's updateCartCount() has already run
    // and set the new number before we pulse it.
    setTimeout(() => {
      badge.classList.remove('is-pulsing');
      void badge.offsetWidth;
      badge.classList.add('is-pulsing');
      badge.addEventListener(
        'animationend',
        () => badge.classList.remove('is-pulsing'),
        { once: true }
      );
    }, 50);
  }
});
