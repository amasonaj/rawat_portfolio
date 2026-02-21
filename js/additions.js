

/* ─── API #4: DEV.TO BLOG ─── */
(async () => {
    const DEVTO_USERNAME = 'amasonaj';
    const loadingEl = document.getElementById('blog-loading');
    const gridEl    = document.getElementById('blog-grid');
    if (!loadingEl || !gridEl) return;
    try {
        let res = await fetch(`https://dev.to/api/articles?username=${DEVTO_USERNAME}&per_page=6`);
        let articles = await res.json();
        if (!Array.isArray(articles) || articles.length === 0) {
            res = await fetch('https://dev.to/api/articles?tag=webdev&per_page=6&top=7');
            articles = await res.json();
        }
        loadingEl.style.display = 'none';
        if (!Array.isArray(articles) || articles.length === 0) {
            gridEl.innerHTML = `<div class="blog-empty">No articles found.<br/><a href="https://dev.to/new" target="_blank" rel="noopener">Start writing on Dev.to →</a></div>`;
            return;
        }
        gridEl.innerHTML = articles.slice(0, 6).map(a => {
            const tags  = (a.tag_list || []).slice(0, 2).join(' · ');
            const date  = new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const cover = a.cover_image ? `<img class="blog-card__cover" src="${a.cover_image}" alt="${a.title}" loading="lazy" />` : '';
            const reads = a.reading_time_minutes ? `📖 ${a.reading_time_minutes} min read` : '';
            const hearts= a.positive_reactions_count ? `♥ ${a.positive_reactions_count}` : '';
            return `
            <a class="blog-card fade-up" href="${a.url}" target="_blank" rel="noopener">
                ${cover}
                <div class="blog-card__tag">${tags || 'Dev.to'}</div>
                <h4>${a.title}</h4>
                <p>${(a.description || '').slice(0, 120)}${a.description && a.description.length > 120 ? '…' : ''}</p>
                <div class="blog-card__meta">
                    <span>${date}</span>
                    ${reads ? `<span>${reads}</span>` : ''}
                    ${hearts ? `<span>${hearts}</span>` : ''}
                </div>
            </a>`;
        }).join('');
        document.querySelectorAll('#blog-grid .fade-up').forEach(el => {
            el.classList.add('visible');
            if (window._fadeObserver) window._fadeObserver.observe(el);
        });
    } catch (err) {
        if (loadingEl) loadingEl.textContent = '⚠ Could not load blog articles.';
        console.error('Dev.to API error:', err);
    }
})();


/* ─── TRANSACTION #1: CONTACT FORM → MySQL via submit_contact.php ─── */
document.getElementById('contact-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn      = document.getElementById('send-btn');
    const statusEl = document.getElementById('form-status');
    const name     = document.getElementById('from_name').value.trim();
    const email    = document.getElementById('from_email').value.trim();
    const subject  = document.getElementById('subject').value.trim();
    const message  = document.getElementById('message').value.trim();

    // JS Validation
    if (!name || !email || !subject || !message) {
        statusEl.textContent = '⚠ Please fill in all fields.';
        statusEl.className   = 'error'; return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = '⚠ Please enter a valid email address.';
        statusEl.className   = 'error'; return;
    }
    if (message.length < 10) {
        statusEl.textContent = '⚠ Message must be at least 10 characters.';
        statusEl.className   = 'error'; return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    statusEl.textContent = '';

    try {
        // Save to MySQL
        const res  = await fetch('/rawat/api/submit_contact.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ from_name: name, from_email: email, subject, message }),
        });
        const data = await res.json();

        if (data.success) {
            // Also send email notification via EmailJS (non-critical)
            try {
                await emailjs.send('service_0szyrxk', 'template_94wnsrb', {
                    from_name: name, from_email: email, subject, message,
                });
            } catch (_) {}

            statusEl.textContent = '✅ Message saved! I\'ll get back to you soon.';
            statusEl.className   = 'success';
            this.reset();
        } else {
            statusEl.textContent = `❌ ${data.message}`;
            statusEl.className   = 'error';
        }
    } catch (err) {
        statusEl.textContent = '❌ Network error. Please try again later.';
        statusEl.className   = 'error';
        console.error(err);
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Send Message';
    }
});


