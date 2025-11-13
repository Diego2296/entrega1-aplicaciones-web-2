# Rutas de la API - Entrega 2

## Productos

### GET `/productos`
- **Descripción:** Devuelve una lista con todos los productos disponibles.
- **Respuesta:**
  - `200 OK`: Array de objetos de producto.
  - `500 Internal Server Error`: Si hay un error al leer los datos.

### GET `/productos/:desde/:hasta`
- **Descripción:** Devuelve una lista de productos cuyo precio se encuentra dentro del rango especificado (`desde` y `hasta`, inclusives).
- **Parámetros de Ruta:**
  - `:desde` (Number): Precio mínimo.
  - `:hasta` (Number): Precio máximo.
- **Respuesta:**
  - `200 OK`: Array de objetos de producto filtrados.
  - `400 Bad Request`: Si `:desde` o `:hasta` no son números válidos.
  - `500 Internal Server Error`: Si hay un error al leer los datos.

### PUT `/productos/:id`
- **Descripción:** Actualiza la información de un producto existente identificado por su `:id`. Se envían los campos a actualizar en el cuerpo (body) de la solicitud en formato JSON.
- **Parámetros de Ruta:**
  - `:id` (Number): ID del producto a actualizar.
- **Cuerpo (Body) - JSON:** Objeto con los campos a actualizar (ej: `{"nombre": "Nuevo Nombre", "precio": 199.99}`).
- **Respuesta:**
  - `200 OK`: Objeto del producto actualizado.
  - `400 Bad Request`: Si el `:id` no es numérico o faltan datos requeridos en el cuerpo.
  - `404 Not Found`: Si el producto con el `:id` especificado no existe.
  - `500 Internal Server Error`: Si hay un error al actualizar los datos.

## Usuarios

### GET `/usuarios`
- **Descripción:** Devuelve una lista con todos los usuarios registrados.
- **Respuesta:**
  - `200 OK`: Array de objetos de usuario.
  - `500 Internal Server Error`: Si hay un error al leer los datos.

### POST `/cargarUsuario`
- **Descripción:** Crea un nuevo registro de usuario. Los datos del usuario se envían en el cuerpo (body) de la solicitud en formato JSON.
- **Cuerpo (Body) - JSON:** `{ "nombre": "...", "apellido": "...", "email": "...", "contraseña": "..." }`
- **Respuesta:**
  - `201 Created`: Objeto del nuevo usuario creado (incluyendo su nuevo ID).
  - `400 Bad Request`: Si faltan datos requeridos en el cuerpo.
  - `500 Internal Server Error`: Si hay un error al guardar los datos.

### POST `/login`
- **Descripción:** Simula el inicio de sesión de un usuario. Verifica las credenciales (email y contraseña) enviadas en el cuerpo (body) JSON. **(Manejo de datos sensibles)**.
- **Cuerpo (Body) - JSON:** `{ "email": "...", "contraseña": "..." }`
- **Respuesta:**
  - `200 OK`: Mensaje de éxito y `usuarioId`. 
  - `400 Bad Request`: Si faltan `email` o `contraseña`.
  - `401 Unauthorized`: Si las credenciales son inválidas.
  - `500 Internal Server Error`: Si hay un error al leer los datos.

### DELETE `/usuarios/:id`
- **Descripción:** Elimina un usuario identificado por su `:id`, **solo si no tiene ventas asociadas**.
- **Parámetros de Ruta:**
  - `:id` (Number): ID del usuario a eliminar.
- **Respuesta:**
  - `204 No Content`: Si el usuario se eliminó correctamente (sin cuerpo de respuesta).
  - `400 Bad Request`: Si el `:id` no es numérico.
  - `404 Not Found`: Si el usuario con el `:id` especificado no existe.
  - `409 Conflict`: Si el usuario no se puede eliminar porque tiene ventas asociadas.
  - `500 Internal Server Error`: Si hay un error al eliminar los datos.

## Ventas

### GET `/ventas`
- **Descripción:** Devuelve una lista con todas las ventas registradas.
- **Respuesta:**
  - `200 OK`: Array de objetos de venta.
  - `500 Internal Server Error`: Si hay un error al leer los datos.