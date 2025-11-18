// public/js/carrito.js

document.addEventListener('DOMContentLoaded', async () => {
  const cartContainer = document.getElementById('cart-items-container');
  const cartTotalEl = document.getElementById('cart-total');
  const btnComprar = document.getElementById('btn-comprar');
  const btnLogin = document.getElementById('btn-login');
  const loginStatusEl = document.getElementById('login-status');
  const usuarioLogueadoEl = document.getElementById('usuario-logueado');
  const compraStatusEl = document.getElementById('compra-status');
  
  // ¡NUEVO! Obtenemos el botón de logout
  const btnLogout = document.getElementById('btn-logout'); 

  let todosLosProductos = []; 
  let carrito = getCart(); 

  /**
   * Carga todos los productos desde el backend para obtener detalles.
   */
  async function fetchAllProducts() {
    try {
      const response = await fetch('/productos');
      if (!response.ok) throw new Error('No se pudieron cargar los productos');
      todosLosProductos = await response.json();
    } catch (error) {
      console.error(error);
      cartContainer.innerHTML = '<p class="text-danger">Error al cargar detalles de productos.</p>';
    }
  }

  /**
   * Renderiza los items del carrito en la tabla.
   */
  function renderizarCarrito() {
    cartContainer.innerHTML = '';
    let totalCalculado = 0;

    if (carrito.length === 0) {
      cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
      cartTotalEl.textContent = '0.00';
      btnComprar.disabled = true;
      return;
    }
    
    // ¡NUEVO! Añadimos la columna "Acción"
    const tablaHeader = `
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
            <th>Acción</th> 
          </tr>
        </thead>
        <tbody>
    `;
    
    let tablaBody = '';

    carrito.forEach(item => {
      const producto = todosLosProductos.find(p => p.id === item.id);
      if (producto) {
        const precio = parseFloat(producto.precio);
        const subtotal = precio * item.quantity;
        totalCalculado += subtotal;
        
        tablaBody += `
          <tr>
            <td>${producto.nombre}</td>
            <td>${item.quantity}</td>
            <td>$${precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            
            <td>
              <button 
                class="btn btn-danger btn-sm remove-from-cart-btn" 
                data-product-id="${producto.id}"
                title="Eliminar producto"
              >
                X
              </button>
            </td>
          </tr>
        `;
      }
    });

    const tablaFooter = '</tbody></table>';
    cartContainer.innerHTML = tablaHeader + tablaBody + tablaFooter;
    cartTotalEl.textContent = totalCalculado.toFixed(2);
    
    // Actualiza el estado de los botones (login y compra)
    actualizarEstadoCompra();
  }

  /**
   * Maneja la lógica de "simular login".
   */
  async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const contraseña = document.getElementById('login-pass').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña })
      });
      
      const data = await response.json();

      if (response.ok) {
        saveUser({ id: data.usuarioId, email: email, nombre: data.nombre });
        loginStatusEl.textContent = `¡Bienvenido, ${data.nombre}!`;
        loginStatusEl.className = 'form-text text-success';

        clearLoginInputs(); // limpiar campos
      } else {
        logoutUser();
        loginStatusEl.textContent = data.mensaje;
        loginStatusEl.className = 'form-text text-danger';
      }
      actualizarEstadoCompra(); 
      
    } catch (error) {
      console.error('Error en login:', error);
      loginStatusEl.textContent = 'Error de conexión.';
      loginStatusEl.className = 'form-text text-danger';
    }
  }

  /**
   * Maneja la lógica del botón "Comprar".
   */
  async function handleCompra() {
    const usuario = getUser();
    // 'carrito' es la variable let de la línea 12
    if (!usuario || carrito.length === 0) {
      compraStatusEl.textContent = 'Debes iniciar sesión y tener items en el carrito.';
      compraStatusEl.className = 'form-text text-danger';
      return;
    }

    const bodyPayload = {
      id_usuario: usuario.id,
      productos: carrito.map(item => ({
        id_producto: item.id,
        cantidad: item.quantity
      }))
    };

    try {
      btnComprar.disabled = true;
      compraStatusEl.textContent = 'Procesando...';
      compraStatusEl.className = 'form-text';

      const response = await fetch('/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (response.ok) { 
        compraStatusEl.textContent = `¡Compra exitosa! Tu pedido se ha procesado.`;
        compraStatusEl.className = 'form-text text-success';
        clearCart(); 
        logoutUser(); // Cerramos sesión

        // Resetea el formulario de login completo
        clearLoginInputs();
        clearLoginStatus();
        
        carrito = getCart(); // Actualizamos la variable local
        renderizarCarrito(); 
        
        // Actualizamos la UI de login
        actualizarEstadoCompra(); 
      } else {
        throw new Error(data.mensaje || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al comprar:', error);
      compraStatusEl.textContent = `Error: ${error.message}`;
      compraStatusEl.className = 'form-text text-danger';
      btnComprar.disabled = false;
    }
  }

  /**
   * Actualiza el UI (botones y texto) basado en el estado de login/carrito.
   */
  function actualizarEstadoCompra() {
    const usuario = getUser();
    // 'carrito' es la variable let de la línea 12

    if (usuario) {
      usuarioLogueadoEl.textContent = `${usuario.nombre} (${usuario.email})`;
      btnLogout.style.display = 'inline'; // Muestra "Salir"
    } else {
      usuarioLogueadoEl.textContent = 'Ninguno';
      btnLogout.style.display = 'none'; // Oculta "Salir"
    }

    if (usuario && carrito.length > 0) {
      btnComprar.disabled = false;
    } else {
      btnComprar.disabled = true;
    }
  }

  /**
   * Limpia solo los campos de email y contraseña.
   */
  function clearLoginInputs() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-pass').value = '';
  }

  /**
   * Limpia solo el mensaje de estado del login.
   */
  function clearLoginStatus() {
    loginStatusEl.textContent = '';
    loginStatusEl.className = 'form-text'; // Resetea el color (ej: si era rojo de error)
  }

  // --- Inicialización ---
  await fetchAllProducts(); 
  renderizarCarrito(); 
  
  // Asignamos listeners
  btnLogin.addEventListener('click', handleLogin);
  btnComprar.addEventListener('click', handleCompra);

  //  Listener para el botón "Salir"
  btnLogout.addEventListener('click', (e) => {
    e.preventDefault(); 
    logoutUser(); 
    actualizarEstadoCompra(); 
    loginStatusEl.textContent = 'Sesión cerrada.';
    loginStatusEl.className = 'form-text';
  });

  //  Listener para botones "Eliminar" (con delegación de eventos)
  cartContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-from-cart-btn')) {
      const productId = e.target.dataset.productId;
      
      // 1. Lógica (de cart.js)
      removeFromCart(productId);
      
      // 2. Estado (actualiza la variable local)
      carrito = getCart();
      
      // 3. Vista (vuelve a dibujar la tabla)
      renderizarCarrito();
    }
  });

});