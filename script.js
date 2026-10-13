(function () {
    'use strict';

    const encabezado = document.getElementById('encabezado');
    const menu = document.getElementById('menu');
    const boton = document.getElementById('hamburguesa');

    /* ---------- Menú del celular ---------- */
    function abrirMenu(abrir) {
        menu.classList.toggle('abierto', abrir);
        boton.setAttribute('aria-expanded', String(abrir));
        boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    }

    boton.addEventListener('click', function () {
        abrirMenu(!menu.classList.contains('abierto'));
    });

    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) abrirMenu(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('abierto')) {
            abrirMenu(false);
            boton.focus();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) abrirMenu(false);
    });

    /* ---------- Línea bajo el encabezado al hacer scroll ---------- */
    function alScrollear() {
        encabezado.classList.toggle('con-sombra', window.scrollY > 8);
    }
    alScrollear();
    window.addEventListener('scroll', alScrollear, { passive: true });

    /* ---------- Resaltar la sección visible en el menú ---------- */
    const enlaces = Array.from(menu.querySelectorAll('ul a'));
    const secciones = enlaces
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    enlaces.forEach(function (a) {
                        a.classList.toggle('activo', a.getAttribute('href') === '#' + entrada.target.id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        secciones.forEach(function (s) { observador.observe(s); });
    }

    /* ---------- Formulario: se envía sin salir de la página ---------- */
    const form = document.getElementById('formulario');
    const estado = document.getElementById('estado');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const enviar = form.querySelector('button[type="submit"]');
        enviar.disabled = true;
        estado.className = 'estado';
        estado.textContent = 'Enviando…';

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
            .then(function (respuesta) {
                if (!respuesta.ok) throw new Error('Error ' + respuesta.status);
                form.reset();
                estado.className = 'estado ok';
                estado.textContent = '¡Gracias! Recibí tu mensaje y te voy a responder a la brevedad.';
            })
            .catch(function () {
                estado.className = 'estado error';
                estado.textContent = 'No se pudo enviar el mensaje. Probá de nuevo o escribime por WhatsApp.';
            })
            .finally(function () {
                enviar.disabled = false;
            });
    });

    /* ---------- Ventanas de detalle de los servicios ---------- */
    document.querySelectorAll('[data-abrir]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const dialogo = document.getElementById(btn.getAttribute('data-abrir'));
            if (!dialogo || typeof dialogo.showModal !== 'function') return;
            dialogo.showModal();
            document.body.classList.add('sin-scroll');
        });
    });

    document.querySelectorAll('dialog.detalle').forEach(function (dialogo) {
        // Botón "x"
        dialogo.querySelector('[data-cerrar]').addEventListener('click', function () { dialogo.close(); });
        // Click fuera de la ventana
        dialogo.addEventListener('click', function (e) {
            if (e.target === dialogo) dialogo.close();
        });
        // Al cerrar (también con Esc) se vuelve a habilitar el scroll
        dialogo.addEventListener('close', function () { document.body.classList.remove('sin-scroll'); });
        // Si tocan "Reservar" o "WhatsApp", se cierra la ventana
        dialogo.querySelectorAll('.detalle__acciones a').forEach(function (a) {
            a.addEventListener('click', function () { dialogo.close(); });
        });
    });

    /* ---------- Año del pie de página ---------- */
    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
})();
