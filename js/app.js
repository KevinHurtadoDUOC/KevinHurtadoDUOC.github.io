// Este archivo se encarga de preparar la página cuando se abre.
// Revisa qué página está cargada y luego activa las funciones necesarias
// como mostrar productos, actualizar el carrito o conectar formularios.
// En otras palabras: aquí se define el comportamiento general de toda la interfaz.
document.addEventListener('DOMContentLoaded', () => {
  // Al cargar la página, primero se aseguran los productos base y se actualiza
  // la información visible del carrito y del usuario.
  ensureSeedProducts();
  updateCartBadge();
  updateUserNav();
  showQueuedNotice();

  // Lee el nombre de la página desde el atributo data-page del body.
  // Por ejemplo: si la página es index.html, el valor será 'index'.
  const currentPage = document.body.dataset.page;

  // Si estamos en la página principal, se muestran solo los productos destacados.
  if (currentPage === 'index') {
    CATALOG.renderFeaturedProducts();
  }

  // Si estamos en el catálogo, se cargan todos los productos y se preparan los filtros.
  if (currentPage === 'catalogo') {
    CATALOG.renderCatalog();
  }

  // Si estamos en el detalle del producto, se busca ese producto por su id.
  if (currentPage === 'producto') {
    CATALOG.renderProductDetail();
  }

  // Si estamos en el carrito, se dibujan los elementos que ya están guardados.
  if (currentPage === 'carrito') {
    CART.renderCart();
  }

  // En el formulario de registro, se conecta el evento submit con AUTH.register.
  // Eso significa que cuando el usuario envía el formulario, se ejecuta la función de registro.
  if (currentPage === 'registro') {
    const form = document.querySelector('#register-form');
    if (form) {
      form.addEventListener('submit', (event) => AUTH.register(event));
    }
  }

  // En el formulario de login, se conecta el submit con AUTH.login.
  if (currentPage === 'login') {
    const form = document.querySelector('#login-form');
    if (form) {
      form.addEventListener('submit', (event) => AUTH.login(event));
    }
  }

  // Este listener global captura clicks en cualquier botón que tenga el atributo data-action.
  // Dependiendo de la acción, llama a la función correcta del carrito.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');

    // Si el click no ocurrió sobre un elemento con data-action, la función termina.
    if (!trigger) return;

    const action = trigger.dataset.action;
    const productId = trigger.dataset.id;

    if (action === 'add-to-cart') {
      CART.add(productId);
      return;
    }

    if (action === 'increase-qty') {
      CART.increaseQuantity(productId);
      return;
    }

    if (action === 'decrease-qty') {
      CART.decreaseQuantity(productId);
      return;
    }
  });

  // Si existe un botón para vaciar el carrito, se le asigna la acción correspodiente.
  const clearCartBtn = document.querySelector('#clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => CART.clearCart());
  }

  // Si existe el botón de pago, se conecta con checkout para finalizar la compra.
  const checkoutBtn = document.querySelector('#checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => CART.checkout());
  }

  // Si existe el botón de cerrar sesión, se borra la sesión actual y se redirige.
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeCurrentUser();
      updateUserNav();
      window.location.href = 'index.html';
    });
  }

  // El formulario de contacto no guarda mensajes en una base de datos;
  // solo muestra un aviso y limpia el formulario.
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showNotice('Gracias por contactarnos.', 'success');
      event.target.reset();
    });
  }
});

// Esta función busca si ya existe un contenedor para mensajes.
// Si no existe, lo crea y lo agrega al final del documento para que los avisos
// puedan mostrarse en cualquier página.
function ensureNoticeContainer() {
  let container = document.querySelector('.inline-notice-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'inline-notice-container';
    document.body.appendChild(container);
  }

  return container;
}

// Aquí se construye el mensaje visual que aparece en la pantalla.
// Primero se consigue el contenedor, luego se crean elementos HTML como
// un icono, un título y el texto del aviso, y finalmente se agregan al DOM.
function showNotice(message, type = 'info') {
  const container = ensureNoticeContainer();
  const notice = document.createElement('div');
  notice.className = `notice-card ${type}`;

  const icon = document.createElement('div');
  icon.className = 'notice-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : 'i';

  const text = document.createElement('div');
  text.className = 'notice-text';

  const title = document.createElement('strong');
  title.textContent = type === 'success' ? 'Éxito' : type === 'error' ? 'Atención' : 'Información';

  const description = document.createElement('span');
  description.textContent = message;

  text.appendChild(title);
  text.appendChild(description);
  notice.appendChild(icon);
  notice.appendChild(text);

  container.appendChild(notice);

  // requestAnimationFrame permite esperar un pequeño instante para aplicar la animación.
  requestAnimationFrame(() => notice.classList.add('visible'));

  // Después de 2.8 segundos, el aviso se oculta y luego se elimina del DOM.
  setTimeout(() => {
    notice.classList.remove('visible');
    setTimeout(() => notice.remove(), 250);
  }, 2800);
}

// Esta función guarda un mensaje en sessionStorage para que pueda mostrarse
// más adelante, por ejemplo después de redirigir a otra página.
function queueNotice(message, type = 'info') {
  sessionStorage.setItem('ev_notice', JSON.stringify({ message, type }));
}

// Cuando se carga la página, esta función revisa si hay un aviso pendiente.
// Si existe, lo toma, lo muestra y luego lo borra para que no vuelva a aparecer.
function showQueuedNotice() {
  const raw = sessionStorage.getItem('ev_notice');
  if (!raw) return;

  try {
    const { message, type } = JSON.parse(raw);
    showNotice(message, type);
  } catch {
    sessionStorage.removeItem('ev_notice');
    return;
  }

  sessionStorage.removeItem('ev_notice');
}

// Esta función cambia el contenido de la navegación según si el usuario ha iniciado sesión.
// Si hay un usuario activo, oculta opciones de login/registro y en su lugar
// muestra un saludo con su nombre y un botón para cerrar sesión.
function updateUserNav() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const currentUser = getCurrentUser();
  const loginLink = navActions.querySelector('a[href="login.html"]');
  const registerLink = navActions.querySelector('a[href="registro.html"]');
  const existingUserBadge = navActions.querySelector('.user-badge');
  const existingLogoutBtn = navActions.querySelector('.logout-btn');

  // Primero elimina elementos antiguos para no duplicarlos si esta función se ejecuta varias veces.
  if (existingUserBadge) existingUserBadge.remove();
  if (existingLogoutBtn) existingLogoutBtn.remove();

  // Vuelve a dejar visibles los enlaces de login y registro por defecto.
  if (loginLink) loginLink.style.display = 'inline-flex';
  if (registerLink) registerLink.style.display = 'inline-flex';

  // Si no hay usuario, la función termina aquí y la navegación queda con sus opciones normales.
  if (!currentUser) return;

  // Si hay sesión activa, oculta los enlaces que ya no deben verse.
  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) registerLink.style.display = 'none';

  // Crea un elemento visual con el nombre del usuario para identificarlo.
  const userBadge = document.createElement('div');
  userBadge.className = 'user-badge';
  userBadge.textContent = `Hola, ${currentUser.nombre}`;

  // Crea un botón para cerrar la sesión.
  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.className = 'btn btn-light logout-btn';
  logoutBtn.textContent = 'Cerrar sesión';

  navActions.appendChild(userBadge);
  navActions.appendChild(logoutBtn);
}
