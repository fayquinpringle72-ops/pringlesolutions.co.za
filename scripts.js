document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const navlinks = document.getElementById('navlinks');

    if (burgerBtn && navlinks) {
        burgerBtn.addEventListener('click', () => navlinks.classList.toggle('open'));
        document.querySelectorAll('.navlinks a, .foot-links a').forEach(link => {
            link.addEventListener('click', () => navlinks.classList.remove('open'));
        });
    }

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navlinks a, .foot-links a').forEach(link => {
        if (link.getAttribute('href') === currentFile) {
            link.classList.add('active');
        }
    });

    const stage = document.getElementById('stage');
    const stageInner = document.getElementById('stageInner');
    if (stage && stageInner) {
        stage.addEventListener('mousemove', e => {
            const r = stage.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            stageInner.style.transform = `rotateX(${12 - y * 18}deg) rotateY(${-16 + x * 26}deg)`;
        });
        stage.addEventListener('mouseleave', () => {
            stageInner.style.transform = 'rotateX(12deg) rotateY(-16deg)';
        });
    }

    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Thanks — this is a front-end demo form. Connect it to email or a service like Formspree to actually receive messages.');
            e.target.reset();
        });
    }

    const STAGES = ['Received', 'Assessed', 'In Progress', 'Quality Check', 'Complete'];
    const tickets = [];
    let counter = 1;

    function makeId() {
        const id = 'PS-2026-' + String(counter).padStart(4, '0');
        counter++;
        return id;
    }

    function ticketHTML(t) {
        const pct = (t.stage / (STAGES.length - 1)) * 100;
        const badgeClass = t.stage === 0 ? 'received' : (t.stage === STAGES.length - 1 ? 'complete' : 'progress');
        const badgeText = STAGES[t.stage];
        return `
      <div class="ticket">
        <div class="ticket-top">
          <div>
            <div class="ticket-id">${t.id}</div>
            <div class="ticket-service">${t.service}</div>
          </div>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="trace"><div class="trace-fill" style="width:${pct}%"></div></div>
        <div class="stages">
          ${STAGES.map((s, i) => `<span class="${i <= t.stage ? 'done' : ''}">${s}</span>`).join('')}
        </div>
        <div class="ticket-meta">Logged for ${t.name} · ${t.contact}${t.details ? ' · ' + t.details : ''}</div>
      </div>
    `;
    }

    function renderTickets() {
        const list = document.getElementById('ticketList');
        if (!list) return;
        if (tickets.length === 0) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = '<h3 style="margin-bottom:14px;">Your open tickets</h3>' + tickets.slice().reverse().map(ticketHTML).join('');
    }

    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', e => {
            e.preventDefault();
            const t = {
                id: makeId(),
                name: document.getElementById('tName').value,
                contact: document.getElementById('tContact').value,
                service: document.getElementById('tService').value,
                details: document.getElementById('tDetails').value,
                stage: 0
            };
            tickets.push(t);
            renderTickets();
            e.target.reset();
            let step = t.stage;
            const interval = setInterval(() => {
                step++;
                const found = tickets.find(x => x.id === t.id);
                if (!found || step > STAGES.length - 1) { clearInterval(interval); return; }
                found.stage = step;
                renderTickets();
                if (step >= STAGES.length - 1) clearInterval(interval);
            }, 4000);
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const val = document.getElementById('searchInput').value.trim().toUpperCase();
            const result = document.getElementById('searchResult');
            const found = tickets.find(t => t.id.toUpperCase() === val);
            result.innerHTML = found ? ticketHTML(found) : `<p class="empty-note">No ticket found with that ID yet in this session. Open a new request on the right, or check the ID and try again.</p>`;
        });
    }
});
