document.addEventListener(
  'partialsLoaded',
  loadBrands
);


async function loadBrands() {

  const container =
    document.getElementById(
      'brandsGrid'
    );


  if (!container) return;


  try {

    const response =
      await fetch(
        'data/systems.json'
      );


    const data =
      await response.json();


    const brands =
      data.brands || [];


    if (!brands.length) {

      container.innerHTML = `

        <p class="placeholder-note">

          No brands are available yet.

        </p>

      `;

      return;

    }


    container.innerHTML =
      brands
        .map(
          brand => `

          <a
            class="brand-card"
            href="products.html?brand=${encodeURIComponent(
              brand.slug || brand.name
            )}">


            <img
              src="${escapeAttr(
                brand.logo
              )}"
              alt="${escapeAttr(
                brand.name
              )}">


            <h3>

              ${escapeHtml(
                brand.name
              )}

            </h3>


          </a>

          `
        )
        .join('');


  }

  catch (error) {

    console.error(error);


    container.innerHTML = `

      <p class="placeholder-note">

        Unable to load brands right now.

      </p>

    `;

  }

}
