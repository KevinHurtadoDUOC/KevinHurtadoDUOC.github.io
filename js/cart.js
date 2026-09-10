// Este archivo controla el carrito de compras.
// Aquí se agregan productos, se muestran, se eliminan y se finaliza la compra.
// En resumen: este archivo representa la lógica del pedido del cliente.
const CART = {
  // Agrega uno o más productos al carrito.
  // Primero busca el producto, luego revisa si hay suficiente stock y finalmente lo guarda.
  // También evita que el usuario pida más de lo que hay disponible.
  add(productId, quantity = 1) {
    // Lee todos los productos disponibles y el carrito actual desde localStorage.
    const products = getProducts();
    const cart = getCart();

    // Busca el producto específico que se quiere agregar.
    const product = products.find((item) => item.id === productId);

    // Si el producto no existe, se muestra un error y se termina la operación.
    if (!product) {
      showNotice('Producto no encontrado.', 'error');
      return;
    }

    // Revisa si el producto ya estaba en el carrito.
    const existingItem = cart.find((item) => item.id === productId);
    const currentQty = existingItem ? existingItem.cantidad : 0;
    const availableQty = product.stock - currentQty;

    // Si la cantidad pedida supera lo disponible, se bloquea la acción.
    if (quantity > availableQty) {
      showNotice(`No puedes agregar más de ${availableQty} unidades. Stock disponible: ${product.stock}`, 'error');
      return;
    }

    // Si el producto ya existe, solo aumenta la cantidad.
    // Si no existe, lo agrega como un nuevo elemento del carrito.
    if (existingItem) {
      existingItem.cantidad += quantity;
    } else {
      cart.push({ id: productId, cantidad: quantity });
    }

    // Guarda el nuevo estado del carrito, actualiza el badge visual y muestra mensaje de éxito.
    saveCart(cart);
    updateCartBadge();
    showNotice('Producto agregado al carrito.', 'success');
  },

  // Muestra todos los productos que el usuario tiene en el carrito.
  // También actualiza el resumen con subtotal, envío y total.
  renderCart() {
    const container = document.querySelector('#cart-items');
    if (!container) return;

    const cart = getCart();
    const products = getProducts();

    // Si el carrito está vacío, se muestra un mensaje amigable con un botón para ir al catálogo.
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

    // Une cada item del carrito con la información completa del producto.
    const itemsWithProduct = cart.map((item) => {
      const product = products.find((storedProduct) => storedProduct.id === item.id);
      if (!product) return null;
      return { ...item, product };
    }).filter(Boolean);

    // Si después de unir datos no quedan productos válidos, se considera que el carrito está vacío.
    if (!itemsWithProduct.length) {
      container.innerHTML = '<div class="empty-cart"><h3>Tu carrito está vacío</h3></div>';
      this.renderSummary();
      return;
    }

    // Genera una tabla HTML con cada producto, su cantidad, precio unitario y subtotal.
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

    // Después de dibujar la tabla, actualiza el resumen financiero.
    this.renderSummary();
  },

  // Calcula y actualiza el resumen del carrito con precios y costo de envío.
  renderSummary() {
    const subtotalEl = document.querySelector('#subtotal');
    const shippingEl = document.querySelector('#shipping');
    const totalEl = document.querySelector('#total');

    // Si algunos elementos del DOM no existen, la función corta aquí.
    if (!subtotalEl || !shippingEl || !totalEl) return;

    const cart = getCart();
    const products = getProducts();
    let subtotal = 0;

    // Recorre cada item del carrito y suma su precio según la cantidad.
    cart.forEach((item) => {
      const product = products.find((storedProduct) => storedProduct.id === item.id);
      if (product) {
        subtotal += product.precioOferta * item.cantidad;
      }
    });

    // El envío cuesta 2500 si hay algo en el carrito; si está vacío, el envío es 0.
    const shipping = subtotal > 0 ? 2500 : 0;
    const total = subtotal + shipping;

    // Escribe los valores en los elementos del resumen.
    subtotalEl.textContent = formatCurrency(subtotal);
    shippingEl.textContent = formatCurrency(shipping);
    totalEl.textContent = formatCurrency(total);
  },

  // Suma una unidad a un producto ya agregado al carrito.
  increaseQuantity(productId) {
    const cart = getCart();
    const product = getProductById(productId);
    const item = cart.find((entry) => entry.id === productId);

    // Si no existe el item o el producto, no se hace nada.
    if (!item || !product) return;

    // Si ya alcanzó el stock máximo, muestra un aviso en lugar de seguir sumando.
    if (item.cantidad >= product.stock) {
      showNotice('No hay más stock disponible para este producto.', 'error');
      return;
    }

    // Aumenta 1 y vuelve a guardar para que se refleje en el navegador.
    item.cantidad += 1;
    saveCart(cart);
    this.renderCart();
    updateCartBadge();
  },

  // Resta una unidad al producto seleccionado.
  // Si la cantidad llega a cero, elimina ese producto del carrito.
  decreaseQuantity(productId) {
    const cart = getCart();
    const itemIndex = cart.findIndex((entry) => entry.id === productId);

    if (itemIndex === -1) return;

    // Si hay más de 1 unidad, solo resta una.
    if (cart[itemIndex].cantidad > 1) {
      cart[itemIndex].cantidad -= 1;
      saveCart(cart);
      this.renderCart();
      updateCartBadge();
      return;
    }

    // Si la cantidad llega a 1 y se presiona menos, se elimina el producto del carrito.
    cart.splice(itemIndex, 1);
    saveCart(cart);
    this.renderCart();
    updateCartBadge();
  },

  // Vacía por completo el carrito de compras.
  clearCart() {
    saveCart([]);
    this.renderCart();
    updateCartBadge();
  },

  // Finaliza la compra.
  // Si el usuario no ha iniciado sesión, lo manda a login.
  // Si hay stock suficiente, descuenta productos y limpia el carrito.
  checkout() {
    const cart = getCart();
    const products = getProducts();
    const currentUser = getCurrentUser();

    // Si el carrito está vacío, no puede finalizar compra.
    if (!cart.length) {
      showNotice('Tu carrito está vacío.', 'error');
      return;
    }

    // Si no hay sesión activa, obliga al usuario a iniciar sesión antes de pagar.
    if (!currentUser) {
      queueNotice('Debes iniciar sesión para finalizar tu compra.', 'error');
      window.location.href = 'login.html';
      return;
    }

    // Recorre cada producto del carrito para verificar que todavía haya stock suficiente.
    for (const item of cart) {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) continue;

      const remainingStock = product.stock - item.cantidad;
      if (remainingStock < 0) {
        showNotice(`No hay stock suficiente para ${product.nombre}.`, 'error');
        return;
      }

      // Si hay stock, actualiza el valor del producto para reflejar la venta.
      product.stock = remainingStock;
    }

    // Guarda los productos con stock actualizado, vacía el carrito y muestra éxito.
    saveProducts(products);
    saveCart([]);
    updateCartBadge();
    queueNotice('Compra finalizada con éxito.', 'success');
    window.location.href = 'index.html';
  }
};
