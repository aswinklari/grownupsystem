const PRODUCTS_DATA_FILE = 'data/systems.json';


document.addEventListener(
  'partialsLoaded',
  initProductsPage
);


async function initProductsPage() {

  const productGrid =
    document.getElementById('productGrid');

  if (!productGrid) return;


  try {

    const response =
      await fetch(PRODUCTS_DATA_FILE);


    if (!response.ok) {

      throw new Error(
        'Failed to load product data'
      );

    }


    const data =
      await response.json();


    let products =
      data.products || [];


    setupFilters(
      data,
      products
    );


  }

  catch (error) {

    console.error(error);


    productGrid.innerHTML = `

      <p class="placeholder-note">

        Unable to load products.

      </p>

    `;

  }

}



function setupFilters(data, products) {

  const categoryFilter =
    document.getElementById(
      'categoryFilter'
    );


  const brandFilter =
    document.getElementById(
      'brandFilter'
    );


  const sortSelect =
    document.getElementById(
      'sortProducts'
    );


  const clearButton =
    document.getElementById(
      'clearFilters'
    );


  const params =
    new URLSearchParams(
      window.location.search
    );


  const category =
    params.get('category') || '';


  const brand =
    params.get('brand') || '';


  const query =
    (params.get('q') || '').trim();


  const productBrandNames =
    [...new Set(
      products
        .map(product => product.brand)
        .filter(Boolean)
    )];


  const resolvedRequestedBrand =
    resolveBrandName(
      brand,
      data.brands || [],
      productBrandNames
    );


  let hasUnmatchedRequestedBrand =
    Boolean(brand && !resolvedRequestedBrand);


  /* Populate categories */

  if (categoryFilter) {

    data.categories.forEach(cat => {

      const option =
        document.createElement('option');


      option.value =
        cat.slug;


      option.textContent =
        cat.name;


      categoryFilter.appendChild(option);

    });


    categoryFilter.value =
      category;

  }



  /* Populate brands */

  if (brandFilter) {

    productBrandNames.forEach(
      brandName => {

        const option =
          document.createElement(
            'option'
          );


        option.value =
          brandName;


        option.textContent =
          brandName;


        brandFilter.appendChild(option);

      }
    );


    brandFilter.value =
      resolvedRequestedBrand;

  }



  function updateProducts() {

    let filtered =
      [...products];


    const selectedCategory =
      categoryFilter?.value || '';


    const selectedBrand =
      brandFilter?.value || '';


    if (selectedCategory) {

      filtered =
        filtered.filter(
          product =>
            product.category ===
            selectedCategory
        );

    }


    if (hasUnmatchedRequestedBrand) {

      filtered = [];

    }


    if (selectedBrand) {

      filtered =
        filtered.filter(
          product =>
            normaliseBrandValue(
              product.brand
            ) ===
            normaliseBrandValue(
              selectedBrand
            )
        );

    }



    if (query) {

      const search =
        query.toLowerCase();


      filtered =
        filtered.filter(product =>
          [
            product.name,
            product.brand,
            product.category,
            product.shortDescription,
            product.description,
            product.sku
          ]
            .filter(Boolean)
            .some(value =>
              String(value)
                .toLowerCase()
                .includes(search)
            )
        );

    }



    const sort =
      sortSelect?.value;


    if (sort === 'price-low') {

      filtered.sort(
        (a, b) =>
          getSortablePrice(a, 'low') -
          getSortablePrice(b, 'low')
      );

    }


    if (sort === 'price-high') {

      filtered.sort(
        (a, b) =>
          getSortablePrice(b, 'high') -
          getSortablePrice(a, 'high')
      );

    }


    if (sort === 'name') {

      filtered.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }


    renderProducts(
      filtered
    );

  }



  categoryFilter?.addEventListener(
    'change',
    updateProducts
  );


  brandFilter?.addEventListener(
    'change',
    () => {

      hasUnmatchedRequestedBrand = false;

      updateProducts();

    }
  );


  sortSelect?.addEventListener(
    'change',
    updateProducts
  );


  clearButton?.addEventListener(
    'click',
    () => {

      if (categoryFilter)
        categoryFilter.value = '';


      if (brandFilter)
        brandFilter.value = '';


      if (sortSelect)
        sortSelect.value = 'default';


      hasUnmatchedRequestedBrand = false;


      window.history.replaceState(
        {},
        '',
        'products.html'
      );


      updateProducts();

    }
  );


  updateProducts();

}



function renderProducts(products) {

  const grid =
    document.getElementById(
      'productGrid'
    );


  const count =
    document.getElementById(
      'productCount'
    );


  if (!grid) return;


  if (count) {

    count.textContent =
      `${products.length} product${
        products.length === 1
          ? ''
          : 's'
      } found`;

  }



  if (!products.length) {

    grid.innerHTML = `

      <p class="placeholder-note">

        No products found.

      </p>

    `;

    return;

  }



  grid.innerHTML =
    products
      .map(
        productCardHTML
      )
      .join('');


  setupAddToCart();

}


function normaliseBrandValue(value) {

  return String(value || '')
    .trim()
    .toLowerCase();

}


function resolveBrandName(
  requestedBrand,
  brands,
  productBrandNames
) {

  const requested =
    normaliseBrandValue(requestedBrand);


  if (!requested) return '';


  const directProductBrand =
    productBrandNames.find(
      brandName =>
        normaliseBrandValue(brandName) ===
        requested
    );


  if (directProductBrand) return directProductBrand;


  const matchingBrand =
    brands.find(
      brand =>
        normaliseBrandValue(brand.slug) === requested
        ||
        normaliseBrandValue(brand.name) === requested
    );


  if (!matchingBrand) return '';


  return productBrandNames.find(
    brandName =>
      normaliseBrandValue(brandName) ===
      normaliseBrandValue(matchingBrand.name)
  ) || '';

}


function getSortablePrice(product, direction) {

  if (hasProductPrice(product.price)) {

    return product.price;

  }


  return direction === 'low'
    ? Number.POSITIVE_INFINITY
    : Number.NEGATIVE_INFINITY;

}
