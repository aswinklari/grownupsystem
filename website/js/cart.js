document.addEventListener(
  'partialsLoaded',
  loadCartPage
);


async function loadCartPage() {

  const container =
    document.getElementById(
      'cartContainer'
    );


  if (!container) return;


  let data;


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


    data =
      await response.json();

  }

  catch (error) {

    console.error(error);


    container.innerHTML = `

      <p class="placeholder-note">

        Unable to load your cart right now.

      </p>

    `;

    return;

  }


  const products =
    data.products || [];


  const renderCart = () => {

    const savedCart =
      getCart();


    const cartItems =
      savedCart.filter(item =>
        products.some(
          product =>
            String(product.id) === item.id
        )
      );


    if (cartItems.length !== savedCart.length) {

      saveCart(cartItems);

    }


    const cartProducts =
      cartItems.map(item => {

        const product =
          products.find(
            currentProduct =>
              String(currentProduct.id) === item.id
          );


        return {
          ...product,
          quantity: item.quantity
        };

      });


    if (!cartProducts.length) {

      container.innerHTML = `

        <div class="empty-cart empty-state">

          <h2>

            Your cart is empty

          </h2>

          <p>

            Browse our products
            and find what you need.

          </p>

          <a
            href="products.html"
            class="btn btn--primary">

            Browse Products

          </a>

        </div>

      `;

      return;

    }


    const totalQuantity =
      cartProducts.reduce(
        (total, product) =>
          total + product.quantity,
        0
      );


    const totalPrice =
      cartProducts.reduce(
        (total, product) =>
          total + (
            hasProductPrice(product.price)
              ? product.price * product.quantity
              : 0
          ),
        0
      );


    const hasPriceOnRequestItem =
      cartProducts.some(
        product =>
          !hasProductPrice(product.price)
      );


    container.innerHTML = `

      <div class="cart-list">

        ${cartProducts.map(product => `

          <article class="cart-item">

            <a
              href="product.html?slug=${encodeURIComponent(product.slug)}"
              class="cart-item__image-wrap">

              <img
                src="${escapeAttr(product.image)}"
                alt="${escapeAttr(product.name)}">

            </a>

            <div class="cart-item__details">

              <h3>

                <a href="product.html?slug=${encodeURIComponent(product.slug)}">

                  ${escapeHtml(product.name)}

                </a>

              </h3>

              <p class="cart-item__price">

                ${
                  hasProductPrice(product.price)
                    ? `₹${formatPrice(product.price)} each`
                    : 'Price on request'
                }

              </p>

              <div class="cart-item__actions">

                <div
                  class="qty-selector"
                  aria-label="Quantity for ${escapeAttr(product.name)}">

                  <button
                    type="button"
                    data-cart-action="decrease"
                    data-product-id="${escapeAttr(product.id)}"
                    aria-label="Decrease quantity of ${escapeAttr(product.name)}">

                    −

                  </button>

                  <span class="qty-selector__value" aria-live="polite">

                    ${product.quantity}

                  </span>

                  <button
                    type="button"
                    data-cart-action="increase"
                    data-product-id="${escapeAttr(product.id)}"
                    aria-label="Increase quantity of ${escapeAttr(product.name)}">

                    +

                  </button>

                </div>

                <button
                  type="button"
                  class="cart-item__remove"
                  data-cart-action="remove"
                  data-product-id="${escapeAttr(product.id)}">

                  Remove

                </button>

              </div>

            </div>

            <p class="cart-item__subtotal">

              ${
                hasProductPrice(product.price)
                  ? `₹${formatPrice(product.price * product.quantity)}`
                  : 'Price on request'
              }

            </p>

          </article>

        `).join('')}

      </div>

      <div class="cart-summary">

        <span>${totalQuantity} item${totalQuantity === 1 ? '' : 's'}</span>

        <strong>${
          hasPriceOnRequestItem
            ? 'Total: Price on request'
            : `Total: ₹${formatPrice(totalPrice)}`
        }</strong>

      </div>

    `;

  };


  container.addEventListener(
    'click',
    event => {

      const control =
        event.target.closest(
          '[data-cart-action]'
        );


      if (!control) return;


      const productId =
        control.dataset.productId;


      const currentItem =
        getCart().find(
          item => item.id === String(productId)
        );


      if (!currentItem) return;


      if (control.dataset.cartAction === 'increase') {

        setCartItemQuantity(
          productId,
          currentItem.quantity + 1
        );

      }


      if (control.dataset.cartAction === 'decrease') {

        setCartItemQuantity(
          productId,
          currentItem.quantity - 1
        );

      }


      if (control.dataset.cartAction === 'remove') {

        removeFromCart(productId);

      }


      renderCart();

    }
  );


  renderCart();

}
