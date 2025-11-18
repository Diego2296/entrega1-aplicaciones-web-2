
// Usamos un nombre de clave constante para el localStorage del carrito
const CART_KEY = 'tienda_cart';

/**
 * Obtiene el carrito desde localStorage.
 * @returns {Array} El carrito (un array de {id, quantity}).
 */
function getCart() {
  const cartData = localStorage.getItem(CART_KEY);
  return cartData ? JSON.parse(cartData) : [];
}

/**
 * Guarda el carrito en localStorage.
 * @param {Array} cart - El array del carrito a guardar.
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Añade un producto al carrito o incrementa su cantidad.
 * @param {number} productId - El ID del producto a añadir.
 */
function addToCart(productId) {
  const cart = getCart();
  const numericProductId = parseInt(productId);
  
  // findIndex 
  const itemIndex = cart.findIndex(item => item.id === numericProductId);

  if (itemIndex > -1) {
    // Si ya existe, incrementa la cantidad
    cart[itemIndex].quantity++;
  } else {
    // Si no existe, lo añade
    cart.push({ id: numericProductId, quantity: 1 });
  }
  
  saveCart(cart);
  alert('Producto añadido al carrito');
  console.log('Carrito actualizado:', cart);
}

/**
 * Limpia el carrito (usado después de la compra).
 */
function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// --- Lógica de Usuario ---
/**
 * Elimina un producto (por su ID) del carrito.
 * @param {number | string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
  let cart = getCart();
  const numericProductId = parseInt(productId);
  
  // Usamos filter (ES6) para crear un NUEVO array
  // que contenga solo los items cuyo ID *no* coincida.
  cart = cart.filter(item => item.id !== numericProductId);
  
  saveCart(cart); // Guardamos el nuevo carrito filtrado
  console.log('Carrito actualizado (item eliminado):', cart);
}

const USER_KEY = 'tienda_user';

function saveUser(userData) {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

function getUser() {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

function logoutUser() {
  localStorage.removeItem(USER_KEY);
}