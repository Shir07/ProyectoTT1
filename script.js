document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-contacto");
    const mensajeExito = document.getElementById("mensaje-exito");
    const contenedorErrores = document.getElementById("errores");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("email").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();
        const errores = [];

        contenedorErrores.innerHTML = "";
        mensajeExito.style.display = "none"; // Ocultar mensaje anterior

        if (nombre === "") {
            errores.push("El nombre es obligatorio.");
        }

        if (correo === "") {
            errores.push("El correo electrónico es obligatorio.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            errores.push("El correo electrónico no es válido.");
        }

        if (mensaje === "") {
            errores.push("El mensaje es obligatorio.");
        }

        if (errores.length > 0) {
            errores.forEach(function (error) {
                const p = document.createElement("p");
                p.textContent = error;
                contenedorErrores.appendChild(p);
            });
        } else {
            mensajeExito.style.display = "block";
            formulario.reset();

            setTimeout(() => {
                mensajeExito.style.display = "none";
            }, 4000);
        }
    });
});


