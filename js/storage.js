// Este archivo guarda y lee la información del sitio en localStorage.
// localStorage es como una memoria interna del navegador donde quedan
// los productos, el carrito, los usuarios y la sesión actual.
// Este archivo es la base de datos simple del proyecto.
const STORAGE_KEYS = {
  products: 'ev_products',
  cart: 'ev_cart',
  users: 'ev_users',
  currentUser: 'ev_currentUser'
};

const SEED_PRODUCTS = [
  { id: 'CL001', nombre: 'Cilindro GLP 5 kg', categoria: 'Cilindros de Gas', precio: 6500, precioOferta: 6000, stock: 80, descripcion: 'Para uso residencial pequeño.', imagen: 'assets/img/cilindro_5kg.png' },
  { id: 'CL002', nombre: 'Cilindro GLP 11 kg', categoria: 'Cilindros de Gas', precio: 12000, precioOferta: 11000, stock: 200, descripcion: 'Cilindro estándar doméstico.', imagen: 'assets/img/cilindro_11kg.png' },
  { id: 'CL003', nombre: 'Cilindro GLP 15 kg', categoria: 'Cilindros de Gas', precio: 16000, precioOferta: 14500, stock: 90, descripcion: 'Mayor capacidad, alto consumo.', imagen: 'assets/img/cilindro_15kg.png' },
  { id: 'CL004', nombre: 'Cilindro GLP 45 kg', categoria: 'Cilindros de Gas', precio: 45000, precioOferta: 40000, stock: 30, descripcion: 'Uso comercial, restaurantes.', imagen: 'assets/img/cilindro_45kg.png' },
  { id: 'RG001', nombre: 'Regulador doméstico', categoria: 'Reguladores', precio: 8990, precioOferta: 8200, stock: 45, descripcion: 'Presión salida 28 mbar.', imagen: 'assets/img/regulador_domestico.png' },
  { id: 'RG002', nombre: 'Regulador alta presión', categoria: 'Reguladores', precio: 18990, precioOferta: 17000, stock: 12, descripcion: 'Cocinas industriales.', imagen: 'assets/img/regulador_alta_presion.png' },
  { id: 'RG003', nombre: 'Regulador dual', categoria: 'Reguladores', precio: 14990, precioOferta: 13500, stock: 18, descripcion: 'Permite 2 artefactos simultáneos.', imagen: 'assets/img/regulador_dual.png' },
  { id: 'MG001', nombre: 'Manguera gas 1.5 m', categoria: 'Mangueras y Conexiones', precio: 3990, precioOferta: 3500, stock: 80, descripcion: 'Homologada 9mm.', imagen: 'assets/img/manguera_1.5.png' },
  { id: 'MG002', nombre: 'Manguera reforzada 3.0 m', categoria: 'Mangueras y Conexiones', precio: 6500, precioOferta: 6000, stock: 30, descripcion: 'Mayor alcance y durabilidad.', imagen: 'assets/img/Manguera_reforzada_3m.png' },
  { id: 'KT001', nombre: 'Kit instalación gas', categoria: 'Mangueras y Conexiones', precio: 12000, precioOferta: 11000, stock: 25, descripcion: 'Incluye abrazaderas y teflón.', imagen: 'assets/img/Kit_instalación_gas.png' }
];

const IMAGE_PATHS = {
  CL001: 'assets/img/cilindro_5kg.png',
  CL002: 'assets/img/cilindro_11kg.png',
  CL003: 'assets/img/cilindro_15kg.png',
  CL004: 'assets/img/cilindro_45kg.png',
  RG001: 'assets/img/regulador_domestico.png',
  RG002: 'assets/img/regulador_alta_presion.png',
  RG003: 'assets/img/regulador_dual.png',
  MG001: 'assets/img/manguera_1.5.png',
  MG002: 'assets/img/Manguera_reforzada_3m.png',
  KT001: 'assets/img/Kit_instalación_gas.png'
};

// Intenta convertir un texto guardado en un objeto JavaScript.
// Si el texto está corrupto, devuelve null para evitar errores.
// Este helper sirve porque localStorage guarda todo como texto, no como objetos.
function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Corrige rutas de imagen para que todos los productos usen la misma ubicación correcta.
// Esto ayuda a evitar que algunos productos muestren imágenes rotas por rutas incorrectas.
function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];

  return products.map((product) => {
    const normalizedProduct = { ...product };
    const newImagePath = IMAGE_PATHS[product.id] || product.imagen;

    if (product.imagen !== newImagePath) {
      normalizedProduct.imagen = newImagePath;
    }

    return normalizedProduct;
  });
}

// Si no hay productos guardados, crea una lista inicial por defecto.
// También revisa si las imágenes necesitan arreglarse.
function ensureSeedProducts() {
  // Lee lo que ya exista en el navegador para no perder información.
  const existing = safeParse(localStorage.getItem(STORAGE_KEYS.products));

  // Si no existe nada o la información es inválida, se usa la lista base.
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(SEED_PRODUCTS));
    return;
  }

  // Normaliza los productos para asegurar que todas las imágenes tengan la ruta correcta.
  const normalizedProducts = normalizeProducts(existing);
  const hasUpdatedImages = JSON.stringify(existing) !== JSON.stringify(normalizedProducts);

  // Si hubo cambios en las rutas, se vuelven a guardar los datos corregidos.
  if (hasUpdatedImages) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(normalizedProducts));
  }
}

// Devuelve la lista de productos disponibles.
// Antes de devolverlos, vuelve a verificar que existan y estén bien formados.
function getProducts() {
  ensureSeedProducts();
  return safeParse(localStorage.getItem(STORAGE_KEYS.products)) || [];
}

// Guarda la lista de productos actualizada en el navegador.
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

// Lee el carrito actual guardado del usuario.
function getCart() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.cart)) || [];
}

// Guarda el carrito actualizado para que permanezca aunque recargues la página.
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

// Lee todos los usuarios registrados.
function getUsers() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.users)) || [];
}

// Guarda la lista de usuarios para que persista entre visitas.
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

// Obtiene el usuario que inició sesión en ese momento.
function getCurrentUser() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.currentUser));
}

// Guarda la sesión actual del usuario para identificarlo en toda la página.
function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

// Cierra la sesión borrando la información del usuario actual.
function removeCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

// Formatea un número como dinero chileno.
// Ejemplo: 12000 -> "$12.000".
function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

// Busca un producto por su identificador único.
// Esto permite encontrar rápidamente un producto sin recorrer todo el arreglo manualmente.
function getProductById(productId) {
  return getProducts().find((item) => item.id === productId);
}

// Actualiza la cantidad visible del carrito en la interfaz.
// Calcula la suma de todas las cantidades y la escribe en el badge del carrito.
function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.cantidad, 0);
  const badge = document.querySelector('#cart-count');
  if (badge) {
    badge.textContent = count;
  }
}
