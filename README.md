# Proyecto Tienda Online - MultiGadgets

Este proyecto es una aplicación web Full Stack para un e-commerce de productos tecnológicos. Incluye un backend RESTful con Node.js y Express, y un frontend estático servido por el mismo servidor. Utiliza MongoDB para la persistencia de datos.

## 📋 Requisitos Previos

Para ejecutar este proyecto localmente, es necesario tener instalado:

* **Node.js** (v14 o superior)
* **MongoDB**: Puede ser una instancia local o una conexión a MongoDB Atlas (Nube).

## 🚀 Instalación y Configuración

Seguir estos pasos para poner en marcha el proyecto:

1.  **Clonar el repositorio:**
    ```bash
    git clone <https://github.com/Diego2296/entrega1-aplicaciones-web-2>
    cd proyecto-tienda-online
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo llamado `.env` en la raíz del proyecto y defini las siguientes variables.
    
    **Importante:** No compartas este archivo. Aca van tus credenciales reales.

    ```env
    PORT=3000
    
    # Opción A: Si usas MongoDB Local
    MONGO_URI=mongodb://127.0.0.1:27017/tienda_multigadgets
    
    # Opción B: Si usas MongoDB Atlas (Nube)
    # Reemplaza <usuario> y <password> con tus datos reales
    # MONGO_URI==mongodb+srv://<usuario>:<password>@cluster0.owksr6d.mongodb.net/?appName=Cluster0
    
    # Clave para firmar los tokens (podes inventar una frase segura)
    SECRET_KEY=escribe_aqui_tu_frase_secreta_segura
    ```

4.  **Carga Inicial de Datos (Semillero):**
    Para poblar la base de datos con productos y usuarios de prueba, ejecutá:
    ```bash
    node seed.js
    ```
    *Deberías ver mensajes de éxito indicando que se insertaron productos y usuarios.*

5.  **Iniciar el Servidor:**
    ```bash
    npm run dev
    ```

6.  **Ver el Proyecto:**
    Abre tu navegador e ingresa a: http://localhost:3000

## 🧪 Datos de Prueba

Podes utilizar las siguientes credenciales para probar el login y la compra:

* **Email:** ana.garcia@email.com (son de test, tranquilo ;) )
* **Contraseña:** password123 (son de test, tranquilo ;) )

## 🛠️ Tecnologías

* **Backend:** Node.js, Express.
* **Base de Datos:** MongoDB, Mongoose.
* **Seguridad:** JWT (JSON Web Tokens), Bcrypt, Cookie-Parser.
* **Frontend:** HTML5, Bootstrap 5, JavaScript (ES6).