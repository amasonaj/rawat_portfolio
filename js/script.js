/* ═══════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ═══════════════════════════════════════════
   FADE-UP ON SCROLL
═══════════════════════════════════════════ */
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger sibling elements
            const siblings = entry.target.parentElement
                ? [...entry.target.parentElement.children].filter(c => c.classList.contains('fade-up'))
                : [];
            const idx = siblings.indexOf(entry.target);
            const delay = idx >= 0 ? idx * 80 : 0;

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);

            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ═══════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
═══════════════════════════════════════════ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 160) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
}, { passive: true });

/* ═══════════════════════════════════════════
   FLIP CARDS
═══════════════════════════════════════════ */
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('active'));
});

/* ═══════════════════════════════════════════
   THEME TOGGLE  (dark default)
═══════════════════════════════════════════ */
const toggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body      = document.body;

const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

function applyTheme(isLight) {
    body.classList.toggle('light', isLight);
    themeIcon.innerHTML = isLight ? sunSVG : moonSVG;
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Swap profile picture based on theme
    const profileImg = document.querySelector('.profile-circle img');
    if (profileImg) {
        profileImg.src = isLight ? 'assets/me_light.png' : 'assets/me_dark.png';
    }
}

// Always start dark
applyTheme(false);

toggleBtn.addEventListener('click', () => {
    applyTheme(!body.classList.contains('light'));
});

/* ═══════════════════════════════════════════
   NAV SHRINK ON SCROLL
═══════════════════════════════════════════ */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.style.padding = '0 5%';
    } else {
        nav.style.padding = '';
    }
}, { passive: true });