/* ─── TRANSACTION #2: TESTIMONIAL FORM → MySQL via submit_testimonial.php ─── */
(function initTestimonials() {

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function buildCard(t) {
        const initials = t.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
        const rating   = parseInt(t.rating) || 0;
        const stars    = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return `
        <div class="testimonial-card fade-up">
            <p class="testimonial-card__text">${escapeHTML(t.message)}</p>
            <div class="testimonial-card__author">
                <div class="testimonial-card__avatar">${initials}</div>
                <div>
                    <div class="testimonial-card__name">${escapeHTML(t.name)}</div>
                    <div class="testimonial-card__role">${escapeHTML(t.role)}</div>
                    <div class="testimonial-stars"><span>${stars}</span></div>
                </div>
            </div>
        </div>`;
    }

    function renderWall(list) {
        const wall = document.getElementById('testimonials-wall');
        if (!wall) return;
        if (!list || list.length === 0) {
            wall.innerHTML = `<div class="testimonials-empty-state">No testimonials yet.<br/>Be the first to leave a kind word! →</div>`;
            return;
        }
        wall.innerHTML = list.map(buildCard).join('');
        wall.querySelectorAll('.fade-up').forEach(el => {
            el.classList.add('visible'); 
            if (window._fadeObserver) window._fadeObserver.observe(el);
        });
    }

    async function loadTestimonials() {
        const wall = document.getElementById('testimonials-wall');
        if (!wall) return;
        wall.innerHTML = `<div class="testimonials-empty-state">Loading…</div>`;
        try {
            const res  = await fetch('/rawat/api/get_testimonials.php');
            const data = await res.json();
            renderWall(data.success ? data.testimonials : []);
        } catch (err) {
            const wall = document.getElementById('testimonials-wall');
            if (wall) wall.innerHTML = `<div class="testimonials-empty-state">⚠ Unable to connect.<br/>Please try again later.</div>`;
            console.error(err);
        }
    }

    const form     = document.getElementById('testimonial-form');
    const statusEl = document.getElementById('testimonial-status');
    if (!form) return;

    loadTestimonials();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameVal    = document.getElementById('t_name').value.trim();
        const roleVal    = document.getElementById('t_role').value.trim();
        const messageVal = document.getElementById('t_message').value.trim();
        const ratingInput= form.querySelector('input[name="rating"]:checked');
        const ratingVal  = ratingInput ? parseInt(ratingInput.value) : 0;

        // JS Validation
        if (!nameVal)              { showStatus('⚠ Please enter your name.', 'error'); return; }
        if (!roleVal)              { showStatus('⚠ Please enter your role.', 'error'); return; }
        if (messageVal.length < 15){ showStatus('⚠ Message must be at least 15 characters.', 'error'); return; }
        if (ratingVal < 1)         { showStatus('⚠ Please select a star rating.', 'error'); return; }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Submitting…';
        showStatus('', '');

        try {
            // POST to PHP → MySQL
            const res  = await fetch('/rawat/api/submit_testimonial.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ name: nameVal, role: roleVal, message: messageVal, rating: ratingVal }),
            });
            const data = await res.json();

            if (data.success) {
                showStatus('✅ Thank you! Your testimonial has been posted.', 'success');
                form.reset();
                loadTestimonials(); // Refresh wall from DB
            } else {
                showStatus(`❌ ${data.message}`, 'error');
            }
        } catch (err) {
            showStatus('❌ Network error. Please try again later.', 'error');
            console.error(err);
        } finally {
            btn.disabled    = false;
            btn.textContent = 'Submit Testimonial';
        }
    });

    function showStatus(msg, type) {
        statusEl.textContent = msg;
        statusEl.className   = type;
        if (msg) setTimeout(() => { if (statusEl.textContent === msg) { statusEl.textContent = ''; statusEl.className = ''; } }, 5000);
    }
})();

/* ── Project Screenshot Modal ── */
let _slideIndex = 0;
let _slides     = [];

