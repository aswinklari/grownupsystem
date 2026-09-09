/* ==========================================================================
   GROWN UP SYSTEMS — main.js
   Core site behavior: mobile nav toggle, footer year, homepage
   category/product/brand/testimonial rendering from data/products.json.
   ========================================================================== */

const DIVISION_DATA_FILES = {
  systems: 'data/systems.json',
  energy: 'data/energy.json'
};

document.addEventListener('partialsLoaded', () => {

  setFooterYear();

  setupMobileNav();

  updateCartCount();

  loadHomepageData();

});

/* ---------- Footer year ---------- */
function setFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------- Mobile nav toggle ---------- */
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Load and render homepage data ---------- */
async function loadHomepageData() {
  const categoryGrid = document.getElementById('categoryGrid');
  const featuredGrid = document.getElementById('featuredProductGrid');
  const brandStrip = document.getElementById('brandStrip');
  const testimonialsGrid = document.getElementById('testimonialsGrid');

  // Only fetch if at least one target container exists on this page
  if (!categoryGrid && !featuredGrid && !brandStrip && !testimonialsGrid) return;

  const division = document.body.getAttribute('data-division') || 'systems';
  const dataFile = DIVISION_DATA_FILES[division];

  if (!dataFile) {
    console.error(`main.js: Unknown data-division="${division}". No matching data file configured.`);
    return;
  }

  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
    const data = await response.json();

    if (categoryGrid) renderCategories(categoryGrid, data.categories || []);
    if (featuredGrid) renderFeaturedProducts(featuredGrid, data.products || []);
    if (brandStrip) renderBrands(brandStrip, data.brands || []);
    if (testimonialsGrid) renderTestimonials(testimonialsGrid, data.testimonials || []);
  } catch (err) {
    console.error('Error loading homepage data:', err);
    if (categoryGrid) categoryGrid.innerHTML = '<p class="placeholder-note">Unable to load categories right now.</p>';
    if (featuredGrid) featuredGrid.innerHTML = '<p class="placeholder-note">Unable to load products right now.</p>';
  }
}

function renderCategories(container, categories) {
  if (!categories.length) {
    container.innerHTML = '<p class="placeholder-note">No categories available yet.</p>';
    return;
  }
  container.innerHTML = categories.map(cat => `
    <a class="category-card" href="products.html?category=${encodeURIComponent(cat.slug)}">
      <img src="${escapeAttr(cat.image)}" alt="${escapeAttr(cat.name)}" loading="lazy">
      <div class="category-card__label">${escapeHtml(cat.name)}</div>
    </a>
  `).join('');
}

function renderFeaturedProducts(container, products) {
  const featured = products.filter(p => p.featured);
  if (!featured.length) {
    container.innerHTML = '<p class="placeholder-note">No featured products available yet.</p>';
    return;
  }
  container.innerHTML = featured.map(p => productCardHTML(p)).join('');
  setupAddToCart(container);
}

function productCardHTML(p) {
  const hasPrice = hasProductPrice(p.price);
  const hasDiscount = p.mrp && hasPrice && p.mrp > p.price;
  const discountPercent = hasDiscount ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : null;

  return `
    <div class="product-card">
      <a href="product.html?slug=${encodeURIComponent(p.slug)}" class="product-card__image-wrap">
        <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy">
      </a>
      <div class="product-card__body">
        <a href="product.html?slug=${encodeURIComponent(p.slug)}" class="product-card__name">${escapeHtml(p.name)}</a>
        <div class="product-card__price-row">
          ${hasPrice ? `<span class="product-card__price">&#8377;${formatPrice(p.price)}</span>` : '<span class="product-card__price">Price on request</span>'}
          ${hasDiscount ? `<span class="product-card__mrp">&#8377;${formatPrice(p.mrp)}</span>` : ''}
          ${hasDiscount ? `<span class="product-card__discount">(${discountPercent}% OFF)</span>` : ''}
        </div>
        ${hasPrice ? `
          <button type="button" class="product-card__add" data-product-id="${escapeAttr(p.id)}">
            Add to Cart
          </button>
        ` : `
          <a href="contact.html?topic=product-pricing&amp;product=${encodeURIComponent(p.slug)}" class="btn btn--secondary product-card__enquire">
            Enquire for Price
          </a>
        `}
      </div>
    </div>
  `;
}

function renderBrands(container, brands) {
  if (!brands.length) {
    container.innerHTML = '<p class="placeholder-note">No brands available yet.</p>';
    return;
  }
  container.innerHTML = brands.map(b => `
    <a href="products.html?brand=${encodeURIComponent(b.slug)}" aria-label="${escapeAttr(b.name)}">
      <img src="${escapeAttr(b.logo)}" alt="${escapeAttr(b.name)}" loading="lazy">
    </a>
  `).join('');
}

function renderTestimonials(container, testimonials) {
  if (!testimonials.length) {
    container.innerHTML = '<p class="placeholder-note">No testimonials available yet.</p>';
    return;
  }
  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <p class="testimonial-card__quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
      <p class="testimonial-card__author">${escapeHtml(t.author)}</p>
    </div>
  `).join('');
}

/* ---------- Utilities ---------- */
function formatPrice(value) {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('en-IN');
}

function hasProductPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('grownUpCart') || '[]');

    if (!Array.isArray(cart)) return [];

    return cart
      .filter(item => item && item.id != null)
      .map(item => ({
        id: String(item.id),
        quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1)
      }));
  } catch (error) {
    console.warn('Unable to read the saved cart. Starting with an empty cart.', error);
    return [];
  }
}


function saveCart(cart) {

  localStorage.setItem(
    'grownUpCart',
    JSON.stringify(cart)
  );


  updateCartCount();

}



function addToCart(productId) {
  const id = String(productId);
  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart(cart);
  alert('Product added to cart');
}


function setCartItemQuantity(productId, quantity) {
  const id = String(productId);
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === id);

  if (itemIndex === -1) return;

  const nextQuantity = Number.parseInt(quantity, 10) || 0;

  if (nextQuantity <= 0) {
    cart.splice(itemIndex, 1);
  } else {
    cart[itemIndex].quantity = nextQuantity;
  }

  saveCart(cart);
}


function removeFromCart(productId) {
  const id = String(productId);
  saveCart(getCart().filter(item => item.id !== id));
}



function setupAddToCart(scope = document) {
  const buttons = scope.querySelectorAll('.product-card__add');

  buttons.forEach(button => {
    if (button.dataset.cartBound === 'true') return;

    button.dataset.cartBound = 'true';
    button.addEventListener('click', () => {
      addToCart(button.dataset.productId);
    });
  });
}



function updateCartCount() {

  const badge =
    document.getElementById(
      'cartCount'
    );


  if (!badge) return;


  const cart =
    getCart();


  const total =
    cart.reduce(

      (sum, item) =>

        sum + item.quantity,

      0

    );


  badge.textContent =
    total;


  badge.hidden =
    total === 0;

}
