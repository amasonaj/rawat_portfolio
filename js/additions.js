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


/* ─── CONTACT FORM ─── */
document.getElementById('contact-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn      = document.getElementById('send-btn');
    const statusEl = document.getElementById('form-status');
    const name     = document.getElementById('from_name').value.trim();
    const email    = document.getElementById('from_email').value.trim();
    const subject  = document.getElementById('subject').value.trim();
    const message  = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) { statusEl.textContent = '⚠ Please fill in all fields.'; statusEl.className = 'error'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { statusEl.textContent = '⚠ Please enter a valid email address.'; statusEl.className = 'error'; return; }
    if (message.length < 10) { statusEl.textContent = '⚠ Message must be at least 10 characters.'; statusEl.className = 'error'; return; }

    btn.disabled = true; btn.textContent = 'Sending…'; statusEl.textContent = '';
    try {
        const res  = await fetch('/rawat/api/submit_contact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_name: name, from_email: email, subject, message }) });
        const data = await res.json();
        if (data.success) {
            try { await emailjs.send('service_0szyrxk', 'template_94wnsrb', { from_name: name, from_email: email, subject, message }); } catch (_) {}
            statusEl.textContent = '✅ Message saved! I\'ll get back to you soon.'; statusEl.className = 'success'; this.reset();
        } else { statusEl.textContent = `❌ ${data.message}`; statusEl.className = 'error'; }
    } catch (err) { statusEl.textContent = '❌ Network error. Please try again later.'; statusEl.className = 'error'; console.error(err);
    } finally { btn.disabled = false; btn.textContent = 'Send Message'; }
});


/* ─── TESTIMONIALS ─── */
(function initTestimonials() {
    function escapeHTML(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }
    function buildCard(t) {
        const initials = t.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
        const stars = '★'.repeat(parseInt(t.rating)||0) + '☆'.repeat(5-(parseInt(t.rating)||0));
        return `<div class="testimonial-card fade-up"><p class="testimonial-card__text">${escapeHTML(t.message)}</p><div class="testimonial-card__author"><div class="testimonial-card__avatar">${initials}</div><div><div class="testimonial-card__name">${escapeHTML(t.name)}</div><div class="testimonial-card__role">${escapeHTML(t.role)}</div><div class="testimonial-stars"><span>${stars}</span></div></div></div></div>`;
    }
    function renderWall(list) {
        const wall = document.getElementById('testimonials-wall');
        if (!wall) return;
        wall.innerHTML = (!list || list.length === 0) ? `<div class="testimonials-empty-state">No testimonials yet.<br/>Be the first to leave a kind word! →</div>` : list.map(buildCard).join('');
        wall.querySelectorAll('.fade-up').forEach(el => { el.classList.add('visible'); if (window._fadeObserver) window._fadeObserver.observe(el); });
    }
    async function loadTestimonials() {
        const wall = document.getElementById('testimonials-wall');
        if (!wall) return;
        wall.innerHTML = `<div class="testimonials-empty-state">Loading…</div>`;
        try { const res = await fetch('/rawat/api/get_testimonials.php'); const data = await res.json(); renderWall(data.success ? data.testimonials : []);
        } catch (err) { const w = document.getElementById('testimonials-wall'); if (w) w.innerHTML = `<div class="testimonials-empty-state">⚠ Unable to connect.</div>`; }
    }
    const form = document.getElementById('testimonial-form');
    const statusEl = document.getElementById('testimonial-status');
    if (!form) return;
    loadTestimonials();
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const nameVal = document.getElementById('t_name').value.trim();
        const roleVal = document.getElementById('t_role').value.trim();
        const messageVal = document.getElementById('t_message').value.trim();
        const ratingInput = form.querySelector('input[name="rating"]:checked');
        const ratingVal = ratingInput ? parseInt(ratingInput.value) : 0;
        if (!nameVal) { showStatus('⚠ Please enter your name.', 'error'); return; }
        if (!roleVal) { showStatus('⚠ Please enter your role.', 'error'); return; }
        if (messageVal.length < 15) { showStatus('⚠ Message must be at least 15 characters.', 'error'); return; }
        if (ratingVal < 1) { showStatus('⚠ Please select a star rating.', 'error'); return; }
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Submitting…'; showStatus('', '');
        try {
            const res = await fetch('/rawat/api/submit_testimonial.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameVal, role: roleVal, message: messageVal, rating: ratingVal }) });
            const data = await res.json();
            if (data.success) { showStatus('✅ Thank you! Your testimonial has been posted.', 'success'); form.reset(); loadTestimonials(); }
            else { showStatus(`❌ ${data.message}`, 'error'); }
        } catch (err) { showStatus('❌ Network error. Please try again later.', 'error'); }
        finally { btn.disabled = false; btn.textContent = 'Submit Testimonial'; }
    });
    function showStatus(msg, type) {
        statusEl.textContent = msg; statusEl.className = type;
        if (msg) setTimeout(() => { if (statusEl.textContent === msg) { statusEl.textContent = ''; statusEl.className = ''; } }, 5000);
    }
})();


