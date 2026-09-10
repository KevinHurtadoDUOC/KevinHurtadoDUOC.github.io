// Este archivo crea la vista del catálogo y del detalle del producto.
// Lo importante aquí es pintar productos en la página según la sección donde estés.
// En otras palabras: este archivo toma los datos de los productos y los convierte
// en tarjetas o páginas HTML para que el usuario pueda verlos.
const CATALOG = {
  // Muestra los productos destacados en la página principal.
  // Se toma una pequeña cantidad del inventario (primero 3 productos) y se dibujan
  // como tarjetas con nombre, precio, stock y botón para agregar al carrito.
  renderFeaturedProducts() {
    const container = document.querySelector('#featured-products');
    if (!container) return;

    // getProducts() devuelve todos los productos, y slice(0, 3) toma solo los 3 primeros.
    const products = getProducts().slice(0, 3);

    // Se genera el HTML para cada producto usando un template string.
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

  // Carga el catálogo completo y prepara los filtros por categoría y precio.
  // Primero obtiene el contenedor donde se pintarán los productos,
  // luego crea las opciones de categoría y finalmente activa la lógica de filtros.
  renderCatalog() {
    const container = document.querySelector('#catalog-grid');
    const categoryFilter = document.querySelector('#category-filter');
    const priceFilter = document.querySelector('#price-filter');

    if (!container) return;

    const products = getProducts();

    // new Set elimina categorías repetidas para dejar solo una opción por tipo.
    const categoryOptions = [...new Set(products.map((item) => item.categoria))];

    // Si existe el filtro de categorías, crea las opciones dinámicamente.
    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="all">Todas</option>' + categoryOptions.map((category) => `
        <option value="${category}">${category}</option>
      `).join('');
    }

    // Llama a applyFilters para mostrar los productos según el estado inicial.
    this.applyFilters();

    // Cada vez que el usuario cambie un filtro, se vuelve a ejecutar applyFilters.
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    if (priceFilter) {
      priceFilter.addEventListener('change', () => this.applyFilters());
    }
  },

  // Aplica los filtros seleccionados por el usuario.
  // Solo muestra los productos que cumplen con la categoría y el rango de precio elegido.
  applyFilters() {
    const container = document.querySelector('#catalog-grid');
    const categoryFilter = document.querySelector('#category-filter');
    const priceFilter = document.querySelector('#price-filter');

    if (!container) return;

    // Lee la opción seleccionada en cada filtro.
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedPrice = priceFilter ? priceFilter.value : 'all';

    // Se toma la lista completa de productos como base.
    let products = getProducts();

    // Si el usuario eligió una categoría, se filtran solo los productos de esa categoría.
    if (selectedCategory !== 'all') {
      products = products.filter((item) => item.categoria === selectedCategory);
    }

    // Si eligió un rango de precios, se usan min y max para dejar solo los productos dentro del rango.
    if (selectedPrice !== 'all') {
      const [min, max] = selectedPrice.split('-').map(Number);
      products = products.filter((item) => {
        const price = item.precioOferta;
        return price >= min && price <= max;
      });
    }

    // Se dibujan nuevamente las tarjetas con los productos ya filtrados.
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

  // Muestra el detalle de un producto específico según el id recibido en la URL.
  // Por ejemplo, si la página se abre con producto.html?id=CL002, este método
  // busca ese producto y crea una vista más grande con toda la información.
  renderProductDetail() {
    const container = document.querySelector('#product-detail');
    if (!container) return;

    // URLSearchParams lee los parámetros que vienen en la URL.
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // getProductById busca el producto específico.
    const product = getProductById(productId);

    // Si no existe, se muestra un mensaje de producto no encontrado.
    if (!product) {
      container.innerHTML = '<div class="empty-cart"><h3>Producto no encontrado</h3><a class="btn btn-primary" href="catalogo.html">Volver al catálogo</a></div>';
      return;
    }

    // Genera el HTML del detalle del producto con imagen, nombre, precio y descripción.
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
