/* ==========================================================================
   GROWN UP SYSTEMS — gallery.js
   Gallery loading, filtering and lightbox
   ========================================================================== */

const GALLERY_DATA_FILE = 'data/gallery.json';

let galleryItems = [];
let galleryCurrentIndex = 0;


/* ---------- Start gallery ---------- */

document.addEventListener('DOMContentLoaded', () => {
  loadGalleryData();
});


/* ---------- Load gallery data ---------- */

async function loadGalleryData() {
  const galleryGrid =
    document.getElementById('galleryGrid');

  if (!galleryGrid) {
    return;
  }

  try {
    const response =
      await fetch(GALLERY_DATA_FILE);

    if (!response.ok) {
      throw new Error(
        `Failed to load ${GALLERY_DATA_FILE}`
      );
    }

    const gallery =
      await response.json();

    if (!Array.isArray(gallery)) {
      throw new Error(
        'Gallery data must be an array.'
      );
    }

    renderGallery(
      galleryGrid,
      gallery
    );

    setupGalleryFilters();

    setupGalleryLightbox();

  } catch (error) {

    console.error(
      'Error loading gallery:',
      error
    );

    galleryGrid.innerHTML =
      '<p class="placeholder-note">Unable to load gallery images right now.</p>';
  }
}


/* ---------- Render gallery ---------- */

function renderGallery(
  container,
  gallery
) {

  if (!gallery.length) {

    container.innerHTML =
      '<p class="placeholder-note">No gallery images available yet.</p>';

    return;
  }

  container.innerHTML =
    gallery.map((item, index) => `

      <article
        class="gallery-card"
        data-gallery-index="${index}"
        data-gallery-category="${escapeAttr(item.category)}">

        <button
          type="button"
          class="gallery-card__button"
          aria-label="View ${escapeAttr(item.title)}">

          <img
            src="${escapeAttr(item.image)}"
            alt="${escapeAttr(item.title)}"
            loading="lazy">

          <div class="gallery-card__overlay">

            <span class="gallery-card__category">
              ${escapeHtml(item.category)}
            </span>

            <h2 class="gallery-card__title">
              ${escapeHtml(item.title)}
            </h2>

            <span class="gallery-card__view">
              View image
            </span>

          </div>

        </button>

      </article>

    `).join('');
}


/* ---------- Gallery filters ---------- */

function setupGalleryFilters() {

  const filters =
    document.querySelectorAll(
      '.gallery-filter'
    );

  const cards =
    document.querySelectorAll(
      '.gallery-card'
    );

  if (!filters.length || !cards.length) {
    return;
  }

  filters.forEach(filter => {

    filter.addEventListener(
      'click',
      () => {

        const selectedCategory =
          filter.dataset.filter;

        filters.forEach(button => {
          button.classList.remove(
            'is-active'
          );
        });

        filter.classList.add(
          'is-active'
        );

        cards.forEach(card => {

          const cardCategory =
            card.dataset.galleryCategory;

          const shouldShow =
            selectedCategory === 'all' ||
            cardCategory === selectedCategory;

          card.hidden =
            !shouldShow;
        });

      }
    );

  });
}


/* ---------- Lightbox ---------- */