/* ─── Project Modal ─── */
let _slideIndex = 0, _slides = [];
function openProjectModal(data) {
    const overlay = document.getElementById('project-modal');
    const gallery = document.getElementById('proj-modal-gallery');
    const nav     = document.getElementById('proj-modal-gallery-nav');
    const title   = document.getElementById('proj-modal-title');
    const linksEl = document.getElementById('proj-modal-links');
    title.textContent = data.title;
    _slides = Array.isArray(data.screenshots) ? data.screenshots.filter(Boolean) : [];
    gallery.innerHTML = '';
    if (_slides.length === 0) { gallery.innerHTML = '<p class="no-screenshot">📷 No screenshots available yet.</p>'; nav.style.display = 'none'; }
    else {
        _slides.forEach((src, i) => { const img = document.createElement('img'); img.src = src; img.alt = `${data.title} screenshot ${i+1}`; if (i===0) img.classList.add('active'); gallery.appendChild(img); });
        nav.style.display = _slides.length > 1 ? 'flex' : 'none';
        _slideIndex = 0; updateSlideCounter();
    }
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
    if (counter) counter.textContent = `${_slideIndex+1} / ${_slides.length}`;
    document.querySelectorAll('#proj-modal-gallery img').forEach((img, i) => img.classList.toggle('active', i === _slideIndex));
}
function nextSlide() { if (_slides.length===0) return; _slideIndex = (_slideIndex+1) % _slides.length; updateSlideCounter(); }
function prevSlide() { if (_slides.length===0) return; _slideIndex = (_slideIndex-1+_slides.length) % _slides.length; updateSlideCounter(); }
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('project-modal');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key==='Escape') closeProjModal(null);
    if (e.key==='ArrowRight') nextSlide();
    if (e.key==='ArrowLeft') prevSlide();
});


