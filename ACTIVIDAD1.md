# MultiGadgets

Este repositorio contiene estructuras de datos en formato **JSON** para un sistema de e-commerce ficticio llamado **MultiGadgets**, especializado en artículos para el hogar y tecnología.

---

### Estructura

-   `usuarios.json`: Contiene los datos de clientes registrados.
-   `productos.json`: Lista de productos disponibles en la tienda.
-   `ventas.json`: Registra las ventas realizadas, vinculando usuarios y productos.

---

### Relaciones

-   `ventas.json` referencia a `usuarios.json` mediante el campo **`id_usuario`**.
-   `ventas.json` referencia a `productos.json` mediante el campo **`id_producto`** dentro del array de **`productos`**.

---

### Tipos de datos incluidos

-   **Numéricos**: `id`, `precio`, `total`, `cantidad`.
-   **Cadenas**: `nombre`, `apellido`, `email`, `desc`, `direccion`.
-   **Booleanos**: `disponible` en `productos.json`.

---

### Próximos pasos

Estos datos serán utilizados en entregas posteriores para construir un sistema que permita:
-   Gestión de usuarios.
-   Listado de productos.
-   Registro y consulta de ventas.