function setupGalleryLightbox() {

  const lightbox =
    document.getElementById(
      'galleryLightbox'
    );

  const image =
    document.getElementById(
      'galleryLightboxImage'
    );

  const caption =
    document.getElementById(
      'galleryLightboxCaption'
    );

  const closeButton =
    document.getElementById(
      'galleryLightboxClose'
    );

  const previousButton =
    document.getElementById(
      'galleryLightboxPrev'
    );

  const nextButton =
    document.getElementById(
      'galleryLightboxNext'
    );

  if (
    !lightbox ||
    !image ||
    !caption ||
    !closeButton ||
    !previousButton ||
    !nextButton
  ) {
    return;
  }


  const cards =
    document.querySelectorAll(
      '.gallery-card'
    );


  galleryItems =
    Array.from(cards).map(card => {

      const img =
        card.querySelector('img');

      const title =
        card.querySelector(
          '.gallery-card__title'
        );

      return {

        src:
          img
            ? img.src
            : '',

        alt:
          img
            ? img.alt
            : '',

        title:
          title
            ? title.textContent.trim()
            : ''
      };

    });


  cards.forEach(
    (card, index) => {

      const button =
        card.querySelector(
          '.gallery-card__button'
        );

      if (!button) {
        return;
      }

      button.addEventListener(
        'click',
        () => {
          openGalleryLightbox(index);
        }
      );

    }
  );


  closeButton.addEventListener(
    'click',
    closeGalleryLightbox
  );


  previousButton.addEventListener(
    'click',
    showPreviousGalleryImage
  );


  nextButton.addEventListener(
    'click',
    showNextGalleryImage
  );


  lightbox.addEventListener(
    'click',
    event => {

      if (
        event.target === lightbox
      ) {
        closeGalleryLightbox();
      }

    }
  );


  document.addEventListener(
    'keydown',
    event => {

      if (lightbox.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        closeGalleryLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousGalleryImage();
      }

      if (event.key === 'ArrowRight') {
        showNextGalleryImage();
      }

    }
  );

}


/* ---------- Open lightbox ---------- */

function openGalleryLightbox(index) {

  const lightbox =
    document.getElementById(
      'galleryLightbox'
    );

  const image =
    document.getElementById(
      'galleryLightboxImage'
    );

  const caption =
    document.getElementById(
      'galleryLightboxCaption'
    );

  if (
    !lightbox ||
    !image ||
    !caption ||
    !galleryItems.length
  ) {
    return;
  }


  galleryCurrentIndex =
    index;


  updateGalleryLightbox();


  lightbox.hidden =
    false;

  lightbox.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.classList.add(
    'gallery-lightbox-open'
  );

}


/* ---------- Close lightbox ---------- */

function closeGalleryLightbox() {

  const lightbox =
    document.getElementById(
      'galleryLightbox'
    );

  const image =
    document.getElementById(
      'galleryLightboxImage'
    );

  if (!lightbox) {
    return;
  }


  lightbox.hidden =
    true;

  lightbox.setAttribute(
    'aria-hidden',
    'true'
  );


  if (image) {
    image.src =
      '';
  }


  document.body.classList.remove(
    'gallery-lightbox-open'
  );

}


/* ---------- Previous image ---------- */

function showPreviousGalleryImage() {

  if (!galleryItems.length) {
    return;
  }


  galleryCurrentIndex =
    (
      galleryCurrentIndex -
      1 +
      galleryItems.length
    ) %
    galleryItems.length;


  updateGalleryLightbox();

}


/* ---------- Next image ---------- */

function showNextGalleryImage() {

  if (!galleryItems.length) {
    return;
  }


  galleryCurrentIndex =
    (
      galleryCurrentIndex +
      1
    ) %
    galleryItems.length;


  updateGalleryLightbox();

}


/* ---------- Update lightbox ---------- */

function updateGalleryLightbox() {

  const image =
    document.getElementById(
      'galleryLightboxImage'
    );

  const caption =
    document.getElementById(
      'galleryLightboxCaption'
    );

  if (
    !image ||
    !caption ||
    !galleryItems.length
  ) {
    return;
  }


  const item =
    galleryItems[
      galleryCurrentIndex
    ];


  image.src =
    item.src;

  image.alt =
    item.alt;

  caption.textContent =
    item.title;

}


/* ---------- HTML escaping ---------- */

function escapeHtml(str) {

  if (str == null) {
    return '';
  }

  return String(str)
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    );

}


function escapeAttr(str) {

  return escapeHtml(str)
    .replace(
      /"/g,
      '&quot;'
    );

}
