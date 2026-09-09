/* ==========================================================================
   GROWN UP SYSTEMS — includes.js
   Loads shared header.html and footer.html partials into any page that
   contains #header-placeholder and #footer-placeholder elements.

   After both partials are successfully injected, applies aria-current="page"
   to the nav link matching <body data-page="..."> and dispatches a
   'partialsLoaded' event on document, so other scripts (main.js) can safely
   wait until the header/footer DOM actually exists before running.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadPartials();
});

async function loadPartials() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  const tasks = [];

  if (headerPlaceholder) {
    tasks.push(loadPartial('partials/header.html', headerPlaceholder, 'header'));
  } else {
    console.warn('includes.js: #header-placeholder not found on this page. Header was not loaded.');
  }

  if (footerPlaceholder) {
    tasks.push(loadPartial('partials/footer.html', footerPlaceholder, 'footer'));
  } else {
    console.warn('includes.js: #footer-placeholder not found on this page. Footer was not loaded.');
  }

  // Wait for whichever partials were actually requested to finish
  // (successfully or not) before continuing.
  await Promise.allSettled(tasks);

  applyActiveNavLink();
  applyActiveDivision();
  // Let other scripts (main.js) know it is now safe to look for header/footer
  // elements such as #navToggle, #mainNav, #currentYear, etc.
  document.dispatchEvent(new CustomEvent('partialsLoaded'));
}

async function loadPartial(url, targetElement, label) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request for ${url} failed with status ${response.status}`);
    }

    const html = await response.text();
    targetElement.innerHTML = html;
  } catch (err) {
    console.error(`includes.js: Failed to load ${label} partial from "${url}".`, err);
    // Leave the placeholder empty rather than showing broken markup.
    // The rest of the page still renders; only header/footer are affected.
  }
}

function applyActiveNavLink() {
  const currentPage = document.body.getAttribute('data-page');

  if (!currentPage) {
    console.warn('includes.js: <body> has no data-page attribute. Active navigation link will not be set.');
    return;
  }

  const navLink = document.querySelector(`.main-nav__list a[data-nav="${currentPage}"]`);

  if (navLink) {
    navLink.setAttribute('aria-current', 'page');
  }
  // No warning here if no match: energy.html intentionally has no
  // matching main-nav item, since Home should not be falsely marked active.
}

function applyActiveDivision() {
  const currentDivision = document.body.getAttribute('data-division');

  if (!currentDivision) {
    console.warn('includes.js: <body> has no data-division attribute. Division switcher will not show an active state.');
    return;
  }

  const options = document.querySelectorAll('.division-switcher__option');

  options.forEach(option => {
    if (option.getAttribute('data-division-link') === currentDivision) {
      option.classList.add('is-active');
      option.setAttribute('aria-current', 'true');
    } else {
      option.classList.remove('is-active');
      option.removeAttribute('aria-current');
    }
  });
}
