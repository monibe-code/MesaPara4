// ============ Menú móvil ============
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
// ============ Formulario de contacto ============
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


// ============ Año actual en el footer ============
document.querySelectorAll('.current-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});
