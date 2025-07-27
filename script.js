document.addEventListener("DOMContentLoaded", function () {
    // --- Formulario de contacto ---
    const formulario = document.getElementById("formulario-contacto");
    const mensajeExitoContacto = document.getElementById("mensaje-exito");
    const contenedorErrores = document.getElementById("errores");

    if (formulario) {
        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("email").value.trim();
            const mensaje = document.getElementById("mensaje").value.trim();
            const errores = [];

            contenedorErrores.innerHTML = "";
            contenedorErrores.style.display = "none";
            mensajeExitoContacto.style.display = "none";

            if (nombre === "") {
                errores.push("El nombre es obligatorio.");
            } else if (nombre.length < 2) {
                errores.push("El nombre debe tener al menos 2 caracteres.");
            }

            if (correo === "") {
                errores.push("El correo electrónico es obligatorio.");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                errores.push("El correo electrónico no es válido.");
            }

            if (mensaje === "") {
                errores.push("El mensaje es obligatorio.");
            } else if (mensaje.length < 10) {
                errores.push("El mensaje debe tener al menos 10 caracteres.");
            }

            if (errores.length > 0) {
                contenedorErrores.style.display = "block";
                errores.forEach(function (error) {
                    const p = document.createElement("p");
                    p.textContent = error;
                    contenedorErrores.appendChild(p);
                });
            } else {
                mensajeExitoContacto.style.display = "block";
                formulario.reset();

                setTimeout(() => {
                    mensajeExitoContacto.style.display = "none";
                }, 4000);
            }
        });
    }

    // --- Carrito de Compras ---
    const abrirCarritoBtn = document.getElementById('abrir-carrito');
    const modalCarrito = document.getElementById('modal-carrito');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const itemsCarritoDiv = document.getElementById('items-carrito');
    const totalCarritoSpan = document.getElementById('total-carrito');
    const contadorCarritoSpan = document.getElementById('contador-carrito');
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido');
    const mensajePedidoExito = document.getElementById('mensaje-pedido-exito');
    const carritoVacioMensaje = document.querySelector('.carrito-vacio-mensaje');
    const productosContainer = document.getElementById('productos-container'); 

    let carrito = []; // Array para almacenar los productos en el carrito
    let productosDisponibles = []; // Para almacenar las cosas del json

    // Cargar carrito del localStorage al iniciar
    function cargarCarritoDesdeLocalStorage() {
        const carritoGuardado = localStorage.getItem('carritoMochiDonuts');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            actualizarCarritoHTML();
        }
    }

    // Guardar carrito en el localStorage
    function guardarCarritoEnLocalStorage() {
        localStorage.setItem('carritoMochiDonuts', JSON.stringify(carrito));
    }

    // --- Cargar productos desde productos.json ---
    async function cargarProductos() {
        try {
            const response = await fetch('productos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            productosDisponibles = await response.json();
            mostrarProductos(); 
            cargarCarritoDesdeLocalStorage(); 
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productosContainer.innerHTML = '<p>Lo sentimos, no pudimos cargar los productos en este momento. Intenta de nuevo más tarde.</p>';
        }
    }

    // Mosstrar los productos en el HTML
    function mostrarProductos() {
        productosContainer.innerHTML = ''; 
        productosDisponibles.forEach(producto => {
            const productoCard = document.createElement('div');
            productoCard.classList.add('producto-card');
            productoCard.dataset.id = producto.id;
            productoCard.dataset.nombre = producto.nombre;
            productoCard.dataset.precio = producto.precio.toFixed(2); 

            productoCard.innerHTML = `
                <img src="${producto.imagen}" alt="Mochi Donut de ${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="precio">$${producto.precio.toFixed(2)}</p>
                <button class="agregar-carrito">Agregar al Carrito</button>
            `;
            productosContainer.appendChild(productoCard);
        });

        
        document.querySelectorAll('.agregar-carrito').forEach(button => {
            button.addEventListener('click', agregarProductoAlCarrito);
        });
    }

    // Modal del carrito
    abrirCarritoBtn.addEventListener('click', () => {
        modalCarrito.style.display = 'flex';
    });

    // Cerrar el modal del carrito
    cerrarModalBtn.addEventListener('click', () => {
        modalCarrito.style.display = 'none';
        mensajePedidoExito.style.display = 'none';
    });

    // Cerrar el modal haciendo clic fuera 
    window.addEventListener('click', (event) => {
        if (event.target === modalCarrito) {
            modalCarrito.style.display = 'none';
            mensajePedidoExito.style.display = 'none';
        }
    });

    // Agregar un producto al carrito 
    function agregarProductoAlCarrito(event) {
        const productoCard = event.target.closest('.producto-card');
        const id = productoCard.dataset.id;
        
        //Para encontrar productos del array de productos disponibles
        const productoSeleccionado = productosDisponibles.find(p => p.id === id);

        if (!productoSeleccionado) {
            console.error('Producto no encontrado:', id);
            return;
        }

        const productoExistente = carrito.find(item => item.id === id);

        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            // Añadir el producto completo al carrito 
            carrito.push({
                id: productoSeleccionado.id,
                nombre: productoSeleccionado.nombre,
                precio: productoSeleccionado.precio,
                cantidad: 1,
                imagen: productoSeleccionado.imagen
            });
        }
        guardarCarritoEnLocalStorage();
        actualizarCarritoHTML();
    }

    // Actualizar el HTML del carrito
    function actualizarCarritoHTML() {
        itemsCarritoDiv.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (carrito.length === 0) {
            carritoVacioMensaje.style.display = 'block';
            if (!itemsCarritoDiv.contains(carritoVacioMensaje)) {
                itemsCarritoDiv.appendChild(carritoVacioMensaje);
            }
        } else {
            carritoVacioMensaje.style.display = 'none';
            carrito.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-carrito');
                itemDiv.dataset.id = item.id;

                itemDiv.innerHTML = `
                    <div class="item-carrito-info">
                        <img src="${item.imagen}" alt="${item.nombre}">
                        <span>${item.nombre}</span>
                    </div>
                    <div class="item-carrito-cantidad">
                        <button class="restar-cantidad" data-id="${item.id}">-</button>
                        <input type="number" value="${item.cantidad}" min="1" data-id="${item.id}" class="input-cantidad">
                        <button class="sumar-cantidad" data-id="${item.id}">+</button>
                    </div>
                    <div class="item-carrito-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button class="item-carrito-eliminar" data-id="${item.id}">&times;</button>
                `;
                itemsCarritoDiv.appendChild(itemDiv);

                total += item.precio * item.cantidad;
                totalItems += item.cantidad;
            });
        }

        totalCarritoSpan.textContent = total.toFixed(2);
        contadorCarritoSpan.textContent = totalItems;

        document.querySelectorAll('.restar-cantidad').forEach(button => {
            button.addEventListener('click', manejarCambioCantidad);
        });
        document.querySelectorAll('.sumar-cantidad').forEach(button => {
            button.addEventListener('click', manejarCambioCantidad);
        });
        document.querySelectorAll('.input-cantidad').forEach(input => {
            input.addEventListener('change', manejarCambioCantidadInput);
        });
        document.querySelectorAll('.item-carrito-eliminar').forEach(button => {
            button.addEventListener('click', eliminarProducto);
        });
    }

    // sumar/restar
    function manejarCambioCantidad(event) {
        const id = event.target.dataset.id;
        const accion = event.target.classList.contains('sumar-cantidad') ? 'sumar' : 'restar';
        const inputElement = event.target.parentElement.querySelector('.input-cantidad');
        let cantidadActual = parseInt(inputElement.value);

        if (accion === 'sumar') {
            cantidadActual++;
        } else if (accion === 'restar' && cantidadActual > 1) {
            cantidadActual--;
        } else if (accion === 'restar' && cantidadActual === 1) {
            eliminarProducto({ target: event.target });
            return;
        }

        const itemEnCarrito = carrito.find(item => item.id === id);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad = cantidadActual;
            guardarCarritoEnLocalStorage();
            actualizarCarritoHTML();
        }
    }

    // Cambio de cantidad desde el input
    function manejarCambioCantidadInput(event) {
        const id = event.target.dataset.id;
        let nuevaCantidad = parseInt(event.target.value);

        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
            nuevaCantidad = 1;
            event.target.value = 1;
        }

        const itemEnCarrito = carrito.find(item => item.id === id);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad = nuevaCantidad;
            guardarCarritoEnLocalStorage();
            actualizarCarritoHTML();
        }
    }

    // Eliminar un producto del carrito
    function eliminarProducto(event) {
        const id = event.target.dataset.id;
        carrito = carrito.filter(item => item.id !== id);
        guardarCarritoEnLocalStorage();
        actualizarCarritoHTML();
    }

    // Confirmar Pedido
    confirmarPedidoBtn.addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Tu carrito está vacío. Por favor, agrega productos antes de confirmar.');
            return;
        }

        console.log('Pedido confirmado:', carrito);

        mensajePedidoExito.style.display = 'block';
        
        carrito = [];
        guardarCarritoEnLocalStorage();
        
        actualizarCarritoHTML();

        setTimeout(() => {
            modalCarrito.style.display = 'none';
            mensajePedidoExito.style.display = 'none';
        }, 5000);
    });

       // --- Menú de hamburguesa ---
    const menuHamburguesa = document.getElementById('menu-hamburguesa');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('ul li a'); // Seleccionar todos los enlaces del menú

    menuHamburguesa.addEventListener('click', () => {
        navMenu.classList.toggle('activo'); // Alternar la clase 'activo'
    });

    // Cerrar el menú de hamburguesa cuando se hace clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('activo')) {
                navMenu.classList.remove('activo');
            }
        });
    });

    // Cargar productos al iniciar
    cargarProductos();
});