function openProjectModal(data) {
    const overlay  = document.getElementById('project-modal');
    const gallery  = document.getElementById('proj-modal-gallery');
    const nav      = document.getElementById('proj-modal-gallery-nav');
    const title    = document.getElementById('proj-modal-title');
    const linksEl  = document.getElementById('proj-modal-links');

    // Title
    title.textContent = data.title;

    // Screenshots gallery
    _slides = Array.isArray(data.screenshots) ? data.screenshots.filter(Boolean) : [];
    gallery.innerHTML = '';

    if (_slides.length === 0) {
        gallery.innerHTML = '<p class="no-screenshot">📷 No screenshots available yet.</p>';
        nav.style.display = 'none';
    } else {
        _slides.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${data.title} screenshot ${i + 1}`;
            if (i === 0) img.classList.add('active');
            gallery.appendChild(img);
        });

        if (_slides.length > 1) {
            nav.style.display = 'flex';
        } else {
            nav.style.display = 'none';
        }
        _slideIndex = 0;
        updateSlideCounter();
    }

    // Links
    let linksHTML = '';
    if (data.demo)   linksHTML += `<a class="btn-demo"   href="${data.demo}"   target="_blank" rel="noopener">🔗 Live Demo</a>`;
    if (data.github) linksHTML += `<a class="btn-github" href="${data.github}" target="_blank" rel="noopener">📂 GitHub</a>`;
    linksEl.innerHTML = linksHTML;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProjModal(event) {
    if (event && event.target !== document.getElementById('project-modal')) return;
    document.getElementById('project-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function updateSlideCounter() {
    const counter = document.getElementById('proj-slide-counter');
    if (counter) counter.textContent = `${_slideIndex + 1} / ${_slides.length}`;

    const imgs = document.querySelectorAll('#proj-modal-gallery img');
    imgs.forEach((img, i) => {
        img.classList.toggle('active', i === _slideIndex);
    });
}

function nextSlide() {
    if (_slides.length === 0) return;
    _slideIndex = (_slideIndex + 1) % _slides.length;
    updateSlideCounter();
}

function prevSlide() {
    if (_slides.length === 0) return;
    _slideIndex = (_slideIndex - 1 + _slides.length) % _slides.length;
    updateSlideCounter();
}

// Keyboard nav
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('project-modal');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      closeProjModal(null);
    if (e.key === 'ArrowRight')  nextSlide();
    if (e.key === 'ArrowLeft')   prevSlide();
});

(function () {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function updateBar() {
        const scrollTop    = window.scrollY;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width    = pct + '%';
    }

    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
})();


/* ════════════════════════════════
   2. Typing Animation
   ════════════════════════════════ */
(function () {
    const target = document.getElementById('typing-target');
    if (!target) return;

    const words = [
        'Developer',
        'Bug Hunter',
        'Problem Solver',
        'Full-Stack Aspirant',
        'Java Programmer',
    ];

    let wordIndex  = 0;
    let charIndex  = 0;
    let isDeleting = false;
    let isPaused   = false;

    const TYPE_SPEED   = 80;   // ms per character typed
    const DELETE_SPEED = 45;   // ms per character deleted
    const PAUSE_AFTER  = 1800; // ms to hold before deleting
    const PAUSE_BEFORE = 350;  // ms to hold before typing next word

    function tick() {
        const currentWord = words[wordIndex];

        if (isPaused) {
            isPaused = false;
            setTimeout(tick, isDeleting ? PAUSE_BEFORE : PAUSE_AFTER);
            return;
        }

        if (!isDeleting) {
            // Typing forward
            charIndex++;
            target.textContent = currentWord.slice(0, charIndex);

            if (charIndex === currentWord.length) {
                // Word complete — pause before deleting
                isDeleting = true;
                isPaused   = true;
                setTimeout(tick, TYPE_SPEED);
            } else {
                setTimeout(tick, TYPE_SPEED);
            }
        } else {
            // Deleting
            charIndex--;
            target.textContent = currentWord.slice(0, charIndex);

            if (charIndex === 0) {
                // Deletion complete — move to next word
                isDeleting = false;
                isPaused   = true;
                wordIndex  = (wordIndex + 1) % words.length;
                setTimeout(tick, DELETE_SPEED);
            } else {
                setTimeout(tick, DELETE_SPEED);
            }
        }
    }

    // Small initial delay so page has loaded visually
    setTimeout(tick, 600);
})();


document.addEventListener('DOMContentLoaded', function () {

    /* ════════════════════════════════
       1. Back to Top
       ════════════════════════════════ */
    const btn = document.getElementById('back-to-top');

    if (btn) {
        const SHOW_AFTER = 400;

        function checkScroll() {
            if (window.scrollY > SHOW_AFTER) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll(); // run once on load

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* ════════════════════════════════
       2. Minimal Custom Cursor
       ════════════════════════════════ */

    // Skip on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const dot = document.getElementById('cursor-dot');
    if (!dot) return;

    // Follow mouse exactly — no lag, no ring
    document.addEventListener('mousemove', function (e) {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
        dot.style.opacity = '1';
    });

    // Grow slightly on hoverable elements
    const hoverEls = 'a, button, [role="button"], input, textarea, select, label, .proj-card, .skill-box, .repo-card';

    document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverEls)) dot.classList.add('cursor-hover');
    });

    document.addEventListener('mouseout', function (e) {
        if (e.target.closest(hoverEls)) dot.classList.remove('cursor-hover');
    });

    // Shrink on click
    document.addEventListener('mousedown', function () { dot.classList.add('cursor-click'); });
    document.addEventListener('mouseup',   function () { dot.classList.remove('cursor-click'); });

    // Fade out when leaving window
    document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; });

});

(function () {
    const el = document.getElementById('footer-timestamp');
    if (!el) return;

    const pad = n => String(n).padStart(2, '0');

    function tick() {
        const now  = new Date();
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        el.textContent = `${date} · ${time}`;
    }

    tick();
    setInterval(tick, 1000); // live clock — remove setInterval if you want static load time
})();


(function () {
    const btn  = document.getElementById('nav-more-btn');
    const menu = document.getElementById('nav-more-menu');
    if (!btn || !menu) return;

    // Toggle on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking a menu link
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    });
})();