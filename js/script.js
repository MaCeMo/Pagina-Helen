/* script.js - Interacciones y validaciones para Helen Aloja */

// IIFE para evitar contaminación global
(function(){
  'use strict';

  /** Renderiza header y footer en todas las páginas para mantener consistencia */
  function renderHeaderFooter(){
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');

    if(header){
      header.innerHTML = `
        <div class="site-top">
          <div class="logo-container">
            <a href="sobre-nosotros.html" class="brand" aria-label="Helen Aloja — sobre nosotros">
              <img src="imagenes/logotrans.png" alt="Helen Aloja — logo" class="logo" />
            </a>
          </div>

          <button class="nav-toggle" aria-controls="primary-nav" aria-expanded="false" type="button">
            <span class="nav-toggle__icon" aria-hidden="true">☰</span>
            <span class="visually-hidden">Abrir menú</span>
          </button>

          <nav id="primary-nav" class="nav-menu" role="navigation" aria-label="Menú principal">
            <ul>
              <li><a href="index.html">Inicio</a></li>
              <li><a href="alojamiento.html">Alojamiento</a></li>
              <li><a href="reservas.html">Reservas</a></li>
              <li><a href="ubicacion.html">Ubicación</a></li>
              <li><a href="contacto.html">Contacto</a></li>
            </ul>
          </nav>
        </div>`;

      // Resaltar el enlace activo según la URL (compatible con nav generado dinámicamente o estático)
      const links = header.querySelectorAll('#primary-nav a, .nav-menu a, .nav a');
      const path = (window.location.pathname || '').split('/').pop() || 'index.html';
      links.forEach(a => {
        const href = a.getAttribute('href');
        if(href === path) a.classList.add('active');
      });
    }

    if(footer){
      footer.innerHTML = `
        <div class="site-footer-inner">
          <div>© ${new Date().getFullYear()} Helen Aloja</div>
          <div>Contacto: <a href="mailto:info@helenaloja.com">info@helenaloja.com</a></div>
        </div>`;
    }
  }

  /** Inicializa acordeón */
  function initAccordion(){
    const headers = document.querySelectorAll('.accordion-header');
    if(!headers.length) return;

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const body = item.querySelector('.accordion-body');

        if(isExpanded){
          // Cerrar
          header.setAttribute('aria-expanded', 'false');
          body.setAttribute('aria-hidden', 'true');
        } else {
          // Cerrar otros acordeones (opcional: comentar si se quiere permitir múltiples abiertos)
          headers.forEach(h => {
            h.setAttribute('aria-expanded', 'false');
            h.parentElement.querySelector('.accordion-body').setAttribute('aria-hidden', 'true');
          });

          // Abrir este
          header.setAttribute('aria-expanded', 'true');
          body.setAttribute('aria-hidden', 'false');
        }
      });

      // Accesibilidad: tecla Enter
      header.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  
  function initGallery(){
    const mainImg = document.getElementById('gallery-main-img');
    const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
    const currentSpan = document.getElementById('gallery-current');
    const totalSpan = document.getElementById('gallery-total');
    const prevBtn = document.querySelector('.gallery-btn-prev');
    const nextBtn = document.querySelector('.gallery-btn-next');
    const thumbsWrapper = document.querySelector('.gallery-thumbs-wrapper');

    if(!mainImg || !thumbs.length) return;

    // Actualizar contador de fotos
    if(totalSpan) totalSpan.textContent = thumbs.length;

    let currentIndex = 0;

    const setActive = (index) => {
      index = (index + thumbs.length) % thumbs.length;
      currentIndex = index;
      const thumb = thumbs[index];
      const large = thumb.dataset.large;

      // Cambiar imagen principal con animación
      mainImg.style.animation = 'none';
      setTimeout(() => {
        mainImg.src = large;
        mainImg.style.animation = 'fadeIn 0.5s ease-in-out';
      }, 10);

      // Actualizar número actual
      if(currentSpan) currentSpan.textContent = index + 1;

      // Actualizar miniaturas
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      // Scroll automático en miniaturas (centrar la miniatura activa)
      if(thumbsWrapper){
        const thumbOffset = thumb.offsetLeft - thumbsWrapper.offsetLeft;
        const thumbCenter = thumb.offsetWidth / 2;
        const containerCenter = thumbsWrapper.offsetWidth / 2;
        thumbsWrapper.scrollLeft = thumbOffset + thumbCenter - containerCenter;
      }

      thumb.focus();
    };

    // Eventos de clic en miniaturas
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => setActive(i));
      thumb.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActive(i);
        }
      });
    });

    // Botones anterior/siguiente
    if(prevBtn) prevBtn.addEventListener('click', () => setActive(currentIndex - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => setActive(currentIndex + 1));

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowRight') setActive(currentIndex + 1);
      if(e.key === 'ArrowLeft') setActive(currentIndex - 1);
    });

    // Inicializar con la primera imagen
    setActive(0);
  }

  /** Validación del formulario de reservas */
  function initBookingForm(){
    const form = document.getElementById('booking-form');
    const msg = document.getElementById('booking-message');
    if(!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.innerHTML = '';
      const data = new FormData(form);

      const name = (data.get('name')||'').trim();
      const email = (data.get('email')||'').trim();
      const checkin = data.get('checkin');
      const checkout = data.get('checkout');
      const guests = parseInt(data.get('guests'),10);

      // Validaciones básicas
      const errors = [];
      if(!name) errors.push('El nombre es obligatorio.');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Ingresa un email válido.');
      if(!checkin || !checkout) errors.push('Debe completar las fechas de ingreso y egreso.');

      const today = new Date();
      const inDate = checkin ? new Date(checkin) : null;
      const outDate = checkout ? new Date(checkout) : null;

      if(inDate && outDate){
        if(inDate >= outDate) errors.push('La fecha de egreso debe ser posterior a la de ingreso.');
        if(inDate < new Date(today.toDateString())) errors.push('La fecha de ingreso debe ser hoy o posterior.');
      }
      if(!Number.isInteger(guests) || guests < 1) errors.push('La cantidad de huéspedes debe ser al menos 1.');

      if(errors.length){
        msg.className = 'message error';
        msg.innerHTML = '<strong>Errores:</strong><ul><li>' + errors.join('</li><li>') + '</li></ul>';
        return;
      }

      // Simulamos confirmación sin recargar
      msg.className = 'message success';
      msg.innerHTML = `<strong>Reserva confirmada</strong><p>Gracias ${name}. Hemos registrado la reserva del ${checkin} al ${checkout} para ${guests} huéspedes. Te contactaremos a ${email} para más detalles.</p>`;

      form.reset();
    });
  }

  /** Validación del formulario de contacto */
  function initContactForm(){
    const form = document.getElementById('contact-form');
    const msg = document.getElementById('contact-message');
    if(!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.innerHTML = '';
      const data = new FormData(form);
      const name = (data.get('name')||'').trim();
      const email = (data.get('email')||'').trim();
      const message = (data.get('message')||'').trim();

      const errors = [];
      if(!name) errors.push('El nombre es obligatorio.');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Ingresa un email válido.');
      if(!message || message.length < 10) errors.push('El mensaje debe tener al menos 10 caracteres.');

      if(errors.length){
        msg.className = 'message error';
        msg.innerHTML = '<strong>Errores:</strong><ul><li>' + errors.join('</li><li>') + '</li></ul>';
        return;
      }

      // Simulamos envío exitoso
      msg.className = 'message success';
      msg.innerHTML = `<strong>Mensaje enviado</strong><p>Gracias ${name}. Recibimos tu mensaje y te contactaremos a ${email} pronto.</p>`;

      form.reset();
    });
  }

  // Menú hamburguesa (responsive)
  function initNavToggle(){
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav') || document.querySelector('.nav-menu');
    if(!btn || !nav) return;

    btn.addEventListener('click', function (){
      const isOpen = nav.classList.toggle('nav-menu--open');
      btn.setAttribute('aria-expanded', String(isOpen));
      const icon = btn.querySelector('.nav-toggle__icon');
      if(icon) icon.textContent = isOpen ? '✕' : '☰';
    });

    // cerrar con ESC
    document.addEventListener('keydown', function (e){
      if(e.key === 'Escape' && nav.classList.contains('nav-menu--open')){
        nav.classList.remove('nav-menu--open');
        btn.setAttribute('aria-expanded', 'false');
        const icon = btn.querySelector('.nav-toggle__icon'); if(icon) icon.textContent = '☰';
        btn.focus();
      }
    });

    // cerrar si se redimensiona a desktop
    window.addEventListener('resize', function (){
      if(window.innerWidth > 768 && nav.classList.contains('nav-menu--open')){
        nav.classList.remove('nav-menu--open');
        btn.setAttribute('aria-expanded', 'false');
        const icon = btn.querySelector('.nav-toggle__icon'); if(icon) icon.textContent = '☰';
      }
    });
  }

  // Inicializa límites en campos de fecha para reservas
  function initDateInputs(){
    const checkin = document.querySelector('input[name="checkin"]');
    const checkout = document.querySelector('input[name="checkout"]');
    if(!checkin || !checkout) return;
    const today = new Date().toISOString().split('T')[0];
    checkin.setAttribute('min', today);

    // Cuando se elige checkin, actualizar mínimo de checkout
    checkin.addEventListener('change', () => {
      if(checkin.value){
        const nextDay = new Date(checkin.value);
        nextDay.setDate(nextDay.getDate()+1);
        checkout.setAttribute('min', nextDay.toISOString().split('T')[0]);
        if(checkout.value && (new Date(checkout.value) <= new Date(checkin.value))){
          checkout.value = '';
        }
      }
    });
  }

  // Document ready
  document.addEventListener('DOMContentLoaded', () =>{
    renderHeaderFooter();
    initNavToggle();
    initAccordion();
    initGallery();
    initBookingForm();
    initContactForm();
    initDateInputs();
  });

})();

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".animate-on-load");

  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("is-visible");
    }, index * 150); // animación escalonada
  });
});

