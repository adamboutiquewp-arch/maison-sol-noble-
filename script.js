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
const floatBtns = document.getElementById('floatCall');
if (floatBtns) {
  floatBtns.style.opacity = '0';
  floatBtns.style.transform = 'translateY(20px)';
  floatBtns.style.transition = 'opacity 0.4s, transform 0.4s';
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      floatBtns.style.opacity = '1';
      floatBtns.style.transform = 'translateY(0)';
    } else {
      floatBtns.style.opacity = '0';
      floatBtns.style.transform = 'translateY(20px)';
    }
  }, { passive: true });
}

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

// ===== CARTE LEAFLET FRANCE =====
function initMap() {
  const mapEl = document.getElementById('map-france');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map-france', {
    center: [46.5, 2.5],
    zoom: 5,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false,
  });

  // Tuiles sombres CartoDB
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 10,
    minZoom: 4,
  }).addTo(map);

  // Icône personnalisée dorée
  const goldIcon = L.divIcon({
    className: '',
    html: '<div style="width:12px;height:12px;background:#c9a84c;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(201,168,76,0.8);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const villes = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
    { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
    { name: 'Lille', lat: 50.6292, lng: 3.0573 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620 },
    { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
    { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
    { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474 },
  ];

  villes.forEach(v => {
    L.marker([v.lat, v.lng], { icon: goldIcon })
      .addTo(map)
      .bindPopup(
        '<div style="font-family:Inter,sans-serif;font-size:13px;color:#111;font-weight:500;">' +
        '<span style="color:#c9a84c;">✓</span> ' + v.name + '<br>' +
        '<span style="font-size:11px;color:#666;font-weight:400;">Zone d\'intervention</span></div>',
        { closeButton: false }
      );
  });

  // Attribution minimale
  L.control.attribution({ prefix: '© CartoDB' }).addTo(map);
}

// Initialiser la carte après chargement complet
window.addEventListener('load', function() {
  setTimeout(initMap, 100);
});

// ===== FAQ ACCORDION =====
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-question.open').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}
