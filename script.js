/* ============================================================
   Learntech — consolidated script
   Sections:
   01  Utilities + reduced-motion flag
   02  Enquiry popup dialog
   03  Navbar (scroll hide/show, mobile menu, scroll-spy, indicator)
   04  Reveal on scroll (.rv / #steps)
   05  Hero (changing word + parallax)
   06  AI Courses (card reveal + motherboard canvas)
   07  Browse / Programmes slider
   08  Course Finder (dropdowns + recommendation)
   09  Career carousel autoplay
   10  Sentence builder chips
   11  Logo wall loop
   12  FAQ accordion
   13  Chips scroll (arrows + drag)
   14  Testimonials drag/inertia marquee
   15  How It Works sticky stack
   16  Back to top
   17  Footer "ONLINE" word reveal
   18  Reduced-motion: pause SVG SMIL
   ============================================================ */
(function () {
    "use strict";

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       02. ENQUIRY POPUP
       ============================================================ */
    (function () {
        var enq = $('#enq'), enqForm = $('#enqForm'), enqOk = $('#enqOk'), enqErr = $('#enqErr');
        var enqGo = $('#enqGo'), enqOkText = $('#enqOkText'), enqCourse = $('#enqCourse');
        if (!enq || !enqForm) return;

        function openEnq(hint) {
            enqForm.hidden = false;
            enqOk.hidden = true;
            enqErr.hidden = true;
            if (hint) {
                var h = hint.toLowerCase();
                $$('option', enqCourse).forEach(function (o) {
                    if (o.value && h.indexOf(o.value.toLowerCase().replace('online ', '')) > -1) {
                        enqCourse.value = o.value;
                    }
                });
            }
            enq.showModal();
            document.body.classList.add('enq-open');
            setTimeout(function () { var n = $('#enqName'); if (n) n.focus(); }, 120);
        }

        enq.addEventListener('close', function () { document.body.classList.remove('enq-open'); });

        document.addEventListener('click', function (e) {
            var t = e.target.closest('[data-enq], a[href="#cta"], a[href="#get-free-counselling"]');
            if (t) {
                e.preventDefault();
                var card = t.closest('.aic-card');
                var hint = card ? ((card.querySelector('h3') || {}).textContent || '') : '';
                openEnq(hint);
                return;
            }
            if (e.target.closest('[data-enq-close]') || e.target === enq) {
                enq.close();
            }
        });

        enqForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (enqForm.elements.website && enqForm.elements.website.value) return;
            if (!enqForm.reportValidity()) return;
            enqGo.disabled = true;
            enqErr.hidden = true;
            setTimeout(function () {
                enqGo.disabled = false;
                enqForm.hidden = true;
                enqOk.hidden = false;
                enqOkText.textContent = 'We\u2019ve received your enquiry, ' +
                    (enqForm.elements.name.value || '') +
                    '. Our counsellor will call you shortly.';
                enqForm.reset();
            }, 600);
        });
    })();

    /* ============================================================
       03. NAVBAR
       ============================================================ */
    (function () {
        var nv = $('#nv'), links = $('#nvLinks'), ind = $('#nvInd');
        var btn = $('#nvToggle'), scrim = $('#nvScrim');
        if (!nv || !links || !btn) return;
        var items = $$('.nv-link', links);
        var desktop = matchMedia('(min-width:1021px)');
        var lastY = scrollY, ticking = false, active = null, lockUntil = 0;
        var idle;

        items.forEach(function (l, i) { l.style.setProperty('--i', i); });

        function isOpen() { return nv.classList.contains('is-open'); }
        function setOpen(open) {
            nv.classList.toggle('is-open', open);
            btn.setAttribute('aria-expanded', open);
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.documentElement.classList.toggle('nv-lock', open);
            if (open) nv.classList.remove('is-hidden');
        }
        btn.addEventListener('click', function () { setOpen(!isOpen()); });
        if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); }
        });
        $$('.nv-panel a', nv).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
        desktop.addEventListener('change', function () { setOpen(false); nv.classList.remove('is-hidden'); rest(); });

        function place(el) {
            ind.style.setProperty('--ix', el.offsetLeft + 'px');
            ind.style.setProperty('--iw', el.offsetWidth + 'px');
            links.classList.add('has-ind');
        }
        function rest() { if (active) { place(active); } else { links.classList.remove('has-ind'); } }

        items.forEach(function (l) {
            l.addEventListener('mouseenter', function () { if (desktop.matches) place(l); });
            l.addEventListener('focus', function () { if (desktop.matches) place(l); });
        });
        links.addEventListener('mouseleave', rest);
        links.addEventListener('focusout', rest);
        window.addEventListener('resize', rest);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);

        function onScroll() {
            var y = scrollY;
            nv.classList.toggle('is-scrolled', y > 12);
            if (!isOpen()) {
                if (y > lastY + 4 && y > 120) { nv.classList.add('is-hidden'); }
                else if (y < lastY - 4 || y <= 120) { nv.classList.remove('is-hidden'); }
            }
            clearTimeout(idle);
            idle = setTimeout(function () { nv.classList.remove('is-hidden'); }, 250);
            lastY = y;
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
        }, { passive: true });
        onScroll();

        var spyIds = {};
        items.forEach(function (a) { spyIds[a.dataset.spy] = true; });
        function mark(id) {
            var next = null;
            items.forEach(function (a) { if (a.dataset.spy === id) next = a; });
            if (next === active) return;
            items.forEach(function (a) { a.classList.toggle('is-active', a === next); });
            active = next;
            if (!(desktop.matches && links.matches(':hover'))) rest();
        }
        items.forEach(function (a) {
            a.addEventListener('click', function () {
                lockUntil = Date.now() + 1000;
                mark(a.dataset.spy);
            });
        });
        if ('IntersectionObserver' in window) {
            var spyIO = new IntersectionObserver(function (es) {
                es.forEach(function (e) {
                    if (!e.isIntersecting || Date.now() < lockUntil) return;
                    mark(spyIds[e.target.id] ? e.target.id : null);
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            $$('main > section[id], section[id]').forEach(function (s) { spyIO.observe(s); });
        }
    })();

    /* ============================================================
       04. REVEAL ON SCROLL
       ============================================================ */
    if ('IntersectionObserver' in window) {
        var revIO = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('vis', 'in');
                    revIO.unobserve(e.target);
                }
            });
        }, { threshold: .15 });
        $$('.rv, #steps').forEach(function (el) { revIO.observe(el); });
    } else {
        $$('.rv, #steps').forEach(function (el) { el.classList.add('vis', 'in'); });
    }

    /* ============================================================
       05. HERO: changing word + parallax
       ============================================================ */
    (function () {
        var cwWords = ['Programme', 'Degree', 'Specialisation', 'Certification'];
        var cwIdx = 0, cwEl = $('#cw');
        if (cwEl) {
            setInterval(function () {
                cwEl.style.opacity = 0;
                cwEl.style.transform = 'translateY(8px)';
                setTimeout(function () {
                    cwIdx = (cwIdx + 1) % cwWords.length;
                    cwEl.textContent = cwWords[cwIdx];
                    cwEl.style.opacity = 1;
                    cwEl.style.transform = 'none';
                }, 250);
            }, 3200);
        }

        var hero = $('#hero');
        if (hero && !reduce) {
            var mx = 0, my = 0, cx = 0, cy = 0;
            hero.addEventListener('mousemove', function (e) {
                var r = hero.getBoundingClientRect();
                mx = ((e.clientX - r.left) / r.width - .5) * 2;
                my = ((e.clientY - r.top) / r.height - .5) * 2;
            });
            hero.addEventListener('mouseleave', function () { mx = my = 0; });
            (function p() {
                cx += (mx * 25 - cx) * .06;
                cy += (my * 16 - cy) * .06;
                hero.style.setProperty('--mx', cx + 'px');
                hero.style.setProperty('--my', cy + 'px');
                requestAnimationFrame(p);
            })();
        }
    })();

    /* ============================================================
       06. AI COURSES
       ============================================================ */
    (function () {
        var sec = $('#aiCourses');
        if (!sec) return;
        var cards = $$('.aic-card', sec);

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (en) {
                if (en[0].isIntersecting) {
                    cards.forEach(function (c) { c.classList.add('in'); });
                    io.disconnect();
                }
            }, { threshold: .15 });
            var grid = $('.aic-grid', sec);
            if (grid) io.observe(grid);
        } else {
            cards.forEach(function (c) { c.classList.add('in'); });
        }

        cards.forEach(function (c) {
            c.addEventListener('pointermove', function (e) {
                var r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                c.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });

        var cv = $('.aic-bg', sec);
        if (!cv || !cv.getContext) return;
        var ctx = cv.getContext('2d');
        var GRID = 50, DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
        var W = 0, H = 0, traces = [], chips = [], pulses = [], raf = 0, vis = true, last = 0;
        var mouse = { x: -999, y: -999 };

        function rand(a, b) { return a + Math.random() * (b - a); }

        function pointAt(tr, dist) {
            dist = Math.max(0, Math.min(tr.length, dist));
            var i = 1;
            while (i < tr.cum.length - 1 && tr.cum[i] < dist) i++;
            var a = tr.pts[i - 1], b = tr.pts[i], t = (dist - tr.cum[i - 1]) / (tr.cum[i] - tr.cum[i - 1] || 1);
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        function spawn(tr) {
            tr = tr || traces[(Math.random() * traces.length) | 0];
            if (tr) pulses.push({ tr: tr, dist: 0, speed: rand(120, 210), tail: rand(60, 110), rev: Math.random() < .5 });
        }

        function build() {
            var r = sec.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = r.width; H = r.height;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var cols = Math.floor(W / GRID), rows = Math.floor(H / GRID), i, n;
            traces = []; chips = []; pulses = [];

            for (i = 0; i < Math.max(2, Math.round(W / 520)); i++) {
                chips.push({
                    x: (1 + Math.floor(Math.random() * Math.max(1, cols - 5))) * GRID,
                    y: (1 + Math.floor(Math.random() * Math.max(1, rows - 5))) * GRID,
                    s: Math.floor(rand(2, 3.5)) * GRID
                });
            }

            var count = Math.round(W * H / 9500);
            for (n = 0; n < count; n++) {
                var cx = Math.floor(Math.random() * cols), cy = Math.floor(Math.random() * rows), d = Math.floor(Math.random() * 8);
                var pts = [{ x: cx * GRID, y: cy * GRID }], segs = Math.floor(rand(3, 7));
                for (var s = 0; s < segs; s++) {
                    var len = Math.floor(rand(2, 6)), nx = cx + DIRS[d][0] * len, ny = cy + DIRS[d][1] * len;
                    if (nx < 0 || ny < 0 || nx > cols || ny > rows) break;
                    cx = nx; cy = ny; pts.push({ x: cx * GRID, y: cy * GRID });
                    d = (d + (Math.random() < .5 ? 1 : 7)) % 8;
                }
                if (pts.length < 3) continue;
                var cum = [0], L = 0;
                for (i = 1; i < pts.length; i++) { L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); cum.push(L); }
                traces.push({ pts: pts, cum: cum, length: L, glow: 0, hot: Math.random() < .2 });
            }
            for (i = 0; i < Math.min(16, Math.round(traces.length / 4)); i++) spawn();
            draw(0);
        }

        function draw(dt) {
            ctx.clearRect(0, 0, W, H);
            ctx.lineCap = ctx.lineJoin = 'round';
            var i, k;

            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(127,162,255,.24)';
            ctx.beginPath();
            chips.forEach(function (c) {
                ctx.rect(c.x, c.y, c.s, c.s); ctx.rect(c.x + 8, c.y + 8, c.s - 16, c.s - 16);
                for (k = 8; k < c.s - 4; k += 8) {
                    ctx.moveTo(c.x + k, c.y); ctx.lineTo(c.x + k, c.y - 6);
                    ctx.moveTo(c.x + k, c.y + c.s); ctx.lineTo(c.x + k, c.y + c.s + 6);
                    ctx.moveTo(c.x, c.y + k); ctx.lineTo(c.x - 6, c.y + k);
                    ctx.moveTo(c.x + c.s, c.y + k); ctx.lineTo(c.x + c.s + 6, c.y + k);
                }
            });
            ctx.stroke();

            traces.forEach(function (tr) {
                var near = 0;
                if (mouse.x > -900) {
                    tr.pts.forEach(function (p) {
                        var d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                        if (d < 170) near = Math.max(near, 1 - d / 170);
                    });
                }
                tr.glow = Math.max(tr.glow * .94, near);
                ctx.strokeStyle = 'rgba(' + (tr.hot ? '255,106,85' : '127,162,255') + ',' + (.13 + tr.glow * .55).toFixed(3) + ')';
                ctx.lineWidth = 1.5; ctx.beginPath();
                tr.pts.forEach(function (p, j) { j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
                ctx.stroke();
                ctx.lineWidth = 1.2;
                [tr.pts[0], tr.pts[tr.pts.length - 1]].forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 6.2832); ctx.stroke(); });
            });

            if (mouse.x > -900 && pulses.length < 24 && Math.random() < .06) {
                var lit = traces.filter(function (t) { return t.glow > .4; });
                if (lit.length) spawn(lit[(Math.random() * lit.length) | 0]);
            }

            for (i = pulses.length - 1; i >= 0; i--) {
                var p = pulses[i], tr = p.tr;
                p.dist += p.speed * dt;
                if (p.dist > tr.length + p.tail) { tr.glow = 1; pulses.splice(i, 1); spawn(); continue; }
                var col = tr.hot ? '255,106,85' : '140,175,255', head = Math.min(p.dist, tr.length);
                var pos = function (d) { return pointAt(tr, p.rev ? tr.length - d : d); };
                for (k = 0; k < 10; k++) {
                    var d0 = Math.max(0, head - p.tail * (k + 1) / 10), d1 = Math.max(0, head - p.tail * k / 10);
                    if (d1 <= 0) break;
                    var a = pos(d0), b = pos(d1);
                    ctx.strokeStyle = 'rgba(' + col + ',' + ((1 - k / 10) * .9).toFixed(3) + ')'; ctx.lineWidth = 1.6;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
                if (p.dist <= tr.length) {
                    var h = pos(p.dist), g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 7);
                    g.addColorStop(0, 'rgba(' + col + ',.8)');
                    g.addColorStop(1, 'rgba(' + col + ',0)');
                    ctx.fillStyle = g;
                    ctx.fillRect(h.x - 7, h.y - 7, 14, 14);
                }
            }
        }

        function loop(now) {
            if (!vis) { raf = 0; return; }
            draw(Math.min((now - last) / 1000, .05)); last = now;
            raf = requestAnimationFrame(loop);
        }
        function start() { if (vis && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } }

        sec.addEventListener('pointermove', function (e) {
            var r = sec.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        });
        sec.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });

        if ('ResizeObserver' in window) { new ResizeObserver(build).observe(sec); }
        else { window.addEventListener('resize', build); }
        build();

        if (!reduce) {
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (en) { vis = en[0].isIntersecting && !document.hidden; start(); }, { threshold: 0 }).observe(sec);
            } else { start(); }
            document.addEventListener('visibilitychange', function () { vis = !document.hidden; start(); });
        }
    })();

    /* ============================================================
       07. BROWSE / PROGRAMMES SLIDER
       ============================================================ */
    (function () {
        var sec = $('#browse');
        if (!sec) return;
        var vp = $('#pcT'), rail = $('#pcR'), ctl = $('#pcC');
        if (!vp || !rail) return;

        var LOGO = {
            Alliance_University: 'media/Alliance.svg',
            Amrita_University: 'media/Amrita.svg',
            Christ_University: 'media/Christ.svg',
            Chandigarh_University: 'media/icons/Chandigarh_02.svg'
        };
        var ICON = {
            biz: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18M11 13h2"/>',
            code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
            calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"/>',
            pen: '<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>',
            flask: '<path d="M9 3h6M10 3v6l-5 10a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-10V3"/><path d="M7.5 15h9"/>',
            book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/>'
        };

        var UG = [
            { cat: 'ug', tag: 'UG', icon: 'biz', name: 'Online BBA', degree: 'Bachelor of Business Administration', dur: '3 Years', fees: '\u20B91,00,000 - \u20B91,41,000', colleges: ['Alliance_University', 'Amrita_University', 'Christ_University', 'Chandigarh_University'] },
            { cat: 'ug', tag: 'UG', icon: 'code', name: 'Online BCA', degree: 'Bachelor of Computer Application', dur: '3 Years', fees: '\u20B955,485 - \u20B91,41,000', colleges: ['Amrita_University', 'Christ_University', 'Chandigarh_University'] },
            { cat: 'ug', tag: 'UG', icon: 'calc', name: 'Online B.Com', degree: 'Bachelor of Commerce', dur: '3 Years', fees: '\u20B950,635 - \u20B91,20,000', colleges: ['Amrita_University', 'Christ_University', 'Alliance_University'] },
            { cat: 'ug', tag: 'UG', icon: 'pen', name: 'Online BA', degree: 'Journalism & Mass Communication', dur: '3 Years', fees: '\u20B91,02,250 - \u20B91,35,000', colleges: ['Chandigarh_University'] }
        ];

        var PG = [
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration in Human Resources (HR)', fees: '\u20B92,20,000', colleges: ['Amrita_University'] },
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration in Marketing', fees: '\u20B92,20,000', colleges: ['Amrita_University'] },
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration in Finance', fees: '\u20B92,20,000', colleges: ['Amrita_University'] },
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration in Operations', fees: '\u20B92,24,000', colleges: ['Amrita_University'] },
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration in General Management', fees: '\u20B91,76,000', colleges: ['Amrita_University'] },
            { tag: 'MBA', icon: 'biz', name: 'Online MBA', degree: 'Master of Business Administration', fees: '\u20B91,60,000 - \u20B91,80,400', colleges: ['Alliance_University', 'Chandigarh_University'] },
            { tag: 'MCA', icon: 'code', name: 'Online MCA', degree: 'Master of Computer Application in Artificial Intelligence', fees: '\u20B91,95,000', colleges: ['Amrita_University'] },
            { tag: 'MCA', icon: 'code', name: 'Online MCA', degree: 'Master of Computer Application in Cybersecurity and AI', fees: '\u20B91,95,000', colleges: ['Amrita_University'] },
            { tag: 'MCA', icon: 'code', name: 'Online MCA', degree: 'Master of Computer Application', fees: '\u20B91,16,250 - \u20B92,30,000', colleges: ['Christ_University', 'Chandigarh_University'] },
            { tag: 'M.Com', icon: 'calc', name: 'Online M.Com', degree: 'Master of Commerce', fees: '\u20B950,000 - \u20B990,000', colleges: ['Christ_University', 'Amrita_University'] },
            { tag: 'M.Sc', icon: 'flask', name: 'Online M.Sc', degree: 'Master of Science in Data Science', fees: '\u20B91,10,000 - \u20B92,50,000', colleges: ['Christ_University', 'Chandigarh_University'] },
            { tag: 'M.Sc', icon: 'flask', name: 'Online M.Sc', degree: 'Master of Science in Artificial Intelligence and Machine Learning', fees: '\u20B92,75,000', colleges: ['Christ_University'] },
            { tag: 'M.Sc', icon: 'flask', name: 'Online M.Sc', degree: 'Master of Science in Mathematics', fees: '\u20B975,000', colleges: ['Chandigarh_University'] },
            { tag: 'MA', icon: 'book', name: 'Online MA', degree: 'Master of Arts in Applied Economics', fees: '\u20B945,000', colleges: ['Christ_University'] },
            { tag: 'MA', icon: 'book', name: 'Online MA', degree: 'Master of Arts in Economics', fees: '\u20B975,000', colleges: ['Chandigarh_University'] },
            { tag: 'MA', icon: 'book', name: 'Online MA', degree: 'Master of Arts in English with Communication', fees: '\u20B935,625', colleges: ['Christ_University'] },
            { tag: 'MA', icon: 'book', name: 'Online MA', degree: 'Master of Arts in English', fees: '\u20B975,000', colleges: ['Chandigarh_University'] },
            { tag: 'MA', icon: 'book', name: 'Online MA', degree: 'Master of Arts in Journalism', fees: '\u20B975,000', colleges: ['Chandigarh_University'] }
        ].map(function (c) { c.cat = 'pg'; c.dur = '2 Years'; return c; });

        var SVG = function (paths, sw) {
            return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
        };
        var I_DUR = SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 2);
        var I_FEE = SVG('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>', 2);
        var I_COL = SVG('<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12.5V17c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4.5"/>', 2);
        var I_ARR = SVG('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.2);

        function cardHTML(c) {
            var logos = c.colleges.map(function (n) {
                return '<span class="pg-lg" title="' + n + '"><img src="' + LOGO[n] + '" alt="' + n + '" loading="lazy" draggable="false" onerror="this.parentNode.textContent=this.alt.slice(0,3).toUpperCase()"></span>';
            }).join('');
            return '<article class="pc pgc" data-cat="' + c.cat + '">' +
                '<span class="pg-edge" aria-hidden="true"></span>' +
                '<span class="pg-tag">' + c.tag + '</span>' +
                '<div class="pc-head"><span class="pc-ico">' + SVG(ICON[c.icon], 1.8) + '</span>' +
                '<h3>' + c.name + '<span>' + c.degree + '</span></h3></div>' +
                '<div class="pg-rows">' +
                '<div class="pg-row"><small>' + I_DUR + 'Duration</small><b>' + c.dur + '</b></div>' +
                '<div class="pg-row"><small>' + I_FEE + 'Fees</small><b>' + c.fees + '</b></div>' +
                '<div class="pg-row cl"><small>' + I_COL + 'Colleges</small><div class="pg-logos">' + logos + '</div></div>' +
                '</div>' +
                '<a href="#cta" class="pg-btn" draggable="false" data-enq><span class="pg-label">Enquire Now</span><i>' + I_ARR + '</i></a>' +
                '</article>';
        }

        var cur = 0, target = 0, raf = 0;
        var down = false, moved = false, suppress = false;
        var sx = 0, st = 0, lx = 0, lt = 0, vel = 0, pid = 0;
        var hov = false, foc = false, inView = true, stamp = 0;

        function cards() { return [].slice.call(rail.children); }
        function max() { return Math.max(0, rail.scrollWidth - rail.clientWidth); }
        function clamp(v) { return Math.min(max(), Math.max(0, v)); }
        function snaps() {
            var m = max(), out = [];
            cards().forEach(function (c) {
                var x = Math.round(Math.min(c.offsetLeft, m));
                if (out.indexOf(x) < 0) out.push(x);
            });
            return out.length ? out : [0];
        }
        function nearest(x) {
            var s = snaps(), bi = 0, bd = Infinity;
            s.forEach(function (v, i) { var d = Math.abs(v - x); if (d < bd) { bd = d; bi = i; } });
            return bi;
        }
        function rubber(v) {
            var m = max();
            if (v < 0) return v * .35;
            if (v > m) return m + (v - m) * .35;
            return v;
        }
        function tick() {
            var diff = target - cur;
            cur += reduce ? diff : diff * .1;
            if (Math.abs(target - cur) < .15) cur = target;
            rail.style.transform = 'translate3d(' + (-cur).toFixed(2) + 'px,0,0)';
            raf = (cur !== target || down) ? requestAnimationFrame(tick) : 0;
        }
        function kick() { if (!raf) raf = requestAnimationFrame(tick); }
        function go(dir) {
            var s = snaps(), i = nearest(target) + dir;
            if (i >= s.length) i = 0;
            if (i < 0) i = s.length - 1;
            target = s[i];
            kick();
        }

        vp.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            down = true; moved = false; sx = lx = e.clientX; st = target; lt = performance.now(); vel = 0; pid = e.pointerId;
        });
        vp.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (!moved && Math.abs(dx) > 5) {
                moved = true; vp.classList.add('drag');
                try { vp.setPointerCapture(pid); } catch (_) { }
            }
            if (!moved) return;
            var now = performance.now();
            vel = .8 * vel + .2 * ((e.clientX - lx) / Math.max(1, now - lt));
            lx = e.clientX; lt = now;
            target = rubber(st - dx);
            kick();
        });
        function end() {
            if (!down) return;
            down = false;
            if (moved) {
                suppress = true; setTimeout(function () { suppress = false; }, 0);
                target = snaps()[nearest(clamp(target - vel * 260))];
                vp.classList.remove('drag');
            }
            stamp = Date.now();
            kick();
        }
        vp.addEventListener('pointerup', end);
        vp.addEventListener('pointercancel', end);
        vp.addEventListener('click', function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
        vp.addEventListener('dragstart', function (e) { e.preventDefault(); });

        var prevBtn = $('#pcP'), nextBtn = $('#pcN');
        if (prevBtn) prevBtn.addEventListener('click', function () { stamp = Date.now(); go(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { stamp = Date.now(); go(1); });

        vp.addEventListener('mouseenter', function () { hov = true; });
        vp.addEventListener('mouseleave', function () { hov = false; });
        vp.addEventListener('focusin', function () { foc = true; });
        vp.addEventListener('focusout', function () { foc = false; });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: .2 }).observe(sec);
        }
        setInterval(function () {
            if (reduce || hov || foc || down || !inView || document.hidden || max() === 0) return;
            if (Date.now() - stamp < 2500) return;
            go(1);
        }, 3800);

        function render(f) {
            var list = f === 'ug' ? UG : f === 'pg' ? PG : UG.concat(PG);
            rail.innerHTML = list.map(cardHTML).join('');
            cur = target = 0;
            rail.style.transform = 'translate3d(0,0,0)';
            refresh();
        }
        function unreveal() {
            cards().forEach(function (c) { c.style.setProperty('--d', '0ms'); c.classList.remove('in'); });
        }
        function reveal() {
            void rail.offsetWidth;
            cards().forEach(function (c, i) {
                c.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
                c.classList.add('in');
            });
        }

        var chips = $$('#pcF .chip');
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                if (this.classList.contains('on')) return;
                chips.forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-selected', 'false'); });
                this.classList.add('on');
                this.setAttribute('aria-selected', 'true');
                var f = this.dataset.f;
                stamp = Date.now();
                unreveal();
                setTimeout(function () { render(f); reveal(); }, 300);
            });
        });

        function refresh() {
            if (ctl) ctl.classList.toggle('off', max() === 0);
            target = snaps()[nearest(clamp(target))];
            kick();
        }
        window.addEventListener('resize', refresh);
        window.addEventListener('load', refresh);

        render('all');
        if (reduce || !('IntersectionObserver' in window)) {
            reveal();
        } else {
            var rio = new IntersectionObserver(function (en) {
                if (en[0].isIntersecting) { reveal(); rio.disconnect(); }
            }, { threshold: .15 });
            rio.observe(sec);
        }
    })();

    /* ============================================================
       08. COURSE FINDER
       ============================================================ */
    (function () {
        var root = $('[data-course-finder]');
        if (!root) return;

        function splitWords(el, text) {
            el.textContent = '';
            var words = text.split(' ');
            words.forEach(function (word, i) {
                var mask = document.createElement('span');
                mask.className = 'course-finder__word';
                var inner = document.createElement('span');
                inner.className = 'course-finder__word-inner';
                inner.style.setProperty('--i', i);
                inner.textContent = word;
                mask.appendChild(inner);
                el.appendChild(mask);
                if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
            });
        }

        var resultNames = $$('.course-finder__result-name', root);
        resultNames.forEach(function (el) { el.dataset.text = el.textContent.trim(); });

        var results = $$('.course-finder__result', root);
        var state = { field: 'business', level: 'graduate' };

        function showResult(animate) {
            results.forEach(function (item) {
                var match = item.dataset.field === state.field && item.dataset.level === state.level;
                item.hidden = !match;
                item.classList.remove('is-active');
                if (match && animate) {
                    var name = $('.course-finder__result-name', item);
                    if (name) {
                        splitWords(name, name.dataset.text);
                        void item.offsetWidth;
                        item.classList.add('is-active');
                    }
                }
            });
        }
        showResult(false);

        var dropdowns = [];

        function Dropdown(el) {
            var key = el.dataset.dropdown;
            var trigger = $('.course-finder__trigger', el);
            var menu = $('.course-finder__menu', el);
            var label = $('.course-finder__trigger-label', el);
            if (!trigger || !menu || !label) return;
            var options = $$('[role="option"]', menu);
            var selected = -1;
            options.forEach(function (o, i) { if (o.getAttribute('aria-selected') === 'true') selected = i; });
            var active = selected;
            var self = this;

            function setActive(i) {
                active = (i + options.length) % options.length;
                options.forEach(function (o, n) { o.classList.toggle('is-active', n === active); });
                menu.setAttribute('aria-activedescendant', options[active].id);
            }

            this.isOpen = function () { return el.classList.contains('is-open'); };
            this.open = function () {
                dropdowns.forEach(function (d) { if (d !== self) d.close(false); });
                el.classList.remove('is-end');
                el.classList.add('is-open');
                if (trigger.getBoundingClientRect().left + menu.offsetWidth > window.innerWidth - 12) el.classList.add('is-end');
                trigger.setAttribute('aria-expanded', 'true');
                setActive(selected);
                menu.focus({ preventScroll: true });
            };
            this.close = function (returnFocus) {
                if (!self.isOpen()) return;
                el.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
                options.forEach(function (o) { o.classList.remove('is-active'); });
                if (returnFocus) trigger.focus({ preventScroll: true });
            };

            function choose(i) {
                var changed = i !== selected;
                selected = i;
                options.forEach(function (o, n) { o.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
                if (changed) {
                    label.textContent = $('.course-finder__option-text', options[i]).textContent;
                    state[key] = options[i].dataset.value;
                    showResult(true);
                }
                self.close(true);
            }

            trigger.addEventListener('click', function () { self.isOpen() ? self.close(true) : self.open(); });
            trigger.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); self.open(); }
            });
            menu.addEventListener('keydown', function (e) {
                switch (e.key) {
                    case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
                    case 'ArrowUp': e.preventDefault(); setActive(active - 1); break;
                    case 'Home': e.preventDefault(); setActive(0); break;
                    case 'End': e.preventDefault(); setActive(options.length - 1); break;
                    case 'Enter':
                    case ' ': e.preventDefault(); choose(active); break;
                    case 'Escape': e.preventDefault(); self.close(true); break;
                    case 'Tab': self.close(false); break;
                }
            });
            options.forEach(function (o, i) {
                o.addEventListener('pointermove', function () { if (active !== i) setActive(i); });
                o.addEventListener('click', function () { choose(i); });
            });
        }

        $$('[data-dropdown]', root).forEach(function (el) { dropdowns.push(new Dropdown(el)); });

        document.addEventListener('pointerdown', function (e) {
            dropdowns.forEach(function (d) {
                if (d.isOpen && d.isOpen() && !e.target.closest('[data-dropdown]')) d.close(false);
            });
        });

        if (reduce || !('IntersectionObserver' in window)) {
            root.classList.add('is-visible');
        } else {
            root.classList.add('is-armed');
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { root.classList.add('is-visible'); observer.disconnect(); }
                });
            }, { threshold: 0.25 });
            observer.observe(root);
        }
    })();

    /* ============================================================
       09. CAREER CAROUSEL AUTOPLAY
       ============================================================ */
    (function () {
        var s = $('#ccS');
        if (!s) return;
        var t, box = s.parentNode;
        function step() {
            var c = $$('.cc', s);
            return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : s.clientWidth;
        }
        function go(d) {
            if (d > 0) {
                if (s.scrollLeft + s.clientWidth >= s.scrollWidth - 4) { s.scrollTo({ left: 0, behavior: 'smooth' }); }
                else { s.scrollBy({ left: step(), behavior: 'smooth' }); }
            } else {
                if (s.scrollLeft <= 4) { s.scrollTo({ left: s.scrollWidth, behavior: 'smooth' }); }
                else { s.scrollBy({ left: -step(), behavior: 'smooth' }); }
            }
        }
        function stop() { clearInterval(t); }
        function start() { stop(); if (!reduce) t = setInterval(function () { go(1); }, 3500); }
        var p = $('#ccP'), n = $('#ccN');
        if (p) p.onclick = function () { go(-1); start(); };
        if (n) n.onclick = function () { go(1); start(); };
        box.onmouseenter = stop;
        box.onmouseleave = start;
        box.addEventListener('touchstart', stop, { passive: true });
        box.addEventListener('touchend', function () { setTimeout(start, 2500); }, { passive: true });
        start();
    })();

    /* ============================================================
       10. SENTENCE BUILDER
       ============================================================ */
    (function () {
        var chips = $$('#chips .chip');
        if (!chips.length) return;
        var roleWord = $('#roleWord'), progWord = $('#progWord');
        chips.forEach(function (c) {
            c.onclick = function () {
                chips.forEach(function (x) { x.classList.remove('on'); });
                c.classList.add('on');
                if (roleWord) roleWord.textContent = c.dataset.role;
                if (progWord) progWord.innerHTML = c.dataset.course;
            };
        });
    })();

    /* ============================================================
       11. LOGO WALL LOOP
       ============================================================ */
    $$('.ltk').forEach(function (t) {
        $$('.lt', t).forEach(function (l) {
            var c = l.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            var img = c.querySelector('img');
            if (img) img.alt = '';
            t.appendChild(c);
        });
    });

    /* ============================================================
       12. FAQ ACCORDION
       ============================================================ */
    $$('.fq').forEach(function (q) {
        var p = $('.fqa', q);
        var btn = $('.fqb', q);
        if (!btn || !p) return;
        btn.addEventListener('click', function () {
            $$('.fq.open').forEach(function (o) {
                if (o !== q) {
                    o.classList.remove('open');
                    var pa = $('.fqa', o);
                    if (pa) pa.style.maxHeight = null;
                }
            });
            q.classList.toggle('open');
            p.style.maxHeight = q.classList.contains('open') ? p.scrollHeight + 'px' : null;
        });
    });

    /* ============================================================
       13. CHIPS SCROLL (arrows + drag)
       ============================================================ */
    $$('.chips').forEach(function (c) {
        var down = false, moved = false, sx = 0, sl = 0, l = null, r = null;

        if (c.id === 'pcF' && !c.parentNode.classList.contains('chw')) {
            var w = document.createElement('div');
            w.className = 'chw';
            c.parentNode.insertBefore(w, c);
            w.appendChild(c);
            l = document.createElement('button');
            l.type = 'button'; l.className = 'chn l'; l.textContent = '\u2039'; l.setAttribute('aria-label', 'Scroll left');
            r = document.createElement('button');
            r.type = 'button'; r.className = 'chn r'; r.textContent = '\u203A'; r.setAttribute('aria-label', 'Scroll right');
            w.appendChild(l); w.appendChild(r);
            l.onclick = function () { c.scrollBy({ left: -c.clientWidth * .6, behavior: 'smooth' }); };
            r.onclick = function () { c.scrollBy({ left: c.clientWidth * .6, behavior: 'smooth' }); };
        }

        function upd() {
            if (!l) return;
            l.hidden = c.scrollLeft <= 4;
            r.hidden = c.scrollLeft + c.clientWidth >= c.scrollWidth - 4;
        }
        c.addEventListener('scroll', upd, { passive: true });
        window.addEventListener('resize', upd);
        window.addEventListener('load', upd);
        if (window.ResizeObserver) new ResizeObserver(upd).observe(c);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(upd);
        upd();

        c.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') return;
            down = true; moved = false; sx = e.clientX; sl = c.scrollLeft;
        });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (Math.abs(dx) > 4) { moved = true; c.classList.add('drag'); }
            if (moved) c.scrollLeft = sl - dx;
        });
        window.addEventListener('pointerup', function () {
            if (!down) return;
            down = false;
            setTimeout(function () { c.classList.remove('drag'); }, 0);
        });
        c.addEventListener('click', function (e) {
            if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; return; }
            var chip = e.target.closest('.chip');
            if (chip && c.scrollWidth > c.clientWidth) {
                c.scrollTo({ left: chip.offsetLeft - (c.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
            }
        }, true);
    });

    /* ============================================================
       14. TESTIMONIALS MARQUEE
       ============================================================ */
    (function () {
        var m = $('#tmq'), tr = $('#ttk');
        if (!m || !tr) return;
        var orig = $$('.tm', tr);
        if (!orig.length) return;
        var SPEED = reduce ? 0 : 45;
        var set = 0, x = 0, inertia = 0, hover = false, down = false, moved = false;
        var sx = 0, startX = 0, lx = 0, lt = 0, vel = 0, pid = 0, last = performance.now();

        function wrap() { if (set) x = ((x % set) + set) % set; }

        function build() {
            $$('[data-c]', tr).forEach(function (e) { e.remove(); });
            var g = parseFloat(getComputedStyle(tr).columnGap) || 0;
            set = orig.reduce(function (a, e) { return a + e.offsetWidth + g; }, 0);
            var tot = set, i = 0;
            while (tot < m.offsetWidth + set) {
                var c = orig[i % orig.length].cloneNode(true);
                c.setAttribute('data-c', ''); c.setAttribute('aria-hidden', 'true');
                tr.appendChild(c); tot += c.offsetWidth + g; i++;
            }
            wrap();
        }

        function tick(now) {
            var dt = Math.min((now - last) / 1000, .05); last = now;
            if (!down) {
                if (!hover) x += SPEED * dt;
                x += inertia * dt;
                inertia *= Math.pow(.92, dt * 60);
                if (Math.abs(inertia) < 1) inertia = 0;
                wrap();
            }
            tr.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
            requestAnimationFrame(tick);
        }

        m.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
        m.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = false; });
        m.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            down = true; moved = false; inertia = 0; vel = 0;
            sx = lx = e.clientX; startX = x; lt = performance.now(); pid = e.pointerId;
        });
        m.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (!moved && Math.abs(dx) > 5) {
                moved = true; m.classList.add('drag');
                try { m.setPointerCapture(pid); } catch (_) { }
            }
            if (!moved) return;
            var now = performance.now();
            vel = .8 * vel + .2 * ((e.clientX - lx) / Math.max(1, now - lt)) * 1000;
            lx = e.clientX; lt = now;
            x = startX - dx; wrap();
        });
        function end() {
            if (!down) return;
            down = false;
            if (moved) { inertia = -vel; m.classList.remove('drag'); }
        }
        m.addEventListener('pointerup', end);
        m.addEventListener('pointercancel', end);
        m.addEventListener('dragstart', function (e) { e.preventDefault(); });

        var rt;
        window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
        build();
        requestAnimationFrame(tick);
    })();

    /* ============================================================
       15. HOW IT WORKS STACK
       ============================================================ */
    (function () {
        var stack = $('#hwStack');
        if (!stack) return;
        var cards = $$('.hw-card', stack);
        var nav = $$('#hwNav li');
        var bar = $('#hwBar');
        var tick = false;

        function clamp(v) { return Math.max(0, Math.min(1, v)); }
        function update() {
            tick = false;
            var n = cards.length, p = [0], active = 0, total = 0, i, j, k;
            for (j = 1; j < n; j++) {
                var top = parseFloat(getComputedStyle(cards[j]).top) || 0;
                p[j] = clamp(1 - (cards[j].getBoundingClientRect().top - top) / cards[j - 1].offsetHeight);
                total += p[j]; if (p[j] > .5) active = j;
            }
            for (i = 0; i < n; i++) {
                var d = 0; for (k = i + 1; k < n; k++) d += p[k];
                if (!reduce) {
                    cards[i].style.transform = 'scale(' + (1 - d * .045).toFixed(4) + ')';
                    cards[i].style.setProperty('--dim', Math.min(d * .14, .45).toFixed(3));
                }
                if (cards[i].getBoundingClientRect().top < innerHeight * .75) cards[i].classList.add('live');
            }
            nav.forEach(function (li, x) { li.classList.toggle('on', x === active); });
            if (bar) bar.style.transform = 'scaleX(' + (total / (n - 1)).toFixed(3) + ')';
        }
        function req() { if (!tick) { tick = true; requestAnimationFrame(update); } }
        window.addEventListener('scroll', req, { passive: true });
        window.addEventListener('resize', req);
        update();
    })();

    /* ============================================================
       16. BACK TO TOP
       ============================================================ */
    (function () {
        var btt = $('#backToTop');
        if (!btt) return;
        window.addEventListener('scroll', function () {
            btt.classList.toggle('show', window.scrollY > 300);
        }, { passive: true });
        btt.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    /* ============================================================
       17. FOOTER "ONLINE" WORD
       ============================================================ */
    (function () {
        var on = $('#onl'), ftr = $('.ftr');
        if (!on || !ftr) return;
        if (reduce) { on.classList.add('in'); return; }
        function show() {
            on.classList.remove('rs');
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { on.classList.add('in'); });
            });
        }
        function hide() { on.classList.add('rs'); on.classList.remove('in'); }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (es) {
                es.forEach(function (e) { e.isIntersecting ? show() : hide(); });
            }, { threshold: .25 }).observe(ftr);
        } else {
            show();
        }
    })();

    /* ============================================================
       18. REDUCED MOTION: pause SVG SMIL
       ============================================================ */
    if (reduce) {
        $$('.cta-banner__svg').forEach(function (svg) {
            if (svg.pauseAnimations) svg.pauseAnimations();
        });
    }
})();