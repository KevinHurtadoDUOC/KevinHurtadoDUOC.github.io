const CART = {
  add(productId, quantity = 1) {
    const products = getProducts();
    const cart = getCart();
    const product = products.find((item) => item.id === productId);

    if (!product) {
      showNotice('Producto no encontrado.', 'error');
      return;
    }

    const existingItem = cart.find((item) => item.id === productId);
    const currentQty = existingItem ? existingItem.cantidad : 0;
    const availableQty = product.stock - currentQty;

    if (quantity > availableQty) {
      showNotice(`No puedes agregar más de ${availableQty} unidades. Stock disponible: ${product.stock}`, 'error');
      return;
    }

    if (existingItem) {
      existingItem.cantidad += quantity;
    } else {
      cart.push({ id: productId, cantidad: quantity });
    }

    saveCart(cart);
    updateCartBadge();
    showNotice('Producto agregado al carrito.', 'success');
  },

  renderCart() {
    const container = document.querySelector('#cart-items');
    if (!container) return;

    const cart = getCart();
    const products = getProducts();

    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde el catálogo.</p>
          <a href="catalogo.html" class="btn btn-primary">Ir al catálogo</a>
        </div>
      `;
      this.renderSummary();
      return;
    }

    const itemsWithProduct = cart.map((item) => {
      const product = products.find((storedProduct) => storedProduct.id === item.id);
      if (!product) return null;
      return { ...item, product };
    }).filter(Boolean);

    if (!itemsWithProduct.length) {
      container.innerHTML = '<div class="empty-cart"><h3>Tu carrito está vacío</h3></div>';
      this.renderSummary();
      return;
    }

    container.innerHTML = `
      <table class="cart-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsWithProduct.map((item) => `
            <tr>
              <td>
                <div class="cart-product">
                  <div class="cart-product-thumb">
                    <img src="${item.product.imagen}" alt="${item.product.nombre}" />
                  </div>
                  <div>
                    <strong>${item.product.nombre}</strong><br>
                    <small>${item.product.categoria}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="qty-controls">
                  <button type="button" data-action="decrease-qty" data-id="${item.id}">-</button>
                  <span>${item.cantidad}</span>
                  <button type="button" data-action="increase-qty" data-id="${item.id}">+</button>
                </div>
              </td>
              <td>${formatCurrency(item.product.precioOferta)}</td>
              <td>${formatCurrency(item.product.precioOferta * item.cantidad)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.renderSummary();
  },

  renderSummary() {
    const subtotalEl = document.querySelector('#subtotal');
    const shippingEl = document.querySelector('#shipping');
    const totalEl = document.querySelector('#total');

    if (!subtotalEl || !shippingEl || !totalEl) return;

    const cart = getCart();
    const products = getProducts();
    let subtotal = 0;

    cart.forEach((item) => {
      const product = products.find((storedProduct) => storedProduct.id === item.id);
      if (product) {
        subtotal += product.precioOferta * item.cantidad;
      }
    });

    const shipping = subtotal > 0 ? 2500 : 0;
    const total = subtotal + shipping;

    subtotalEl.textContent = formatCurrency(subtotal);
    shippingEl.textContent = formatCurrency(shipping);
    totalEl.textContent = formatCurrency(total);
  },

  increaseQuantity(productId) {
    const cart = getCart();
    const product = getProductById(productId);
    const item = cart.find((entry) => entry.id === productId);

    if (!item || !product) return;

    if (item.cantidad >= product.stock) {
      showNotice('No hay más stock disponible para este producto.', 'error');
      return;
    }

    item.cantidad += 1;
    saveCart(cart);
    this.renderCart();
    updateCartBadge();
  },

  decreaseQuantity(productId) {
    const cart = getCart();
    const itemIndex = cart.findIndex((entry) => entry.id === productId);

    if (itemIndex === -1) return;

    if (cart[itemIndex].cantidad > 1) {
      cart[itemIndex].cantidad -= 1;
      saveCart(cart);
      this.renderCart();
      updateCartBadge();
      return;
    }

    cart.splice(itemIndex, 1);
    saveCart(cart);
    this.renderCart();
    updateCartBadge();
  },

  clearCart() {
    saveCart([]);
    this.renderCart();
    updateCartBadge();
  },

  checkout() {
    const cart = getCart();
    const products = getProducts();
    const currentUser = getCurrentUser();

    if (!cart.length) {
      showNotice('Tu carrito está vacío.', 'error');
      return;
    }

    if (!currentUser) {
      queueNotice('Debes iniciar sesión para finalizar tu compra.', 'error');
      window.location.href = 'login.html';
      return;
    }

    for (const item of cart) {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) continue;

      const remainingStock = product.stock - item.cantidad;
      if (remainingStock < 0) {
        showNotice(`No hay stock suficiente para ${product.nombre}.`, 'error');
        return;
      }

      product.stock = remainingStock;
    }

    saveProducts(products);
    saveCart([]);
    updateCartBadge();
    queueNotice('Compra finalizada con éxito.', 'success');
    window.location.href = 'index.html';
  }
};