/* ─── Scroll Progress ─── */
(function () {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function updateBar() { bar.style.width = (document.documentElement.scrollHeight - window.innerHeight > 0 ? (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 : 0) + '%'; }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
})();


/* ─── Typing Animation ─── */
(function () {
    const target = document.getElementById('typing-target');
    if (!target) return;
    const words = ['Developer','Bug Hunter','Problem Solver','Full-Stack Aspirant','Java Programmer'];
    let wi=0, ci=0, deleting=false, paused=false;
    const TS=80, DS=45, PA=1800, PB=350;
    function tick() {
        if (paused) { paused=false; setTimeout(tick, deleting?PB:PA); return; }
        if (!deleting) { target.textContent = words[wi].slice(0,++ci); if(ci===words[wi].length){deleting=true;paused=true;} setTimeout(tick,TS); }
        else { target.textContent = words[wi].slice(0,--ci); if(ci===0){deleting=false;paused=true;wi=(wi+1)%words.length;} setTimeout(tick,DS); }
    }
    setTimeout(tick, 600);
})();


/* ─── Footer Clock ─── */
(function () {
    const el = document.getElementById('footer-timestamp');
    if (!el) return;
    const pad = n => String(n).padStart(2,'0');
    function tick() { const n=new Date(); el.textContent=`${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())} · ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`; }
    tick(); setInterval(tick, 1000);
})();


document.addEventListener('DOMContentLoaded', function () {

    /* ─── Back to Top ─── */
    const backBtn = document.getElementById('back-to-top');
    if (backBtn) {
        const check = () => backBtn.classList.toggle('visible', window.scrollY > 400);
        window.addEventListener('scroll', check, { passive: true });
        check();
        backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ─── Custom Cursor ─── */
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        const dot = document.getElementById('cursor-dot');
        if (dot) {
            document.addEventListener('mousemove', (e) => { dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px'; dot.style.opacity='1'; });
            const hov = 'a,button,[role="button"],input,textarea,select,label,.proj-card,.skill-box,.repo-card';
            document.addEventListener('mouseover',  (e) => { if(e.target.closest(hov)) dot.classList.add('cursor-hover'); });
            document.addEventListener('mouseout',   (e) => { if(e.target.closest(hov)) dot.classList.remove('cursor-hover'); });
            document.addEventListener('mousedown',  ()  => dot.classList.add('cursor-click'));
            document.addEventListener('mouseup',    ()  => dot.classList.remove('cursor-click'));
            document.addEventListener('mouseleave', ()  => { dot.style.opacity='0'; });
            document.addEventListener('mouseenter', ()  => { dot.style.opacity='1'; });
        }
    }

    /* ═══════════════════════════════════════════════
       NAV ⋯ DROPDOWN
       ═══════════════════════════════════════════════ */
    const moreBtn  = document.getElementById('nav-more-btn');
    const moreMenu = document.getElementById('nav-more-menu');

    if (moreBtn && moreMenu) {
        function closeMenu() {
            moreMenu.classList.remove('open');
            moreBtn.setAttribute('aria-expanded', 'false');
        }
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = moreMenu.classList.toggle('open');
            moreBtn.setAttribute('aria-expanded', String(isOpen));
        });
        moreMenu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
        document.addEventListener('click', closeMenu);
    }

    (function () {
        const BREAKPOINT    = 700;
        const PRIMARY_HREFS = ['#home', '#skills', '#experience', '#about'];
        const DIVIDER_ID    = 'nav-mobile-divider';

        const moreMenu = document.getElementById('nav-more-menu');
        if (!moreMenu) return;

        // Find the four primary <li> items directly — by matching their anchor href
        // They live as direct children of .nav-links
        const primaryLis = [];
        document.querySelectorAll('.nav-links > li').forEach(li => {
            // Each primary li has ONE direct <a> child (no button inside)
            const a = li.querySelector('a');
            if (a && PRIMARY_HREFS.includes(a.getAttribute('href'))) {
                primaryLis.push(li);
            }
        });

        if (primaryLis.length === 0) {
            console.warn('Mobile nav: could not find primary nav items.');
            return;
        }

        let mobileActive = false;

        function enterMobile() {
            if (mobileActive) return;
            mobileActive = true;

            // 1. Hide originals from bar
            primaryLis.forEach(li => {
                li.style.setProperty('display', 'none', 'important');
            });

            // 2. Build clones + divider, inject at top of dropdown
            //    Use a fragment to do it in one DOM operation
            const frag = document.createDocumentFragment();

            // Clones — reversed so prepend() keeps correct top→bottom order
            [...primaryLis].reverse().forEach(li => {
                const clone = li.cloneNode(true);
                clone.setAttribute('data-mobile-clone', 'true');
                // Make sure clone is visible (not hidden)
                clone.style.removeProperty('display');
                frag.prepend(clone);
            });

            // Divider sits after the clones, before the existing items
            const divider = document.createElement('li');
            divider.id = DIVIDER_ID;
            divider.setAttribute('aria-hidden', 'true');
            divider.style.cssText = 'height:1px;background:var(--border,rgba(255,255,255,0.07));margin:0.3rem 0.5rem;pointer-events:none;list-style:none;display:block;';
            frag.appendChild(divider);

            // Inject everything at top of dropdown
            moreMenu.prepend(frag);
        }

        function exitMobile() {
            if (!mobileActive) return;
            mobileActive = false;

            // Remove clones and divider from dropdown
            moreMenu.querySelectorAll('[data-mobile-clone]').forEach(el => el.remove());
            document.getElementById(DIVIDER_ID)?.remove();

            // Restore original items in the bar
            primaryLis.forEach(li => {
                li.style.removeProperty('display');
            });
        }

        function check() {
            if (window.innerWidth <= BREAKPOINT) {
                enterMobile();
            } else {
                exitMobile();
            }
        }

        // Run now and on every resize
        check();
        window.addEventListener('resize', check, { passive: true });

    })(); // end mobile nav collapse

}); // end DOMContentLoaded