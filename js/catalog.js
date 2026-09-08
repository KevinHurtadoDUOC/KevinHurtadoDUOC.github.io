const CATALOG = {
  renderFeaturedProducts() {
    const container = document.querySelector('#featured-products');
    if (!container) return;

    const products = getProducts().slice(0, 3);
    container.innerHTML = products.map((product) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.imagen}" alt="${product.nombre}" />
        </div>
        <div class="product-body">
          <p class="product-category">${product.categoria}</p>
          <h3 class="product-title">${product.nombre}</h3>
          <p class="product-description">${product.descripcion}</p>
          <div class="price-row">
            <span class="price-current">${formatCurrency(product.precioOferta)}</span>
            <span class="price-old">${formatCurrency(product.precio)}</span>
          </div>
          <div class="stock-meta">Stock disponible: ${product.stock}</div>
          <div class="product-actions">
            <button class="btn btn-primary" data-action="add-to-cart" data-id="${product.id}">Añadir al carrito</button>
            <a class="btn btn-secondary" href="producto.html?id=${product.id}">Ver detalle</a>
          </div>
        </div>
      </article>
    `).join('');
  },

  renderCatalog() {
    const container = document.querySelector('#catalog-grid');
    const categoryFilter = document.querySelector('#category-filter');
    const priceFilter = document.querySelector('#price-filter');

    if (!container) return;

    const products = getProducts();
    const categoryOptions = [...new Set(products.map((item) => item.categoria))];

    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="all">Todas</option>' + categoryOptions.map((category) => `
        <option value="${category}">${category}</option>
      `).join('');
    }

    this.applyFilters();

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    if (priceFilter) {
      priceFilter.addEventListener('change', () => this.applyFilters());
    }
  },

  applyFilters() {
    const container = document.querySelector('#catalog-grid');
    const categoryFilter = document.querySelector('#category-filter');
    const priceFilter = document.querySelector('#price-filter');

    if (!container) return;

    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedPrice = priceFilter ? priceFilter.value : 'all';

    let products = getProducts();

    if (selectedCategory !== 'all') {
      products = products.filter((item) => item.categoria === selectedCategory);
    }

    if (selectedPrice !== 'all') {
      const [min, max] = selectedPrice.split('-').map(Number);
      products = products.filter((item) => {
        const price = item.precioOferta;
        return price >= min && price <= max;
      });
    }

    container.innerHTML = products.map((product) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.imagen}" alt="${product.nombre}" />
        </div>
        <div class="product-body">
          <p class="product-category">${product.categoria}</p>
          <h3 class="product-title">${product.nombre}</h3>
          <p class="product-description">${product.descripcion}</p>
          <div class="price-row">
            <span class="price-current">${formatCurrency(product.precioOferta)}</span>
            <span class="price-old">${formatCurrency(product.precio)}</span>
          </div>
          <div class="stock-meta">Stock disponible: ${product.stock}</div>
          <div class="product-actions">
            <button class="btn btn-primary" data-action="add-to-cart" data-id="${product.id}">Añadir al carrito</button>
            <a class="btn btn-secondary" href="producto.html?id=${product.id}">Ver detalle</a>
          </div>
        </div>
      </article>
    `).join('');
  },

  renderProductDetail() {
    const container = document.querySelector('#product-detail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = getProductById(productId);

    if (!product) {
      container.innerHTML = '<div class="empty-cart"><h3>Producto no encontrado</h3><a class="btn btn-primary" href="catalogo.html">Volver al catálogo</a></div>';
      return;
    }

    container.innerHTML = `
      <div class="detail-image">
        <img src="${product.imagen}" alt="${product.nombre}" />
      </div>
      <div class="detail-copy">
        <span class="eyebrow accent">${product.categoria}</span>
        <h2>${product.nombre}</h2>
        <div class="detail-price">
          <span class="price-current">${formatCurrency(product.precioOferta)}</span>
          <span class="price-old">${formatCurrency(product.precio)}</span>
        </div>
        <div class="detail-meta">
          <span>Stock: ${product.stock}</span>
          <span>ID: ${product.id}</span>
        </div>
        <p>${product.descripcion}</p>
        <div class="product-actions">
          <button class="btn btn-primary" data-action="add-to-cart" data-id="${product.id}">Añadir al carrito</button>
          <a class="btn btn-secondary" href="catalogo.html">Volver</a>
        </div>
      </div>
    `;
  }
};
