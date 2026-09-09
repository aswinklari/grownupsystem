document.addEventListener(
  'partialsLoaded',
  loadProduct
);


async function loadProduct() {

  const container =
    document.getElementById(
      'productDetail'
    );


  if (!container) return;


  const params =
    new URLSearchParams(
      window.location.search
    );


  const slug =
    params.get('slug');


  if (!slug) {

    container.innerHTML = `

      <p class="placeholder-note">

        Product not found.

      </p>

    `;

    return;

  }


  try {

    const response =
      await fetch(
        'data/systems.json'
      );


    if (!response.ok) {

      throw new Error(
        'Failed to load product data'
      );

    }


    const data =
      await response.json();


    const product =
      data.products.find(
        item =>
          item.slug === slug
      );


    if (!product) {

      container.innerHTML = `

        <p class="placeholder-note">

          Product not found.

        </p>

      `;

      return;

    }


    renderProductDetail(
      container,
      product
    );


  }

  catch (error) {

    console.error(error);


    container.innerHTML = `

      <p class="placeholder-note">

        Unable to load product.

      </p>

    `;

  }

}



function renderProductDetail(
  container,
  product
) {

  container.innerHTML = `

    <div class="product-detail__image">

      <img
        src="${escapeAttr(product.image)}"
        alt="${escapeAttr(product.name)}">

    </div>


    <div class="product-detail__content">


      <p class="product-brand">

        ${escapeHtml(product.brand)}

      </p>


      <h1>

        ${escapeHtml(product.name)}

      </h1>


      <div class="product-detail__price">

        ${
          hasProductPrice(product.price)
            ? `₹${formatPrice(product.price)}`
            : 'Price on request'
        }

      </div>


      ${
        product.mrp
        ? `

        <p>

          MRP:

          <del>

            ₹${formatPrice(product.mrp)}

          </del>

        </p>

        `
        : ''
      }


      <p>

        ${escapeHtml(
          product.shortDescription
        )}

      </p>


      ${
        hasProductPrice(product.price)
          ? `
            <button
              class="btn btn--primary product-card__add"
              data-product-id="${escapeAttr(product.id)}">

              Add to Cart

            </button>
          `
          : `
            <a
              href="contact.html?topic=product-pricing&amp;product=${encodeURIComponent(product.slug)}"
              class="btn btn--primary">

              Enquire for Price

            </a>
          `
      }


    </div>

  `;


  setupAddToCart();

}
