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

// ===== FORMULAIRE — envoie dans Supabase comme "lead" =====
const SUPA_URL = '__SUPABASE_URL__';
const SUPA_KEY = '__SUPABASE_ANON_KEY__';

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const successDiv = document.getElementById('formSuccess');
  const form = document.getElementById('contactForm');

  btn.disabled = true;
  btnText.textContent = 'Envoi en cours...';

  const num = 'LEAD-' + Date.now().toString().slice(-6);
  const formData = {
    numero: num,
    client_nom: document.getElementById('nom').value,
    client_tel: document.getElementById('tel').value,
    client_email: document.getElementById('email').value,
    ville: document.getElementById('ville').value,
    type_sol: document.getElementById('type').value.toLowerCase().replace(' massif','').replace('autre pierre naturelle','marbre'),
    travaux: 'Demande de devis',
    surface: document.getElementById('surface').value || '0',
    etat: 'moyen',
    description: document.getElementById('message').value,
    prix_m2: 0,
    montant_ht: 0,
    statut: 'Nouveau',
    created_at: new Date().toISOString(),
    source: 'site_vitrine',
  };

  try {
    const response = await fetch(`${SUPA_URL}/rest/v1/devis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok || response.status === 201) {
      form.style.display = 'none';
      successDiv.style.display = 'flex';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error('Erreur réseau');
    }
  } catch (err) {
    // Fallback mailto si Supabase inaccessible
    const subject = encodeURIComponent(`Demande de devis — ${formData.type_sol} — ${formData.ville}`);
    const body = encodeURIComponent(
      `Nom: ${formData.client_nom}\nTéléphone: ${formData.client_tel}\nEmail: ${formData.client_email}\nVille: ${formData.ville}\nType de sol: ${document.getElementById('type').value}\nSurface: ${formData.surface}\n\nMessage:\n${formData.description}`
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
  yearEl.textContent = '© ' + new Date().getFullYear() + ' Maison Sol Noble · Tous droits réservés';
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

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 10,
    minZoom: 4,
  }).addTo(map);

  const goldIcon = L.divIcon({
    className: '',
    html: '<div style="width:12px;height:12px;background:#c9a84c;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(201,168,76,0.8);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const villes = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Neuilly-sur-Seine', lat: 48.8846, lng: 2.2693 },
    { name: 'Versailles', lat: 48.8014, lng: 2.1301 },
    { name: 'Saint-Germain-en-Laye', lat: 48.8989, lng: 2.0940 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620 },
    { name: 'Cannes', lat: 43.5528, lng: 7.0174 },
    { name: 'Antibes', lat: 43.5808, lng: 7.1239 },
    { name: 'Saint-Tropez', lat: 43.2677, lng: 6.6399 },
    { name: 'Monaco', lat: 43.7384, lng: 7.4246 },
    { name: 'Biarritz', lat: 43.4832, lng: -1.5586 },
    { name: 'Bayonne', lat: 43.4933, lng: -1.4748 },
    { name: 'Saint-Jean-de-Luz', lat: 43.3895, lng: -1.6600 },
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

  L.control.attribution({ prefix: '© CartoDB' }).addTo(map);
}

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
