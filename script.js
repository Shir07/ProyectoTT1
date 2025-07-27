document.addEventListener("DOMContentLoaded", function () {
    // --- Formulario de contacto ---
    const formulario = document.getElementById("formulario-contacto");
    const mensajeExitoContacto = document.getElementById("mensaje-exito"); // Se cambia el nombre
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
            } else if (nombre.length < 2) { // Agreado de longitud
                errores.push("El nombre debe tener al menos 2 caracteres.");
            }

            if (correo === "") {
                errores.push("El correo electrónico es obligatorio.");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                errores.push("El correo electrónico no es válido.");
            }

            if (mensaje === "") {
                errores.push("El mensaje es obligatorio.");
            } else if (mensaje.length < 10) { // Agreggado de longitud
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

    let carrito = []; // Array para almacenar los productos en el carrito

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

    // Abrir el modal del carrito
    abrirCarritoBtn.addEventListener('click', () => {
        modalCarrito.style.display = 'flex'; 
        actualizarCarritoHTML(); 
    });

    // Cerrar el modal del carrito
    cerrarModalBtn.addEventListener('click', () => {
        modalCarrito.style.display = 'none';
        mensajePedidoExito.style.display = 'none'; // Ocultar mensaje de éxito al cerrar
    });

    // Cerrar el modal haciendo clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modalCarrito) {
            modalCarrito.style.display = 'none';
            mensajePedidoExito.style.display = 'none'; 
        }
    });

    // Agregar productos
    document.querySelectorAll('.agregar-carrito').forEach(button => {
        button.addEventListener('click', (event) => {
            const productoCard = event.target.closest('.producto-card');
            const id = productoCard.dataset.id;
            const nombre = productoCard.dataset.nombre;
            const precio = parseFloat(productoCard.dataset.precio); // Convertir a número

            const productoExistente = carrito.find(item => item.id === id);

            if (productoExistente) {
                productoExistente.cantidad++;
            } else {
                carrito.push({
                    id: id,
                    nombre: nombre,
                    precio: precio,
                    cantidad: 1,
                    imagen: productoCard.querySelector('img').src // Guarda la ruta de la imagen
                });
            }
            guardarCarritoEnLocalStorage();
            actualizarCarritoHTML();
        });
    });

    // Función para actualizar el HTML del carrito :)
    function actualizarCarritoHTML() {
        itemsCarritoDiv.innerHTML = ''; // Limpiar el contenido actual del carrito
        let total = 0;
        let totalItems = 0;

        if (carrito.length === 0) {
            carritoVacioMensaje.style.display = 'block';
            itemsCarritoDiv.appendChild(carritoVacioMensaje); 
        } else {
            carritoVacioMensaje.style.display = 'none';
            carrito.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-carrito');
                itemDiv.dataset.id = item.id; // Añadir data-id al div del item 

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

        // Para los nuevos botones de cantidad y eliminar
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

    // Cambio de cantidad (sumar/restar)
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

    // Modificar cantidad
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

        // Para simular el envío del pedido al backend
        console.log('Pedido confirmado:', carrito);

        // Mensaje de éxito
        mensajePedidoExito.style.display = 'block';
        
        // Vaciar el carrito
        carrito = [];
        guardarCarritoEnLocalStorage();
        
        actualizarCarritoHTML(); // Actualiza la vista del carrito (vacío)

        // Opcional: Cierra el modal o sino abierto con el mensaje de éxito
        setTimeout(() => {
            modalCarrito.style.display = 'none';
            mensajePedidoExito.style.display = 'none';
        }, 5000); // Mensaje de éxito visible por 5 segundos
    });

    // Carga el carrito al iniciar la página
    cargarCarritoDesdeLocalStorage();
});