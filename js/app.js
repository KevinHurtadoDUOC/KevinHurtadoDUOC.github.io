document.addEventListener('DOMContentLoaded', () => {
  ensureSeedProducts();
  updateCartBadge();
  updateUserNav();
  showQueuedNotice();

  const currentPage = document.body.dataset.page;

  if (currentPage === 'index') {
    CATALOG.renderFeaturedProducts();
  }

  if (currentPage === 'catalogo') {
    CATALOG.renderCatalog();
  }

  if (currentPage === 'producto') {
    CATALOG.renderProductDetail();
  }

  if (currentPage === 'carrito') {
    CART.renderCart();
  }

  if (currentPage === 'registro') {
    const form = document.querySelector('#register-form');
    if (form) {
      form.addEventListener('submit', (event) => AUTH.register(event));
    }
  }

  if (currentPage === 'login') {
    const form = document.querySelector('#login-form');
    if (form) {
      form.addEventListener('submit', (event) => AUTH.login(event));
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');

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

  const clearCartBtn = document.querySelector('#clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => CART.clearCart());
  }

  const checkoutBtn = document.querySelector('#checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => CART.checkout());
  }

  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeCurrentUser();
      updateUserNav();
      window.location.href = 'index.html';
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showNotice('Gracias por contactarnos.', 'success');
      event.target.reset();
    });
  }
});

function ensureNoticeContainer() {
  let container = document.querySelector('.inline-notice-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'inline-notice-container';
    document.body.appendChild(container);
  }

  return container;
}

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

  requestAnimationFrame(() => notice.classList.add('visible'));

  setTimeout(() => {
    notice.classList.remove('visible');
    setTimeout(() => notice.remove(), 250);
  }, 2800);
}

function queueNotice(message, type = 'info') {
  sessionStorage.setItem('ev_notice', JSON.stringify({ message, type }));
}

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

function updateUserNav() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const currentUser = getCurrentUser();
  const loginLink = navActions.querySelector('a[href="login.html"]');
  const registerLink = navActions.querySelector('a[href="registro.html"]');
  const existingUserBadge = navActions.querySelector('.user-badge');
  const existingLogoutBtn = navActions.querySelector('.logout-btn');

  if (existingUserBadge) existingUserBadge.remove();
  if (existingLogoutBtn) existingLogoutBtn.remove();

  if (loginLink) loginLink.style.display = 'inline-flex';
  if (registerLink) registerLink.style.display = 'inline-flex';

  if (!currentUser) return;

  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) registerLink.style.display = 'none';

  const userBadge = document.createElement('div');
  userBadge.className = 'user-badge';
  userBadge.textContent = `Hola, ${currentUser.nombre}`;

  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.className = 'btn btn-light logout-btn';
  logoutBtn.textContent = 'Cerrar sesión';

  navActions.appendChild(userBadge);
  navActions.appendChild(logoutBtn);
}
