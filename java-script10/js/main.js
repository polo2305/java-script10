// ==========================================
// PRE-ENTREGA 10: APIS, PETICIONES Y LIBRERÍAS
// ==========================================

let productos = [];

// Selección de elementos del DOM
const contenedorItems = document.getElementById("contenedor-items");
const formProducto = document.getElementById("form-producto");
const nombreInput = document.getElementById("nombre-input");
const precioInput = document.getElementById("precio-input");
const buscadorInput = document.getElementById("buscador-input");
const estadoCarga = document.getElementById("estado-carga");

// Función para guardar en localStorage
const guardarEnStorage = (arrProductos) => {
    localStorage.setItem("productos", JSON.stringify(arrProductos));
};

// 1) CONSUMO DE DATOS CON FETCH, ASYNC/AWAIT Y TRY-CATCH-FINALLY
async function obtenerProductos() {
    try {
        // Verificamos si ya hay datos guardados en localStorage para priorizarlos
        const productosGuardados = localStorage.getItem("productos");
        
        if (productosGuardados) {
            productos = JSON.parse(productosGuardados);
            estadoCarga.textContent = "✔️ Productos cargados desde la memoria local.";
            estadoCarga.style.backgroundColor = "#d4edda";
            estadoCarga.style.color = "#155724";
        } else {
            // Si no hay en storage, hacemos el fetch al archivo data.json local
            const respuesta = await fetch("./data.json");
            
            // Verificamos si la respuesta de red fue exitosa
            if (!respuesta.ok) {
                throw new Error("Error al intentar conectar con el archivo de datos.");
            }
            
            productos = await respuesta.json();
            guardarEnStorage(productos);
            
            estadoCarga.textContent = "✔️ Productos cargados exitosamente desde el servidor.";
            estadoCarga.style.backgroundColor = "#d4edda";
            estadoCarga.style.color = "#155724";

            // Notificación con la librería SweetAlert2
            Swal.fire({
                icon: 'success',
                title: '¡Catálogo cargado!',
                text: 'Los productos se obtuvieron correctamente.',
                timer: 2500,
                showConfirmButton: false
            });
        }

        renderizarProductos(productos);

    } catch (error) {
        // Manejo de errores visuales mediante la librería SweetAlert2
        estadoCarga.textContent = "⚠️ Error al cargar los productos.";
        estadoCarga.style.backgroundColor = "#f8d7da";
        estadoCarga.style.color = "#721c24";

        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se pudo procesar la operación de carga. Intenta nuevamente.',
        });
        console.error("Detalle del error:", error);
    } finally {
        // Bloque finally se ejecuta siempre
        console.log("🔄 Proceso de petición fetch finalizado.");
    }
}

// 2) Renderizado dinámico con Destructuring y Operadores Ternarios
function renderizarProductos(arrayA_Mostrar) {
    contenedorItems.innerHTML = "";

    arrayA_Mostrar.length === 0 
        ? contenedorItems.innerHTML = `<p style="text-align:center; color: #7f8c8d;">No hay productos para mostrar.</p>`
        : arrayA_Mostrar.forEach((producto) => {
            const { id, nombre, precio, stock = 10 } = producto;

            const tarjeta = document.createElement("div");
            tarjeta.className = "producto-card";

            tarjeta.innerHTML = `
                <div class="producto-info">
                    <h3>${nombre}</h3>
                    <p>$${precio.toLocaleString('es-AR')} <span>(Stock: ${stock})</span></p>
                </div>
                <button class="btn-eliminar" data-id="${id}">Eliminar</button>
            `;

            contenedorItems.appendChild(tarjeta);
        });

    activarBotonesEliminar();
}

// 3) Gestión de eventos: Eliminar producto
function activarBotonesEliminar() {
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idObtenido = parseInt(e.target.getAttribute("data-id"));
            
            productos = productos.filter(prod => prod.id !== idObtenido);

            guardarEnStorage(productos);
            renderizarProductos(productos);

            // Notificación sutil con SweetAlert2 al eliminar
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Producto eliminado',
                showConfirmButton: false,
                timer: 2000
            });
        });
    });
}

// 4) Gestión de eventos: Agregar nuevo producto desde el formulario
formProducto.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const nombreTexto = nombreInput.value.trim();
    const precioValor = parseFloat(precioInput.value);

    if (nombreTexto === "" || isNaN(precioValor) || precioValor <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa los campos correctamente.',
        });
        return;
    }

    const nuevoProducto = {
        id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
        nombre: nombreTexto,
        precio: precioValor,
        stock: 10
    };

    productos.push(nuevoProducto);
    guardarEnStorage(productos);
    renderizarProductos(productos);

    // Alerta de éxito con SweetAlert2
    Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: `El producto "${nuevoProducto.nombre}" fue agregado con éxito.`,
        timer: 2000,
        showConfirmButton: false
    });

    formProducto.reset();
});

// 5) Evento de teclado para búsqueda en tiempo real
buscadorInput.addEventListener("keyup", (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();

    const resultadosFiltrados = productos.filter(prod => 
        prod.nombre.toLowerCase().includes(textoBusqueda)
    );

    renderizarProductos(resultadosFiltrados);
});

// Inicializamos la aplicación ejecutando la petición asíncrona
obtenerProductos();