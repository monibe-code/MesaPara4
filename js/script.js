// ============ Cargar cabecera y footer compartidos ============
// header.html y footer.html se inyectan en tiempo de carga en cada página.
// Requiere servir el sitio por http(s) (no abrir el .html directamente
// con file://), ya que usa fetch().
async function loadIncludes() {
  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');

  try {
    const [headerHTML, footerHTML] = await Promise.all([
      fetch('/header.html').then(r => r.text()),
      fetch('/footer.html').then(r => r.text())
    ]);

    if (headerSlot) headerSlot.innerHTML = headerHTML;
    if (footerSlot) footerSlot.innerHTML = footerHTML;
  } catch (err) {
    console.error('No se pudo cargar header/footer:', err);
  }

  initHeader();
  initFooterYear();
  initBackToTop();
}

// ============ Menú móvil + página activa (tras inyectar el header) ============
function initHeader() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('open'));
    });
  }

  // Resalta el enlace de la página actual comparando la URL con data-page
  const slug = window.location.pathname === '/'
    ? 'inicio'
    : window.location.pathname.replace(/^\/+|\/+$/g, '');

  document.querySelectorAll('.main-nav a[data-page]').forEach(link => {
    if (link.dataset.page === slug) link.classList.add('active');
  });
}

// ============ Año actual en el footer (tras inyectar el footer) ============
function initFooterYear() {
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

loadIncludes();

// ============ Botón "volver arriba" (tras inyectar el footer) ============
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const SHOW_AFTER = 400; // px de scroll antes de mostrar el botón

  const toggleVisibility = () => {
    btn.classList.toggle('show', window.scrollY > SHOW_AFTER);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility(); // por si la página se recarga ya con scroll

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ Animación al hacer scroll ============
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ============ Formulario de contacto ============
// Protección anti-bot sencilla para un sitio sin backend propio:
// 1) Campo "honeypot" invisible: si un bot lo rellena, se descarta el envío.
// 2) Tiempo mínimo en el formulario: los bots suelen enviar en menos de 2s.
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const loadedAt = Date.now();

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const successBox = document.querySelector('.form-success');
    const errorBox = document.querySelector('.form-error');
    successBox.style.display = 'none';
    errorBox.style.display = 'none';

    const honeypot = contactForm.querySelector('input[name="empresa_web"]');
    const elapsed = Date.now() - loadedAt;

    // Filtro de bots local (honeypot + tiempo mínimo de 2s)
    if ((honeypot && honeypot.value.trim() !== '') || elapsed < 2000) {
      // Descartado silenciosamente
      successBox.textContent = '¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible.';
      successBox.style.display = 'block';
      contactForm.reset();
      return;
    }

    // Recogemos los datos introducidos en el formulario
    const formData = new FormData(contactForm);

    // Tu clave de Web3Forms
    formData.append('access_key', '84253598-24f5-49a1-9e3d-5b9e082bf7a6');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        successBox.textContent = '¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible.';
        successBox.style.display = 'block';
        contactForm.reset();
      } else {
        errorBox.textContent = 'Ocurrió un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
        errorBox.style.display = 'block';
      }
    } catch (error) {
      errorBox.textContent = 'Error de conexión. Inténtalo más tarde.';
      errorBox.style.display = 'block';
    }
  });
}