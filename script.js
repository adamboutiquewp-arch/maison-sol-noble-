// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const urgenceHeight = document.querySelector('.urgence-bar')?.offsetHeight || 38;

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    navbar.style.top = '0';
  } else {
    navbar.classList.remove('scrolled');
    navbar.style.top = urgenceHeight + 'px';
  }
});

// ===== BURGER MENU =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos], .service-card, .why-card, .temoignage-card').forEach(el => {
  observer.observe(el);
});

// ===== FLOAT BUTTON (apparait après le hero) =====
const floatCall = document.getElementById('floatCall');
floatCall.style.opacity = '0';
floatCall.style.transform = 'translateY(20px)';
floatCall.style.transition = 'opacity 0.4s, transform 0.4s';

window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight * 0.6) {
    floatCall.style.opacity = '1';
    floatCall.style.transform = 'translateY(0)';
  } else {
    floatCall.style.opacity = '0';
    floatCall.style.transform = 'translateY(20px)';
  }
}, { passive: true });

// ===== FORMULAIRE =====
async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const successDiv = document.getElementById('formSuccess');
  const form = document.getElementById('contactForm');

  btn.disabled = true;
  btnText.textContent = 'Envoi en cours...';

  const formData = {
    nom: document.getElementById('nom').value,
    tel: document.getElementById('tel').value,
    email: document.getElementById('email').value,
    ville: document.getElementById('ville').value,
    type: document.getElementById('type').value,
    surface: document.getElementById('surface').value,
    message: document.getElementById('message').value,
  };

  // Formspree endpoint — remplace YOUR_FORM_ID par ton ID Formspree
  // Crée un compte gratuit sur formspree.io et remplace la valeur ci-dessous
  const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        ...formData,
        _subject: `Nouvelle demande de devis — ${formData.type} — ${formData.ville}`,
        _replyto: formData.email,
      }),
    });

    if (response.ok) {
      form.style.display = 'none';
      successDiv.style.display = 'flex';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error('Erreur réseau');
    }
  } catch (err) {
    // Fallback : lien mailto si Formspree non configuré
    const subject = encodeURIComponent(`Demande de devis — ${formData.type} — ${formData.ville}`);
    const body = encodeURIComponent(
      `Nom: ${formData.nom}\nTéléphone: ${formData.tel}\nEmail: ${formData.email}\nVille: ${formData.ville}\nType de sol: ${formData.type}\nSurface: ${formData.surface}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:contact@maisonsolnoble.com?subject=${subject}&body=${body}`;
    btn.disabled = false;
    btnText.textContent = 'Envoyer ma demande de devis';
  }
}

// ===== SMOOTH SCROLL pour les ancres =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== ANNÉE COPYRIGHT AUTO =====
const yearEl = document.querySelector('.footer-bottom p');
if (yearEl) {
  yearEl.textContent = yearEl.textContent.replace('2025', new Date().getFullYear());
}
