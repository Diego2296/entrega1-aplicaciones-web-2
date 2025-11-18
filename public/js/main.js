
document.addEventListener('DOMContentLoaded', () => {
  // Selectores del DOM
  const productListContainer = document.getElementById('product-list');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  const filtroDesde = document.getElementById('filtro-desde');
  const filtroHasta = document.getElementById('filtro-hasta');
  const filtroTipo = document.getElementById('filtro-tipo'); 
  const btnFiltrar = document.getElementById('btn-filtrar');
  const btnLimpiar = document.getElementById('btn-limpiar-filtro');

  // Guardamos una copia maestra de los productos
  let todosLosProductos = []; 

  /**
   * Renderiza los productos en el DOM usando Bootstrap cards.
   * (Esta función está actualizada para usar las imágenes reales)
   * @param {Array} productos - Array de productos a mostrar.
   */
  const renderizarProductos = (productos) => {
    productListContainer.innerHTML = ''; // Limpiamos la lista

    if (productos.length === 0) {
      productListContainer.innerHTML = '<p class="text-center">No se encontraron productos para esta búsqueda.</p>';
      return;
    }

    productos.forEach(producto => {
      const cardHtml = `
        <div class="col">
          <div class="card h-100 ${!producto.disponible ? 'bg-light text-muted' : ''}">
            <img 
              src="/images/${producto.imagen}" 
              class="card-img-top product-card-img" 
              alt="${producto.nombre}"
            >
            <div class="card-body">
              <h5 class="card-title">${producto.nombre}</h5>
              <p class="card-text">${producto.desc}</p>
              <h4 class="card-text">$${parseFloat(producto.precio).toFixed(2)}</h4>
            </div>
            <div class="card-footer">
              <button 
                class="btn btn-primary w-100 add-to-cart-btn" 
                data-product-id="${producto.id}"
                ${!producto.disponible ? 'disabled' : ''}
              >
                ${producto.disponible ? 'Añadir al Carrito' : 'No disponible'}
              </button>
            </div>
          </div>
        </div>
      `;
      productListContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
  };

  /**
   * Popula el filtro de tipos basado en los productos cargados.
   * Set para obtener valores únicos.
   * @param {Array} productos - El array completo de productos.
   */
  const popularFiltroTipos = (productos) => {
    // Set para obtener tipos únicos y evitar duplicados
    const tipos = [...new Set(productos.map(p => p.tipo))]; 
    
    tipos.forEach(tipo => {
      if (tipo) { // Ignorar si algún producto no tiene tipo
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        filtroTipo.appendChild(option);
      }
    });
  };
  
  /**
   * Aplica todos los filtros (precio y tipo)
   * al array 'todosLosProductos'.
   */
  const aplicarFiltros = () => {
    const desde = parseFloat(filtroDesde.value) || 0;
    const hasta = parseFloat(filtroHasta.value) || Infinity;
    const tipo = filtroTipo.value;

    // Empezamos con la lista completa
    let productosFiltrados = todosLosProductos;

    // 1. Filtramos por precio 
    productosFiltrados = productosFiltrados.filter(p => {
      const precio = parseFloat(p.precio);
      return precio >= desde && precio <= hasta;
    });

    // 2. Filtramos por tipo (si se seleccionó uno)
    if (tipo) { // Si 'tipo' no es "" (string vacío)
      productosFiltrados = productosFiltrados.filter(p => p.tipo === tipo);
    }

    // 3. Renderizamos el resultado
    renderizarProductos(productosFiltrados);
  };

  /**
   * Configura los listeners para los botones de filtro.
   */
  const configurarFiltros = () => {
    // El botón "Aplicar Filtros" corre la lógica local
    btnFiltrar.addEventListener('click', aplicarFiltros);

    // El botón "Limpiar" resetea los inputs y muestra todos los productos
    btnLimpiar.addEventListener('click', () => {
      filtroDesde.value = '';
      filtroHasta.value = '';
      filtroTipo.value = ''; // Resetea el select
      renderizarProductos(todosLosProductos); // Muestra la lista original
    });
  };

  /**
   * Configura el listener para los botones "Añadir al Carrito".
   * 
   */
  const configurarBotonesCarrito = () => {
    productListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = e.target.dataset.productId;
        addToCart(productId); // Esta función viene de cart.js
      }
    });
  };

  /**
   * Carga todo una vez al iniciar la página.
   */
  const inicializarPagina = async () => {
    loadingSpinner.style.display = 'block';
    try {
      // 1. Cargamos TODOS los productos
      const response = await fetch('/productos');
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const productos = await response.json();
      todosLosProductos = productos; // 2. Guardamos en nuestra variable maestra
      
      // 3. Renderizamos todo
      renderizarProductos(todosLosProductos); 
      
      // 4. Creamos las opciones del filtro
      popularFiltroTipos(todosLosProductos); 

    } catch (error) {
      console.error('Error al cargar productos:', error);
      productListContainer.innerHTML = '<p class="text-center text-danger">Error al cargar productos.</p>';
    } finally {
      loadingSpinner.style.display = 'none'; // 5. Ocultamos el spinner
    }
  };

  // --- Inicialización ---
  inicializarPagina(); // Función de arranque
  configurarFiltros(); // Configura los botones
  configurarBotonesCarrito(); // Configura el "Añadir al carrito"
});